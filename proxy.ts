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
  // Preflight must not require a session cookie (browsers often omit it on OPTIONS)
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
      loginUrl.searchParams.set('callbackUrl', pathname + request.nextUrl.search);
      const response = NextResponse.redirect(loginUrl);
      if (sessionCookie) response.cookies.delete('auth_session');
      return response;
    }
  }

  // Blog writes (GET list stays public for published posts — route filters drafts)
  if (pathname.startsWith('/api/blog') && request.method !== 'GET') {
    const user = await requireAllowedSession(sessionCookie?.value);
    if (!user) {
      return unauthorizedJson('Unauthorized: valid allowlisted session required');
    }
  }

  // AI + X Content (except machine ingest) are private
  if (pathname.startsWith('/api/ai')) {
    const user = await requireAllowedSession(sessionCookie?.value);
    if (!user) {
      return unauthorizedJson('Unauthorized: valid allowlisted session required');
    }
  }

  // X Content Studio API is private (cookie session).
  // Exception: /api/x-content/ingest uses X_SCOUT_SECRET (machine push from local Grok).
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
