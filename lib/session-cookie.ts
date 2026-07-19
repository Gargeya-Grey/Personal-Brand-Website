import 'server-only';

/** Session lifetime — survives browser restarts until expiry or Sign out */
export const SESSION_MAX_AGE_SEC = 60 * 60 * 24 * 30; // 30 days

export type SessionCookieOptions = {
  httpOnly: boolean;
  secure: boolean;
  sameSite: 'lax';
  path: string;
  maxAge: number;
  domain?: string;
};

/**
 * Cookie Domain so apex + www share one session.
 * Set COOKIE_DOMAIN=.sgargeya.com on Vercel (recommended), or we infer from APP_URL.
 */
export function resolveCookieDomain(): string | undefined {
  const explicit = process.env.COOKIE_DOMAIN?.trim();
  if (explicit) return explicit;

  const appUrl = process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL || '';
  try {
    const host = new URL(appUrl).hostname.replace(/^www\./, '');
    if (!host || host === 'localhost' || host.endsWith('.vercel.app')) return undefined;
    // Leading dot: valid for subdomain sharing on modern browsers
    return `.${host}`;
  } catch {
    return undefined;
  }
}

export function getSessionCookieOptions(maxAge: number = SESSION_MAX_AGE_SEC): SessionCookieOptions {
  const options: SessionCookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge,
  };
  const domain = resolveCookieDomain();
  if (domain) options.domain = domain;
  return options;
}

export function getClearSessionCookieOptions(): SessionCookieOptions {
  return getSessionCookieOptions(0);
}
