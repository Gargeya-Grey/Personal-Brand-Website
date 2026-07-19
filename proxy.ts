import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { requireAllowedSession } from './lib/auth';

function unauthorizedJson(message: string) {
  return new NextResponse(JSON.stringify({ error: message }), {
    status: 401,
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function proxy(request: NextRequest) {
  // Preflight must not require a session cookie
  if (request.method === 'OPTIONS') {
    return NextResponse.next();
  }

  const { pathname } = request.nextUrl;
  const sessionCookie = request.cookies.get('auth_session');

  // Editorial UI — Google OAuth session + allowlisted email only
  if (pathname === '/editorial' || pathname.startsWith('/editorial/')) {
    const user = await requireAllowedSession(sessionCookie?.value);
    if (!user) {
      const loginUrl = new URL('/login', request.url);
      const callback = pathname + (request.nextUrl.search || '');
      loginUrl.searchParams.set('callbackUrl', callback);
      // Do NOT delete auth_session here — a failed check must not wipe a valid cookie
      // (www/apex mismatch, brief env glitch, etc.). Only /api/auth/logout clears it.
      return NextResponse.redirect(loginUrl);
    }
  }

  if (pathname.startsWith('/api/blog') && request.method !== 'GET') {
    const user = await requireAllowedSession(sessionCookie?.value);
    if (!user) {
      return unauthorizedJson('Unauthorized: valid allowlisted session required');
    }
  }

  if (pathname.startsWith('/api/ai')) {
    const user = await requireAllowedSession(sessionCookie?.value);
    if (!user) {
      return unauthorizedJson('Unauthorized: valid allowlisted session required');
    }
  }

  if (
    pathname.startsWith('/api/x-content') &&
    !pathname.startsWith('/api/x-content/ingest')
  ) {
    const user = await requireAllowedSession(sessionCookie?.value);
    if (!user) {
      return unauthorizedJson('Unauthorized: valid allowlisted session required');
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/editorial',
    '/editorial/:path*',
    '/api/blog',
    '/api/blog/:path*',
    '/api/ai',
    '/api/ai/:path*',
    '/api/x-content',
    '/api/x-content/:path*',
  ],
};
