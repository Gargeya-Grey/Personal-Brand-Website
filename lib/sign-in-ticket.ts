import 'server-only';
import { signJWT, verifyJWT, type UserSession } from './auth';
import { consumeSecurityToken } from './security-state';

export async function createSignInTicket(user: UserSession): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  return signJWT({ ...user, purpose: 'sign-in', nonce: crypto.randomUUID(), exp: now + 60,
    sessionExpiresAt: now + 60 * 60 * 24 * 30 });
}

export async function consumeSignInTicket(ticket: string): Promise<UserSession | null> {
  const user = await verifyJWT(ticket, undefined, 'sign-in');
  const now = Math.floor(Date.now() / 1000);
  if (!user?.nonce || !user.exp || user.exp > now + 60 ||
    !Number.isFinite(user.sessionExpiresAt) || user.sessionExpiresAt! <= now ||
    user.sessionExpiresAt! > now + 60 * 60 * 24 * 30) return null;
  if (!await consumeSecurityToken(user.nonce, user.exp * 1000)) return null;
  return { email: user.email, name: user.name, picture: user.picture, exp: user.sessionExpiresAt };
}
