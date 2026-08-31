import { cookies } from 'next/headers';
import { requireAllowedSession } from './auth';
import { isTrustedOrigin } from './csrf';

export function authorizeScout(request: Request): boolean {
  const secret = process.env.X_SCOUT_SECRET;
  if (!secret || secret.length < 16) return false;
  const header =
    request.headers.get('x-scout-secret') ||
    request.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
  return header === secret;
}

export function authorizeCron(request: Request): boolean {
  const cronSecret = (process.env.CRON_SECRET || '').trim();
  const bearer = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '') || '';
  if (cronSecret && bearer === cronSecret) return true;
  return authorizeScout(request);
}

export async function requireEditorialUser() {
  const cookieStore = await cookies();
  return requireAllowedSession(cookieStore.get('auth_session')?.value);
}

export function checkCsrf(request: Request): boolean {
  return isTrustedOrigin(request);
}
