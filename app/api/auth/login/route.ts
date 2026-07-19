import { NextResponse } from 'next/server';
import { getGoogleOAuthUrl, sanitizeRedirect } from '@/lib/auth';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const callbackUrl = sanitizeRedirect(searchParams.get('callbackUrl') || '/editorial');

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

  const requestUrl = new URL(request.url);
  const redirectUri = `${requestUrl.origin}/api/auth/callback`;
  const googleAuthUrl = getGoogleOAuthUrl(redirectUri, state);
  const response = NextResponse.redirect(googleAuthUrl);

  const oauthCookie = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge: 600,
  };

  response.cookies.set('oauth_state', state, oauthCookie);
  response.cookies.set('oauth_callback_url', callbackUrl, oauthCookie);

  return response;
}
