/**
 * Allow same-site mutations across apex ↔ www of the brand domain.
 */
export function isTrustedOrigin(request: Request): boolean {
  const origin = request.headers.get('origin');
  if (!origin) return true; // non-browser clients

  let originUrl: URL;
  let requestUrl: URL;
  try {
    originUrl = new URL(origin);
    requestUrl = new URL(request.url);
  } catch {
    return false;
  }

  if (originUrl.origin === requestUrl.origin) return true;
  if (originUrl.protocol !== requestUrl.protocol) return false;

  const stripWww = (host: string) => host.replace(/^www\./i, '').toLowerCase();
  return stripWww(originUrl.hostname) === stripWww(requestUrl.hostname);
}
