import { NextResponse } from 'next/server';
import { clearAuthSessionCookies, clearOauthCookies } from '@/lib/session-cookie';

export async function GET(request: Request) {
  const redirectResponse = NextResponse.redirect(new URL('/', request.url));
  clearAuthSessionCookies(redirectResponse, request.url);
  clearOauthCookies(redirectResponse, request.url);
  // Host-only leftover clear
  redirectResponse.headers.append(
    'Set-Cookie',
    'auth_session=; Path=/; Max-Age=0; SameSite=Lax; HttpOnly; Secure'
  );
  redirectResponse.headers.set('Cache-Control', 'private, no-store');
  return redirectResponse;
}
