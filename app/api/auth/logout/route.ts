import { NextResponse } from 'next/server';
import { clearAuthSessionCookies } from '@/lib/session-cookie';

export async function GET(request: Request) {
  const redirectResponse = NextResponse.redirect(new URL('/', request.url));
  clearAuthSessionCookies(redirectResponse, request.url);
  redirectResponse.headers.set('Cache-Control', 'private, no-store');
  return redirectResponse;
}
