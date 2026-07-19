import { NextResponse } from 'next/server';
import { isEmailAllowed, signJWT, verifyJWT } from '@/lib/auth';
import { isTrustedOrigin } from '@/lib/csrf';
import { setAuthSessionCookie } from '@/lib/session-cookie';

export async function POST(request: Request) {
  if (!isTrustedOrigin(request)) {
    return NextResponse.json(
      { error: 'Untrusted origin', reason: 'csrf' },
      { status: 403 }
    );
  }

  let ticket: string;
  try {
    const body = (await request.json()) as { ticket?: unknown };
    ticket = typeof body.ticket === 'string' ? body.ticket : '';
  } catch {
    ticket = '';
  }

  const pendingUser = ticket ? await verifyJWT(ticket) : null;
  if (!pendingUser || !isEmailAllowed(pendingUser.email)) {
    return NextResponse.json(
      { error: 'Invalid or expired sign-in ticket', reason: 'invalid-ticket' },
      { status: 401 }
    );
  }

  const sessionToken = await signJWT({
    email: pendingUser.email,
    name: pendingUser.name,
    picture: pendingUser.picture,
  });

  const response = NextResponse.json({ success: true });
  setAuthSessionCookie(response, sessionToken, request.url);
  response.headers.set('Cache-Control', 'private, no-store');
  return response;
}
