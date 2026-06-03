import { cookies } from 'next/headers';

export interface UserSession {
  email: string;
  name: string;
  picture: string;
  exp?: number;
}

const DEFAULT_SECRET = 'default-dev-jwt-secret-do-not-use-in-production-1234567890';

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('FATAL: JWT_SECRET environment variable is not configured in production.');
    }
    return DEFAULT_SECRET;
  }
  return secret;
}

/**
 * Signs a payload to generate a JWT using standard Web Crypto API
 * (Compatible with Edge runtime and Next.js middleware)
 */
export async function signJWT(payload: UserSession, secret: string = getJwtSecret()): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const header = { alg: 'HS256', typ: 'JWT' };
  const encodedHeader = btoa(JSON.stringify(header))
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
  
  // Set default expiration (7 days) if not provided
  const exp = payload.exp || Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7;
  const payloadWithExp = { ...payload, exp };
  
  const encodedPayload = btoa(JSON.stringify(payloadWithExp))
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

  const signatureBuffer = await crypto.subtle.sign(
    'HMAC',
    key,
    encoder.encode(`${encodedHeader}.${encodedPayload}`)
  );

  const signatureArray = Array.from(new Uint8Array(signatureBuffer));
  const encodedSignature = btoa(String.fromCharCode(...signatureArray))
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

  return `${encodedHeader}.${encodedPayload}.${encodedSignature}`;
}

/**
 * Verifies a JWT and returns the payload using standard Web Crypto API
 */
export async function verifyJWT(token: string, secret: string = getJwtSecret()): Promise<UserSession | null> {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const [encodedHeader, encodedPayload, encodedSignature] = parts;

    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    );

    // Decode signature from base64url
    const signatureBinary = atob(encodedSignature.replace(/-/g, '+').replace(/_/g, '/'));
    const signatureBuffer = new Uint8Array(signatureBinary.length);
    for (let i = 0; i < signatureBinary.length; i++) {
      signatureBuffer[i] = signatureBinary.charCodeAt(i);
    }

    const data = encoder.encode(`${encodedHeader}.${encodedPayload}`);
    const isValid = await crypto.subtle.verify('HMAC', key, signatureBuffer, data);

    if (!isValid) return null;

    // Decode payload
    const payloadJson = atob(encodedPayload.replace(/-/g, '+').replace(/_/g, '/'));
    const payload = JSON.parse(payloadJson) as UserSession;

    // Check expiration
    if (payload.exp && Date.now() > payload.exp * 1000) {
      return null;
    }

    return payload;
  } catch (error) {
    console.error('JWT Verification Error:', error);
    return null;
  }
}

/**
 * Generates the redirect URL for Google OAuth
 */
export function getGoogleOAuthUrl(redirectUri: string, state: string): string {
  const rootUrl = 'https://accounts.google.com/o/oauth2/v2/auth';
  const options = {
    redirect_uri: redirectUri,
    client_id: process.env.GOOGLE_CLIENT_ID || '',
    access_type: 'offline',
    response_type: 'code',
    prompt: 'consent',
    scope: [
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/userinfo.email',
    ].join(' '),
    state,
  };

  const qs = new URLSearchParams(options).toString();
  return `${rootUrl}?${qs}`;
}

/**
 * Google token response interface
 */
interface GoogleTokensResult {
  access_token: string;
  expires_in: number;
  refresh_token?: string;
  scope: string;
  token_type: string;
  id_token: string;
}

/**
 * Exchanges authorization code for tokens
 */
export async function getGoogleTokens(code: string, redirectUri: string): Promise<GoogleTokensResult> {
  const url = 'https://oauth2.googleapis.com/token';
  const values = {
    code,
    client_id: process.env.GOOGLE_CLIENT_ID || '',
    client_secret: process.env.GOOGLE_CLIENT_SECRET || '',
    redirect_uri: redirectUri,
    grant_type: 'authorization_code',
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams(values).toString(),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to exchange Google OAuth code: ${errorText}`);
  }

  return response.json();
}

/**
 * Google user profile info interface
 */
export interface GoogleUserResult {
  id: string;
  email: string;
  verified_email: boolean;
  name: string;
  given_name: string;
  family_name: string;
  picture: string;
  locale: string;
}

/**
 * Fetches the user profile from Google using the access token
 */
export async function getGoogleUserProfile(accessToken: string): Promise<GoogleUserResult> {
  const url = `https://www.googleapis.com/oauth2/v3/userinfo?alt=json&access_token=${accessToken}`;
  const response = await fetch(url);

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to fetch Google user profile: ${errorText}`);
  }

  return response.json();
}

/**
 * Checks if the email address is allowed to access the editorial board
 */
export function isEmailAllowed(email: string): boolean {
  const allowedStr = process.env.ALLOWED_EMAILS || '';
  const allowedList = allowedStr
    .split(',')
    .map(e => e.trim().toLowerCase())
    .filter(Boolean);
  
  // For safety, if allowed emails configuration is missing completely, allow nothing
  if (allowedList.length === 0) {
    return false;
  }
  
  return allowedList.includes(email.toLowerCase());
}

/**
 * Sanitizes external redirects to prevent Open Redirect vulnerabilities.
 * Only relative paths starting with / are allowed.
 */
export function sanitizeRedirect(url: string | null | undefined): string {
  if (!url) return '/editorial';
  
  // Check if it's a relative path starting with '/' but not '//' (which browser parses as protocol-relative)
  if (url.startsWith('/') && !url.startsWith('//')) {
    return url;
  }
  
  return '/editorial';
}
