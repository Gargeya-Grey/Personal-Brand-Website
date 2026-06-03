import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyJWT } from './lib/auth';

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Enforce session check on editorial paths
  if (pathname.startsWith('/editorial')) {
    const sessionCookie = request.cookies.get('auth_session');
    
    if (!sessionCookie) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }

    const payload = await verifyJWT(sessionCookie.value);
    if (!payload) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      
      // Clear invalid session cookie
      const response = NextResponse.redirect(loginUrl);
      response.cookies.delete('auth_session');
      return response;
    }
  }

  // Enforce write protections on Blog API routes
  if (pathname.startsWith('/api/blog')) {
    const method = request.method;
    // Allow public reads
    if (method !== 'GET') {
      const sessionCookie = request.cookies.get('auth_session');
      if (!sessionCookie) {
        return new NextResponse(
          JSON.stringify({ error: 'Unauthorized: Session missing' }),
          { status: 401, headers: { 'Content-Type': 'application/json' } }
        );
      }
      
      const payload = await verifyJWT(sessionCookie.value);
      if (!payload) {
        return new NextResponse(
          JSON.stringify({ error: 'Unauthorized: Session invalid or expired' }),
          { status: 401, headers: { 'Content-Type': 'application/json' } }
        );
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/editorial/:path*', '/api/blog/:path*'],
};
