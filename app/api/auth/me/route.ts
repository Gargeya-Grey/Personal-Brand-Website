import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { inspectSession } from '@/lib/auth';
import { readCookieValue, resolveCookieDomain } from '@/lib/session-cookie';

export async function GET(request: Request) {
  const cookieStore = await cookies();
  const all = cookieStore.getAll();
  const token = readCookieValue(cookieStore.get('auth_session')?.value);
  const { user, reason } = await inspectSession(token);

  return NextResponse.json(
    {
      authenticated: !!user,
      reason,
      hasCookie: !!token,
      cookieChars: token?.length ?? 0,
      cookieDomain: resolveCookieDomain(request.url) ?? null,
      cookieNames: all.map((c) => c.name),
      host: new URL(request.url).host,
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
