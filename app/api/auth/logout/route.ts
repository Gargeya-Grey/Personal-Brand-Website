import { NextResponse } from 'next/server';
import { isTrustedOrigin } from '@/lib/csrf';
import { clearAuthSessionCookies, clearOauthCookies } from '@/lib/session-cookie';

export async function POST(request: Request) {
  if (!isTrustedOrigin(request)) {
    return NextResponse.json({ error: 'Untrusted origin' }, { status: 403 });
  }

  const response = NextResponse.json({ success: true });
  clearAuthSessionCookies(response, request.url);
  clearOauthCookies(response, request.url);
  response.headers.set('Cache-Control', 'private, no-store');
  return response;
}

export async function GET() {
  // GET must never mutate auth state: Next.js may prefetch links automatically.
  // The script only runs after an actual document navigation to this endpoint.
  return new NextResponse(
    `<!doctype html>
<html lang="en">
  <head><meta charset="utf-8"><title>Signing out…</title></head>
  <body>
    <p>Signing out…</p>
    <script>
      fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'same-origin',
      }).finally(() => window.location.replace('/'));
    </script>
  </body>
</html>`,
    {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'private, no-store, max-age=0',
      },
    }
  );
}
