import { NextResponse } from 'next/server';
import { signJWT } from '@/lib/auth';

export async function POST() {
  // 1. Strict Environment Protection: Fail-Closed in Production
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: 'Forbidden: Mock login is disabled in production environments.' },
      { status: 403 }
    );
  }

  // 2. Setup mock profile for Gargeya (local testing)
  const mockUser = {
    email: 'developer@edudojo.ai',
    name: 'Gargeya (Dev Mode)',
    picture: 'https://api.dicebear.com/7.x/adventurer/svg?seed=gargeya',
  };

  // 3. Generate signed session token
  const sessionToken = await signJWT(mockUser);

  // 4. Set Cookie and redirect
  const response = NextResponse.json({ success: true, user: mockUser });
  
  response.cookies.set('auth_session', sessionToken, {
    httpOnly: true,
    secure: false, // Local dev doesn't require HTTPS
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });

  return response;
}
