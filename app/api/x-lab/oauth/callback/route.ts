import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { requireAllowedSession } from '@/lib/auth';
import { exchangeCodeForTokens, fetchMe } from '@/lib/x-api';
import { saveOAuthTokens } from '@/lib/x-lab-service';
import { isTokenEncryptionConfigured } from '@/lib/x-lab-crypto';

function appBase(request: Request): string {
  return (process.env.APP_URL || new URL(request.url).origin).replace(/\/$/, '');
}

export async function GET(request: Request) {
  const base = appBase(request);
  const labUrl = `${base}/editorial?workspace=lab`;

  try {
    const cookieStore = await cookies();
    const user = await requireAllowedSession(cookieStore.get('auth_session')?.value);
    if (!user) {
      return NextResponse.redirect(`${base}/login?callbackUrl=/editorial?workspace=lab`);
    }

    const { searchParams } = new URL(request.url);
    const err = searchParams.get('error');
    if (err) {
      return NextResponse.redirect(
        `${labUrl}&x_error=${encodeURIComponent(err)}`
      );
    }

    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const savedState = cookieStore.get('x_lab_oauth_state')?.value;
    const verifier = cookieStore.get('x_lab_oauth_verifier')?.value;

    if (!code || !state || !savedState || state !== savedState || !verifier) {
      return NextResponse.redirect(
        `${labUrl}&x_error=${encodeURIComponent('Invalid OAuth state. Try Connect X again.')}`
      );
    }

    if (!isTokenEncryptionConfigured()) {
      return NextResponse.redirect(
        `${labUrl}&x_error=${encodeURIComponent('X_TOKEN_ENCRYPTION_KEY is not set on the server.')}`
      );
    }

    const tokens = await exchangeCodeForTokens({ code, codeVerifier: verifier });
    const me = await fetchMe(tokens.access_token);

    await saveOAuthTokens({
      x_user_id: me.data.id,
      username: me.data.username,
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token ?? null,
      expires_in: tokens.expires_in,
      scopes: tokens.scope,
    });

    const res = NextResponse.redirect(`${labUrl}&connected=1`);
    res.cookies.set('x_lab_oauth_verifier', '', { path: '/', maxAge: 0 });
    res.cookies.set('x_lab_oauth_state', '', { path: '/', maxAge: 0 });
    return res;
  } catch (e) {
    const message = e instanceof Error ? e.message : 'OAuth callback failed';
    return NextResponse.redirect(
      `${labUrl}&x_error=${encodeURIComponent(message.slice(0, 200))}`
    );
  }
}
