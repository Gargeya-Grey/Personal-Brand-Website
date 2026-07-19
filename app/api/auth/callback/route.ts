import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import {
  getGoogleTokens,
  getGoogleUserProfile,
  isEmailAllowed,
  signJWT,
  sanitizeRedirect,
} from '@/lib/auth';
import { setAuthSessionCookie } from '@/lib/session-cookie';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const state = requestUrl.searchParams.get('state');

  const cookieStore = await cookies();
  const stateCookie = cookieStore.get('oauth_state')?.value;
  const storedCallbackUrl = cookieStore.get('oauth_callback_url')?.value;

  const clearOauthTemps = (response: NextResponse) => {
    response.cookies.set('oauth_state', '', { path: '/', maxAge: 0 });
    response.cookies.set('oauth_callback_url', '', { path: '/', maxAge: 0 });
  };

  if (!state || !stateCookie || state !== stateCookie) {
    const res = NextResponse.redirect(new URL('/login?error=AuthFailed', request.url));
    clearOauthTemps(res);
    return res;
  }

  if (!code) {
    const res = NextResponse.redirect(new URL('/login?error=AuthFailed', request.url));
    clearOauthTemps(res);
    return res;
  }

  try {
    const redirectUri = `${requestUrl.origin}/api/auth/callback`;
    const tokens = await getGoogleTokens(code, redirectUri);
    const profile = await getGoogleUserProfile(tokens.access_token);

    if (!profile.email || !isEmailAllowed(profile.email)) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('error', 'AccessDenied');
      loginUrl.searchParams.set('email', profile.email || '');
      const res = NextResponse.redirect(loginUrl);
      clearOauthTemps(res);
      return res;
    }

    const sessionToken = await signJWT({
      email: profile.email,
      name: profile.name,
      picture: profile.picture,
    });

    const targetPath = sanitizeRedirect(storedCallbackUrl);
    const redirectResponse = NextResponse.redirect(new URL(targetPath, request.url));
    clearOauthTemps(redirectResponse);
    setAuthSessionCookie(redirectResponse, sessionToken, requestUrl);

    // Prevent caches from storing the authenticated landing response
    redirectResponse.headers.set('Cache-Control', 'private, no-store');

    return redirectResponse;
  } catch (error: unknown) {
    console.error('Google OAuth Callback Error:', error);
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('error', 'AuthFailed');
    const res = NextResponse.redirect(loginUrl);
    clearOauthTemps(res);
    return res;
  }
}
