import 'server-only';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { requireAllowedSession, type UserSession } from '@/lib/auth';
import { isTrustedOrigin } from '@/lib/csrf';

const extractHits = new Map<string, number[]>();

export function privateJson(body: unknown, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: { 'Cache-Control': 'private, no-store' },
  });
}

export async function requireLedgerUser(request: Request): Promise<
  { user: UserSession } | { response: NextResponse }
> {
  const cookieStore = await cookies();
  const user = await requireAllowedSession(cookieStore.get('auth_session')?.value);
  if (!user) {
    return { response: privateJson({ error: 'Unauthorized' }, 401) };
  }
  if (request.method !== 'GET' && request.method !== 'HEAD' && !isTrustedOrigin(request)) {
    return { response: privateJson({ error: 'Invalid request origin.' }, 403) };
  }
  return { user };
}

/** Simple per-instance throttle so a stolen session cannot burn AI quota. */
export function allowExtract(email: string, limit = 10, windowMs = 10 * 60 * 1000): boolean {
  const now = Date.now();
  const key = email.toLowerCase();
  const recent = (extractHits.get(key) || []).filter((stamp) => now - stamp < windowMs);
  if (recent.length >= limit) {
    extractHits.set(key, recent);
    return false;
  }
  recent.push(now);
  extractHits.set(key, recent);
  return true;
}
