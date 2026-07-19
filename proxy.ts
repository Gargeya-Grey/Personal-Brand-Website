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

/** Keep users on one host (apex vs www) so host-only leftovers can't split sessions. */
function canonicalHostRedirect(request: NextRequest): NextResponse | null {
  const appUrl = process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL || '';
  if (!appUrl) return null;

  let preferred: URL;
  try {
    preferred = new URL(appUrl);
  } catch {
    return null;
  }

  if (
    preferred.hostname === 'localhost' ||
    preferred.hostname.endsWith('.localhost') ||
    preferred.hostname.endsWith('.vercel.app')
  ) {
    return null;
  }

  const current = request.nextUrl.hostname.toLowerCase();
  const preferredHost = preferred.hostname.toLowerCase();
  const stripWww = (h: string) => h.replace(/^www\./, '');

  if (stripWww(current) !== stripWww(preferredHost)) return null;
  if (current === preferredHost) return null;

  const url = request.nextUrl.clone();
  url.hostname = preferred.hostname;
  url.protocol = preferred.protocol;
  if (preferred.port) url.port = preferred.port;
  else url.port = '';

  return NextResponse.redirect(url, 308);
}

export async function proxy(request: NextRequest) {
  if (request.method === 'OPTIONS') {
    return NextResponse.next();
  }

  const { pathname } = request.nextUrl;

  // Never host-shift API routes (OAuth callback cookies are host-scoped mid-flow).
  if (!pathname.startsWith('/api/')) {
    const hostRedirect = canonicalHostRedirect(request);
    if (hostRedirect) return hostRedirect;
  }

  const sessionCookie = request.cookies.get('auth_session');
  const { user, reason } = await inspectSession(sessionCookie?.value);

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
  if (
    pathname.startsWith('/editorial') ||
    pathname.startsWith('/login') ||
    pathname.startsWith('/api/')
  ) {
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
    // Canonicalize host for login so sessions always land on APP_URL host
    '/login',
    '/login/:path*',
  ],
};
