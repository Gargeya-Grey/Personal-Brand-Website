import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { requireAllowedSession } from '@/lib/auth';

export async function GET() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('auth_session');
  const payload = await requireAllowedSession(sessionCookie?.value);

  if (!payload) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  return NextResponse.json({
    authenticated: true,
    user: {
      email: payload.email,
      name: payload.name,
      picture: payload.picture,
    },
  });
}
