import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { 
  getGoogleTokens, 
  getGoogleUserProfile, 
  isEmailAllowed, 
  signJWT, 
  sanitizeRedirect 
} from '@/lib/auth';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const state = requestUrl.searchParams.get('state');

  const cookieStore = await cookies();
  const stateCookie = cookieStore.get('oauth_state')?.value;
  const storedCallbackUrl = cookieStore.get('oauth_callback_url')?.value;

  // 1. Clear OAuth temp cookies immediately
  cookieStore.delete('oauth_state');
  cookieStore.delete('oauth_callback_url');

  // 2. CSRF Validation
  if (!state || !stateCookie || state !== stateCookie) {
    return NextResponse.json(
      { error: 'CSRF State validation failed. Access denied.' },
      { status: 400 }
    );
  }

  if (!code) {
    return NextResponse.json(
      { error: 'No authorization code returned from Google.' },
      { status: 400 }
    );
  }

  try {
    // 3. Exchange code for tokens
    const redirectUri = `${requestUrl.origin}/api/auth/callback`;
    const tokens = await getGoogleTokens(code, redirectUri);
    
    // 4. Retrieve user profile from Google
    const profile = await getGoogleUserProfile(tokens.access_token);

    // 5. Access control verification
    if (!profile.email || !isEmailAllowed(profile.email)) {
      // Redirect to login page with error
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('error', 'AccessDenied');
      loginUrl.searchParams.set('email', profile.email || '');
      return NextResponse.redirect(loginUrl);
    }

    // 6. Generate session token
    const sessionToken = await signJWT({
      email: profile.email,
      name: profile.name,
      picture: profile.picture,
    });

    // 7. Redirect to requested path (sanitized)
    const targetPath = sanitizeRedirect(storedCallbackUrl);
    const redirectResponse = NextResponse.redirect(new URL(targetPath, request.url));

    // 8. Write secure session cookie (supporting optional wildcard subdomains)
    const cookieOptions: any = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    };

    const cookieDomain = process.env.COOKIE_DOMAIN;
    if (cookieDomain) {
      cookieOptions.domain = cookieDomain;
    }

    redirectResponse.cookies.set('auth_session', sessionToken, cookieOptions);

    return redirectResponse;
  } catch (error: any) {
    console.error('Google OAuth Callback Error:', error);
    
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('error', 'AuthFailed');
    return NextResponse.redirect(loginUrl);
  }
}
