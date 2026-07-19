export interface UserSession {
  email: string;
  name: string;
  picture: string;
  exp?: number;
}

const DEFAULT_SECRET = 'default-dev-jwt-secret-do-not-use-in-production-1234567890';

/** Keep JWT tiny — huge Google avatar URLs blow the ~4KB cookie budget and browsers drop the cookie. */
const MAX_PICTURE_CHARS = 180;

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

/** UTF-8 safe base64url (btoa alone breaks on non-Latin1 names). */
function base64UrlEncode(value: string): string {
  const bytes = new TextEncoder().encode(value);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]!);
  }
  return btoa(binary).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

function base64UrlDecode(value: string): string {
  const padded = value + '==='.slice((value.length + 3) % 4);
  const binary = atob(padded.replace(/-/g, '+').replace(/_/g, '/'));
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new TextDecoder().decode(bytes);
}

function compactPicture(picture?: string): string {
  if (!picture) return '';
  if (picture.length <= MAX_PICTURE_CHARS) return picture;
  return '';
}

export function avatarForSession(user: Pick<UserSession, 'email' | 'picture'>): string {
  if (user.picture) return user.picture;
  const seed = encodeURIComponent(user.email || 'curator');
  return `https://api.dicebear.com/7.x/adventurer/svg?seed=${seed}`;
}

/**
 * Signs a payload to generate a JWT using standard Web Crypto API
 * (Compatible with Edge runtime and Next.js middleware / proxy)
 */
export async function signJWT(
  payload: UserSession,
  secret: string = getJwtSecret()
): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const header = { alg: 'HS256', typ: 'JWT' };
  const exp = payload.exp || Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30;
  const payloadWithExp = {
    email: payload.email,
    name: (payload.name || '').slice(0, 80),
    picture: compactPicture(payload.picture),
    exp,
  };

  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(payloadWithExp));

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
export async function verifyJWT(
  token: string,
  secret: string = getJwtSecret()
): Promise<UserSession | null> {
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

    const signatureBinary = atob(encodedSignature.replace(/-/g, '+').replace(/_/g, '/'));
    const signatureBuffer = new Uint8Array(signatureBinary.length);
    for (let i = 0; i < signatureBinary.length; i++) {
      signatureBuffer[i] = signatureBinary.charCodeAt(i);
    }

    const isValid = await crypto.subtle.verify(
      'HMAC',
      key,
      signatureBuffer,
      encoder.encode(`${encodedHeader}.${encodedPayload}`)
    );

    if (!isValid) return null;

    const payload = JSON.parse(base64UrlDecode(encodedPayload)) as UserSession;

    if (payload.exp && Date.now() > payload.exp * 1000) {
      return null;
    }

    if (!payload.email) return null;

    return {
      email: payload.email,
      name: payload.name || payload.email,
      picture: payload.picture || '',
      exp: payload.exp,
    };
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
    access_type: 'online',
    response_type: 'code',
    // Don't force consent every login — session cookie handles persistence
    prompt: 'select_account',
    scope: [
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/userinfo.email',
    ].join(' '),
    state,
  };

  const qs = new URLSearchParams(options).toString();
  return `${rootUrl}?${qs}`;
}

interface GoogleTokensResult {
  access_token: string;
  expires_in: number;
  refresh_token?: string;
  scope: string;
  token_type: string;
  id_token: string;
}

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

export async function getGoogleUserProfile(accessToken: string): Promise<GoogleUserResult> {
  const url = 'https://www.googleapis.com/oauth2/v3/userinfo';
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to fetch Google user profile: ${errorText}`);
  }

  const data = await response.json();
  // v3 uses `picture` + `email`; normalize optional fields
  return {
    id: data.sub || data.id || '',
    email: data.email || '',
    verified_email: data.email_verified ?? data.verified_email ?? false,
    name: data.name || data.email || '',
    given_name: data.given_name || '',
    family_name: data.family_name || '',
    picture: data.picture || '',
    locale: data.locale || '',
  };
}

export function isEmailAllowed(email: string): boolean {
  const allowedStr = process.env.ALLOWED_EMAILS || '';
  const allowedList = allowedStr
    .split(/[,;\n]/)
    .map((e) => e.trim().toLowerCase().replace(/^['"]|['"]$/g, ''))
    .filter(Boolean);

  if (allowedList.length === 0) {
    return false;
  }

  return allowedList.includes(email.toLowerCase().trim());
}

export type SessionGateReason = 'ok' | 'no-cookie' | 'bad-jwt' | 'not-allowlisted';

function decodeCookieToken(token: string): string {
  try {
    // Session cookies may be encodeURIComponent'd for safe Set-Cookie serialization
    return decodeURIComponent(token);
  } catch {
    return token;
  }
}

export async function inspectSession(
  token: string | undefined | null
): Promise<{ user: UserSession | null; reason: SessionGateReason }> {
  if (!token) return { user: null, reason: 'no-cookie' };
  const user = await verifyJWT(decodeCookieToken(token));
  if (!user?.email) return { user: null, reason: 'bad-jwt' };
  if (!isEmailAllowed(user.email)) return { user: null, reason: 'not-allowlisted' };
  return { user, reason: 'ok' };
}

/**
 * Verify session cookie AND re-check ALLOWED_EMAILS on every request.
 */
export async function requireAllowedSession(
  token: string | undefined | null
): Promise<UserSession | null> {
  const { user } = await inspectSession(token);
  return user;
}

/**
 * Sanitizes external redirects to prevent Open Redirect vulnerabilities.
 * Allows relative paths including query strings (e.g. /editorial?workspace=x).
 */
export function sanitizeRedirect(url: string | null | undefined): string {
  if (!url) return '/editorial';

  if (url.startsWith('/') && !url.startsWith('//')) {
    return url;
  }

  return '/editorial';
}
