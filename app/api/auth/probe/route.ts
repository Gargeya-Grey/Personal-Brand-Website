import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import {
  getSessionCookieOptions,
  SESSION_MAX_AGE_SEC,
} from '@/lib/session-cookie';

/**
 * Diagnostic: set a short-lived probe cookie with the same Domain/Secure flags
 * as auth_session, then report whether the browser sends it back.
 *
 * GET  /api/auth/probe        → shows whether auth_probe is present
 * POST /api/auth/probe        → sets auth_probe and redirects to GET
 */
export async function GET(request: Request) {
  const cookieStore = await cookies();
  const probe = cookieStore.get('auth_probe')?.value;
  const opts = getSessionCookieOptions(SESSION_MAX_AGE_SEC, request.url);

  return NextResponse.json({
    probePresent: probe === '1',
    cookieNames: cookieStore.getAll().map((c) => c.name),
    wouldSet: {
      name: 'auth_probe',
      ...opts,
    },
    host: new URL(request.url).host,
    hint: probe === '1'
      ? 'Cookie Domain/Secure flags work in this browser.'
      : 'POST /api/auth/probe first, then reload this URL.',
  });
}

export async function POST(request: Request) {
  const opts = getSessionCookieOptions(120, request.url); // 2 minutes
  const res = NextResponse.redirect(new URL('/api/auth/probe', request.url));
  res.cookies.set('auth_probe', '1', opts);
  res.headers.set('Cache-Control', 'private, no-store');
  return res;
}
