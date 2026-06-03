import { NextResponse } from 'next/server';
import { getGoogleOAuthUrl } from '@/lib/auth';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const callbackUrl = searchParams.get('callbackUrl') || '/editorial';

  // 1. Verify credentials configuration
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return NextResponse.json(
      { error: 'Google OAuth is not configured on this server. Check env variables.' },
      { status: 500 }
    );
  }

  // 2. Generate a secure random state for CSRF protection
  const stateBuffer = new Uint8Array(16);
  crypto.getRandomValues(stateBuffer);
  const state = Array.from(stateBuffer)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');

  // 3. Determine the dynamic redirect URI
  const requestUrl = new URL(request.url);
  const redirectUri = `${requestUrl.origin}/api/auth/callback`;

  // 4. Build Google Authorization URL
  const googleAuthUrl = getGoogleOAuthUrl(redirectUri, state);

  // 5. Construct response redirecting to Google and setting the state cookie
  const response = NextResponse.redirect(googleAuthUrl);
  
  // Set CSRF state cookie valid for 10 minutes
  response.cookies.set('oauth_state', state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 600, // 10 minutes
  });

  // Store the target callbackUrl for redirection after callback success
  response.cookies.set('oauth_callback_url', callbackUrl, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 600,
  });

  return response;
}
