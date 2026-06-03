import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const redirectResponse = NextResponse.redirect(new URL('/', request.url));

  // Configure cookie options matching the ones used during login
  const cookieOptions: any = {
    path: '/',
    maxAge: 0, // Expire immediately
  };

  const cookieDomain = process.env.COOKIE_DOMAIN;
  if (cookieDomain) {
    cookieOptions.domain = cookieDomain;
  }

  redirectResponse.cookies.set('auth_session', '', cookieOptions);

  return redirectResponse;
}
