import { NextResponse } from 'next/server';
import { isEmailAllowed, signJWT } from '@/lib/auth';

export async function POST() {
  // Strict Environment Protection: Fail-Closed in Production
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: 'Forbidden: Mock login is disabled in production environments.' },
      { status: 403 }
    );
  }

  // Use first allowlisted email so local sessions pass requireAllowedSession
  const allowedEmail =
    (process.env.ALLOWED_EMAILS || '')
      .split(',')
      .map((e) => e.trim())
      .find(Boolean) || '';

  if (!allowedEmail || !isEmailAllowed(allowedEmail)) {
    return NextResponse.json(
      {
        error:
          'Mock login requires ALLOWED_EMAILS to be set in .env (same allowlist as production).',
      },
      { status: 403 }
    );
  }

  const mockUser = {
    email: allowedEmail,
    name: 'Gargeya (Dev Mode)',
    picture: 'https://api.dicebear.com/7.x/adventurer/svg?seed=gargeya',
  };

  const sessionToken = await signJWT(mockUser);
  const response = NextResponse.json({ success: true, user: mockUser });

  response.cookies.set('auth_session', sessionToken, {
    httpOnly: true,
    secure: false,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  });

  return response;
}
