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
 * Priority: COOKIE_DOMAIN → APP_URL → request host.
 */
export function resolveCookieDomain(requestUrl?: URL | string | null): string | undefined {
  const explicit = process.env.COOKIE_DOMAIN?.trim();
  if (explicit) {
    const cleaned = explicit.replace(/^\./, '').replace(/^www\./, '');
    return cleaned ? `.${cleaned}` : undefined;
  }

  const appUrl = process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL || '';
  try {
    const apex = apexFromHostname(new URL(appUrl).hostname);
    if (apex) return `.${apex}`;
  } catch {
    /* fall through */
  }

  if (requestUrl) {
    try {
      const url = typeof requestUrl === 'string' ? new URL(requestUrl) : requestUrl;
      const apex = apexFromHostname(url.hostname);
      if (apex) return `.${apex}`;
    } catch {
      /* ignore */
    }
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

/** Short-lived OAuth CSRF cookies — must use the same Domain as auth_session. */
export function getOauthCookieOptions(requestUrl?: URL | string | null): SessionCookieOptions {
  return getSessionCookieOptions(600, requestUrl);
}

function clearNamedCookie(
  response: NextResponse,
  name: string,
  requestUrl?: URL | string | null
): void {
  const base = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge: 0,
  };

  response.cookies.set(name, '', base);

  const domain = resolveCookieDomain(requestUrl);
  if (domain) {
    response.cookies.set(name, '', { ...base, domain });
    const naked = domain.replace(/^\./, '');
    response.cookies.set(name, '', { ...base, domain: naked });
  }
}

export function clearAuthSessionCookies(
  response: NextResponse,
  requestUrl?: URL | string | null
): void {
  clearNamedCookie(response, 'auth_session', requestUrl);
}

export function clearOauthCookies(
  response: NextResponse,
  requestUrl?: URL | string | null
): void {
  clearNamedCookie(response, 'oauth_state', requestUrl);
  clearNamedCookie(response, 'oauth_callback_url', requestUrl);
  clearNamedCookie(response, 'oauth_redirect_uri', requestUrl);
}

export function setAuthSessionCookie(
  response: NextResponse,
  token: string,
  requestUrl?: URL | string | null
): void {
  // Clear host-only leftovers, then set the shared Domain cookie once.
  response.cookies.set('auth_session', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
  response.cookies.set(
    'auth_session',
    token,
    getSessionCookieOptions(SESSION_MAX_AGE_SEC, requestUrl)
  );
}
