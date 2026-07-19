import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { inspectSession } from '@/lib/auth';
import { resolveCookieDomain } from '@/lib/session-cookie';

export async function GET(request: Request) {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('auth_session');
  const { user, reason } = await inspectSession(sessionCookie?.value);

  return NextResponse.json(
    {
      authenticated: !!user,
      reason,
      hasCookie: !!sessionCookie?.value,
      cookieChars: sessionCookie?.value?.length ?? 0,
      cookieDomain: resolveCookieDomain(request.url) ?? null,
      user: user
        ? {
            email: user.email,
            name: user.name,
            picture: user.picture,
          }
        : null,
    },
    {
      status: user ? 200 : 401,
      headers: { 'Cache-Control': 'private, no-store' },
    }
  );
}
