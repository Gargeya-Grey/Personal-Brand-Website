import { NextResponse } from 'next/server';
import { getGoogleOAuthUrl, sanitizeRedirect } from '@/lib/auth';
import { setOauthCookie } from '@/lib/session-cookie';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const callbackUrl = sanitizeRedirect(requestUrl.searchParams.get('callbackUrl') || '/editorial');

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return NextResponse.json(
      { error: 'Google OAuth is not configured on this server. Check env variables.' },
      { status: 500 }
    );
  }

  const stateBuffer = new Uint8Array(16);
  crypto.getRandomValues(stateBuffer);
  const state = Array.from(stateBuffer)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');

  const redirectUri = `${requestUrl.origin}/api/auth/callback`;
  const googleAuthUrl = getGoogleOAuthUrl(redirectUri, state);
  const response = NextResponse.redirect(googleAuthUrl);

  setOauthCookie(response, 'oauth_state', state, requestUrl);
  setOauthCookie(response, 'oauth_callback_url', callbackUrl, requestUrl);
  setOauthCookie(response, 'oauth_redirect_uri', redirectUri, requestUrl);
  response.headers.set('Cache-Control', 'private, no-store');

  return response;
}
