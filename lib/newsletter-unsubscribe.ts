import 'server-only';
import { createHmac, timingSafeEqual } from 'node:crypto';
import { getSiteOrigin } from './site-config';

function secret(): string {
  const value = (process.env.JWT_SECRET || process.env.X_TOKEN_ENCRYPTION_KEY || '').trim();
  if (value.length < 16) {
    throw new Error('JWT_SECRET is required to sign unsubscribe links.');
  }
  return value;
}

export function unsubscribeToken(email: string): string {
  return createHmac('sha256', secret()).update(email.trim().toLowerCase()).digest('hex').slice(0, 32);
}

export function unsubscribeUrl(email: string, origin = getSiteOrigin()): string {
  const params = new URLSearchParams({
    email: email.trim().toLowerCase(),
    token: unsubscribeToken(email),
  });
  return `${origin.replace(/\/$/, '')}/notes/unsubscribe?${params.toString()}`;
}

export function verifyUnsubscribeToken(email: string, token: string): boolean {
  const expected = unsubscribeToken(email);
  const got = token.trim().toLowerCase();
  if (got.length !== expected.length) return false;
  try {
    return timingSafeEqual(Buffer.from(expected), Buffer.from(got));
  } catch {
    return false;
  }
}
