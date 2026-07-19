import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { inspectSession } from './lib/auth';

function unauthorizedJson(message: string, reason: string) {
  return new NextResponse(JSON.stringify({ error: message, reason }), {
    status: 401,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'private, no-store',
      'X-Auth-Reason': reason,
    },
  });
}

export async function proxy(request: NextRequest) {
  if (request.method === 'OPTIONS') {
    return NextResponse.next();
  }

  const { pathname } = request.nextUrl;
  const sessionCookie = request.cookies.get('auth_session');
  const { user, reason } = await inspectSession(sessionCookie?.value);

  // Editorial UI — Google OAuth session + allowlisted email only
  if (pathname === '/editorial' || pathname.startsWith('/editorial/')) {
    if (!user) {
      const loginUrl = new URL('/login', request.url);
      const callback = pathname + (request.nextUrl.search || '');
      loginUrl.searchParams.set('callbackUrl', callback);
      loginUrl.searchParams.set('reason', reason);
      const res = NextResponse.redirect(loginUrl);
      res.headers.set('Cache-Control', 'private, no-store');
      // Never delete auth_session here — only logout clears it.
      return res;
    }
  }

  if (pathname.startsWith('/api/blog') && request.method !== 'GET') {
    if (!user) {
      return unauthorizedJson('Unauthorized: valid allowlisted session required', reason);
    }
  }

  if (pathname.startsWith('/api/ai')) {
    if (!user) {
      return unauthorizedJson('Unauthorized: valid allowlisted session required', reason);
    }
  }

  if (
    pathname.startsWith('/api/x-content') &&
    !pathname.startsWith('/api/x-content/ingest')
  ) {
    if (!user) {
      return unauthorizedJson('Unauthorized: valid allowlisted session required', reason);
    }
  }

  const res = NextResponse.next();
  if (pathname.startsWith('/editorial') || pathname.startsWith('/api/')) {
    res.headers.set('Cache-Control', 'private, no-store');
  }
  return res;
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
