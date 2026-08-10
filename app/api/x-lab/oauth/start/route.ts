import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { requireAllowedSession } from '@/lib/auth';
import { buildAuthorizeUrl, generatePkcePair, xOAuthConfigured } from '@/lib/x-api';
import { randomBytes } from 'crypto';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const user = await requireAllowedSession(cookieStore.get('auth_session')?.value);
    if (!user) {
      return NextResponse.redirect(new URL('/login?callbackUrl=/editorial?workspace=lab', process.env.APP_URL || 'http://localhost:3000'));
    }

    if (!xOAuthConfigured()) {
      return NextResponse.json(
        {
          error:
            'X OAuth is not configured. Set X_CLIENT_ID, X_CLIENT_SECRET, and X_OAUTH_REDIRECT_URI (or APP_URL) on the host.',
        },
        { status: 500 }
      );
    }

    const { verifier, challenge } = generatePkcePair();
    const state = randomBytes(16).toString('hex');
    const url = buildAuthorizeUrl({ state, codeChallenge: challenge });

    const res = NextResponse.redirect(url);
    const secure = process.env.NODE_ENV === 'production';
    res.cookies.set('x_lab_oauth_verifier', verifier, {
      httpOnly: true,
      secure,
      sameSite: 'lax',
      path: '/',
      maxAge: 600,
    });
    res.cookies.set('x_lab_oauth_state', state, {
      httpOnly: true,
      secure,
      sameSite: 'lax',
      path: '/',
      maxAge: 600,
    });
    return res;
  } catch (e) {
    const message = e instanceof Error ? e.message : 'OAuth start failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
