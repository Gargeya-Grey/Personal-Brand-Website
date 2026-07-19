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
 * Cookie Domain without a leading dot (Next/Browsers treat sgargeya.com as covering www).
 * Priority: COOKIE_DOMAIN → APP_URL → request host.
 */
export function resolveCookieDomain(requestUrl?: URL | string | null): string | undefined {
  const explicit = process.env.COOKIE_DOMAIN?.trim().replace(/^['"]|['"]$/g, '');
  if (explicit) {
    const cleaned = explicit.replace(/^\./, '').replace(/^www\./, '').trim();
    return cleaned || undefined;
  }

  const appUrl = process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL || '';
  try {
    const apex = apexFromHostname(new URL(appUrl).hostname);
    if (apex) return apex;
  } catch {
    /* fall through */
  }

  if (requestUrl) {
    try {
      const url = typeof requestUrl === 'string' ? new URL(requestUrl) : requestUrl;
      const apex = apexFromHostname(url.hostname);
      if (apex) return apex;
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

export function getOauthCookieOptions(requestUrl?: URL | string | null): SessionCookieOptions {
  return getSessionCookieOptions(600, requestUrl);
}

/** Serialize Set-Cookie manually — avoids Next cookie-jar quirks with Domain on redirects. */
export function serializeSetCookie(
  name: string,
  value: string,
  options: SessionCookieOptions
): string {
  const parts = [
    `${name}=${value}`,
    `Path=${options.path}`,
    `Max-Age=${Math.max(0, options.maxAge)}`,
    'SameSite=Lax',
  ];
  if (options.httpOnly) parts.push('HttpOnly');
  if (options.secure) parts.push('Secure');
  if (options.domain) parts.push(`Domain=${options.domain}`);
  return parts.join('; ');
}

function appendCookie(
  response: NextResponse,
  name: string,
  value: string,
  options: SessionCookieOptions
): void {
  // Encode so values with = ? : / never truncate Set-Cookie parsing
  const safe = encodeURIComponent(value);
  response.headers.append('Set-Cookie', serializeSetCookie(name, safe, options));
}

export function readCookieValue(raw: string | undefined): string | undefined {
  if (!raw) return undefined;
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
}

function clearNamedCookie(
  response: NextResponse,
  name: string,
  requestUrl?: URL | string | null
): void {
  const base = getSessionCookieOptions(0, requestUrl);
  // Host-only clear
  appendCookie(response, name, '', { ...base, domain: undefined, maxAge: 0 });
  // Domain clear (both naked + dotted forms browsers may have stored)
  if (base.domain) {
    appendCookie(response, name, '', { ...base, maxAge: 0 });
    appendCookie(response, name, '', { ...base, domain: `.${base.domain}`, maxAge: 0 });
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
  const options = getSessionCookieOptions(SESSION_MAX_AGE_SEC, requestUrl);
  // One authoritative Set-Cookie — no same-response delete/set race
  appendCookie(response, 'auth_session', token, options);
}

export function setOauthCookie(
  response: NextResponse,
  name: string,
  value: string,
  requestUrl?: URL | string | null
): void {
  appendCookie(response, name, value, getOauthCookieOptions(requestUrl));
}
