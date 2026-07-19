import { NextResponse } from 'next/server';
import { getClearSessionCookieOptions } from '@/lib/session-cookie';

export async function GET(request: Request) {
  const redirectResponse = NextResponse.redirect(new URL('/', request.url));
  // Must use the same Domain/Path/Secure flags used when setting the cookie
  redirectResponse.cookies.set('auth_session', '', getClearSessionCookieOptions());
  return redirectResponse;
}
