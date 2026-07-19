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
} from '@/lib/session-cookie';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const state = requestUrl.searchParams.get('state');

  const cookieStore = await cookies();
  const stateCookie = cookieStore.get('oauth_state')?.value;
  const storedCallbackUrl = cookieStore.get('oauth_callback_url')?.value;
  const storedRedirectUri = cookieStore.get('oauth_redirect_uri')?.value;

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

    const completionTicket = await signJWT({
      email: profile.email,
      name: profile.name,
      picture: profile.picture,
      exp: Math.floor(Date.now() / 1000) + 60,
    });

    const targetPath = sanitizeRedirect(storedCallbackUrl);
    const serializedTarget = JSON.stringify(targetPath).replace(/</g, '\\u003c');
    const serializedTicket = JSON.stringify(completionTicket);
    const completionHtml = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <title>Completing sign-in…</title>
    <style>
      body{margin:0;min-height:100vh;display:grid;place-items:center;background:#0c0a09;color:#f5f5f4;font:16px system-ui,sans-serif}
      main{text-align:center;padding:2rem}p{color:#a8a29e}
    </style>
  </head>
  <body>
    <main>
      <h1>Completing sign-in…</h1>
      <p id="status">Securing your Atelier session.</p>
    </main>
    <script>
      const target = ${serializedTarget};
      const ticket = ${serializedTicket};
      async function completeSignIn() {
        const finalizeResponse = await fetch('/api/auth/finalize', {
          method: 'POST',
          credentials: 'same-origin',
          cache: 'no-store',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ticket }),
        });
        if (!finalizeResponse.ok) {
          const data = await finalizeResponse.json().catch(() => ({}));
          throw new Error(data.reason || 'finalize-failed');
        }

        const verificationResponse = await fetch('/api/auth/me', {
          credentials: 'same-origin',
          cache: 'no-store',
        });
        if (!verificationResponse.ok) {
          const data = await verificationResponse.json().catch(() => ({}));
          throw new Error(data.reason || 'session-cookie');
        }

        window.location.replace(target);
      }
      completeSignIn().catch((error) => {
        const reason = encodeURIComponent(error.message || 'verification-failed');
        window.location.replace('/login?error=SessionCookie&reason=' + reason);
      });
    </script>
  </body>
</html>`;
    const completionResponse = new NextResponse(completionHtml, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'private, no-store, max-age=0',
        'Referrer-Policy': 'no-referrer',
      },
    });
    return completionResponse;
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
