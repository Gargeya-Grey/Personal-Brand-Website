import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import {
  getGoogleTokens,
  getGoogleUserProfile,
  isEmailAllowed,
  signJWT,
  sanitizeRedirect,
} from '@/lib/auth';
import {
  clearOauthCookies,
  getSessionCookieOptions,
  readCookieValue,
  setAuthSessionCookie,
  SESSION_MAX_AGE_SEC,
} from '@/lib/session-cookie';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const state = requestUrl.searchParams.get('state');

  const cookieStore = await cookies();
  const stateCookie = readCookieValue(cookieStore.get('oauth_state')?.value);
  const storedCallbackUrl = readCookieValue(cookieStore.get('oauth_callback_url')?.value);
  const storedRedirectUri = readCookieValue(cookieStore.get('oauth_redirect_uri')?.value);

  if (!state || !stateCookie || state !== stateCookie) {
    const res = NextResponse.redirect(
      new URL('/login?error=AuthFailed&reason=oauth_state', request.url)
    );
    clearOauthCookies(res, requestUrl);
    return res;
  }

  if (!code) {
    const res = NextResponse.redirect(
      new URL('/login?error=AuthFailed&reason=missing_code', request.url)
    );
    clearOauthCookies(res, requestUrl);
    return res;
  }

  try {
    const redirectUri = storedRedirectUri || `${requestUrl.origin}/api/auth/callback`;
    const tokens = await getGoogleTokens(code, redirectUri);
    const profile = await getGoogleUserProfile(tokens.access_token);

    if (!profile.email || !isEmailAllowed(profile.email)) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('error', 'AccessDenied');
      loginUrl.searchParams.set('email', profile.email || '');
      const res = NextResponse.redirect(loginUrl);
      clearOauthCookies(res, requestUrl);
      return res;
    }

    const sessionToken = await signJWT({
      email: profile.email,
      name: profile.name,
      picture: profile.picture,
    });

    const targetPath = sanitizeRedirect(storedCallbackUrl);
    const redirectResponse = NextResponse.redirect(new URL(targetPath, request.url));
    clearOauthCookies(redirectResponse, requestUrl);
    setAuthSessionCookie(redirectResponse, sessionToken, requestUrl);

    // Also set via cookies() API (App Router) so the jar definitely receives it
    try {
      cookieStore.set('auth_session', sessionToken, getSessionCookieOptions(SESSION_MAX_AGE_SEC, requestUrl));
    } catch (err) {
      console.error('cookies().set auth_session failed:', err);
    }

    redirectResponse.headers.set('Cache-Control', 'private, no-store');
    return redirectResponse;
  } catch (error: unknown) {
    console.error('Google OAuth Callback Error:', error);
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('error', 'AuthFailed');
    loginUrl.searchParams.set('reason', 'token_exchange');
    const res = NextResponse.redirect(loginUrl);
    clearOauthCookies(res, requestUrl);
    return res;
  }
}
