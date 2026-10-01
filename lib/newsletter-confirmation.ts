import 'server-only';
import { createHmac, randomUUID, timingSafeEqual } from 'node:crypto';
import { normalizeTimeZone } from './newsletter-model';
import { consumeSecurityToken } from './security-state';

type Confirmation = { email: string; timezone: string; source: string; nonce: string; expires: number };
function signature(payload: string): string {
  const secret = process.env.JWT_SECRET || '';
  if (secret.length < 16) throw new Error('Subscription confirmation is not configured.');
  return createHmac('sha256', secret).update(`newsletter-confirmation:${payload}`).digest('base64url');
}
export function createNewsletterConfirmation(email: string, timezone: string, source: string): string {
  const payload = Buffer.from(JSON.stringify({ email: email.trim().toLowerCase(), timezone: normalizeTimeZone(timezone),
    source: source.slice(0, 64), nonce: randomUUID(), expires: Date.now() + 30 * 60 * 1000 })).toString('base64url');
  return `${payload}.${signature(payload)}`;
}
export function readNewsletterConfirmation(token: string): Confirmation | null {
  try {
    if (token.length > 1600) return null;
    const [payload, digest, extra] = token.split('.');
    if (!payload || !digest || extra !== undefined) return null;
    const expected = Buffer.from(signature(payload));
    const got = Buffer.from(digest);
    if (got.length !== expected.length || !timingSafeEqual(got, expected)) return null;
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as Confirmation;
    if (typeof data.email !== 'string' || data.email.length > 200 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email) ||
      typeof data.source !== 'string' || data.source.length > 64 || !/^[a-f0-9-]{36}$/i.test(data.nonce) ||
      !Number.isFinite(data.expires) || data.expires <= Date.now() || data.expires > Date.now() + 30 * 60 * 1000) return null;
    return { ...data, timezone: normalizeTimeZone(data.timezone) };
  } catch { return null; }
}
export async function consumeNewsletterConfirmation(token: string): Promise<Confirmation | null> {
  const data = readNewsletterConfirmation(token);
  return data && await consumeSecurityToken(data.nonce, data.expires) ? data : null;
}
