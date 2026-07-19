import { NextResponse } from 'next/server';
import { isEmailAllowed, signJWT } from '@/lib/auth';
import { setAuthSessionCookie } from '@/lib/session-cookie';

export async function POST(request: Request) {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: 'Forbidden: Mock login is disabled in production environments.' },
      { status: 403 }
    );
  }

  const allowedEmail =
    (process.env.ALLOWED_EMAILS || '')
      .split(/[,;\n]/)
      .map((e) => e.trim().replace(/^['"]|['"]$/g, ''))
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
    picture: `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(allowedEmail)}`,
  };

  const sessionToken = await signJWT(mockUser);
  const response = NextResponse.json({ success: true, user: mockUser });
  setAuthSessionCookie(response, sessionToken, request.url);
  response.headers.set('Cache-Control', 'private, no-store');
  return response;
}
