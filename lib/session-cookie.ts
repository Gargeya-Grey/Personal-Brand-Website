import 'server-only';
import type { NextResponse } from 'next/server';

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

function apexFromHostname(hostname: string): string | undefined {
  const host = hostname.trim().toLowerCase().replace(/\.$/, '');
  if (!host || host === 'localhost' || host.endsWith('.localhost')) return undefined;
  if (host.endsWith('.vercel.app')) return undefined;
  return host.replace(/^www\./, '');
}

/**
 * Cookie Domain so apex + www share one session.
 * Priority: COOKIE_DOMAIN → request host → APP_URL host.
 */
export function resolveCookieDomain(requestUrl?: URL | string | null): string | undefined {
  const explicit = process.env.COOKIE_DOMAIN?.trim();
  if (explicit) {
    return explicit.startsWith('.') ? explicit : `.${explicit.replace(/^www\./, '')}`;
  }

  if (requestUrl) {
    try {
      const url = typeof requestUrl === 'string' ? new URL(requestUrl) : requestUrl;
      const apex = apexFromHostname(url.hostname);
      if (apex) return `.${apex}`;
    } catch {
      /* fall through */
    }
  }

  const appUrl = process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL || '';
  try {
    const apex = apexFromHostname(new URL(appUrl).hostname);
    if (apex) return `.${apex}`;
  } catch {
    /* ignore */
  }

  return undefined;
}

export function getSessionCookieOptions(
  maxAge: number = SESSION_MAX_AGE_SEC,
  requestUrl?: URL | string | null
): SessionCookieOptions {
  const options: SessionCookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge,
  };
  const domain = resolveCookieDomain(requestUrl);
  if (domain) options.domain = domain;
  return options;
}

/** Wipe both host-only and Domain= cookies (duplicate names break auth). */
export function clearAuthSessionCookies(
  response: NextResponse,
  requestUrl?: URL | string | null
): void {
  const base = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge: 0,
  };

  // Host-only
  response.cookies.set('auth_session', '', base);

  const domain = resolveCookieDomain(requestUrl);
  if (domain) {
    response.cookies.set('auth_session', '', { ...base, domain });
  }

  // Also clear common mistaken variants
  if (domain) {
    const naked = domain.replace(/^\./, '');
    response.cookies.set('auth_session', '', { ...base, domain: naked });
    response.cookies.set('auth_session', '', { ...base, domain: `.www.${naked}` });
    response.cookies.set('auth_session', '', { ...base, domain: `www.${naked}` });
  }
}

export function setAuthSessionCookie(
  response: NextResponse,
  token: string,
  requestUrl?: URL | string | null
): void {
  clearAuthSessionCookies(response, requestUrl);
  response.cookies.set('auth_session', token, getSessionCookieOptions(SESSION_MAX_AGE_SEC, requestUrl));
}
