import { NextResponse } from 'next/server';
import { setResendUnsubscribed } from '@/lib/resend';
import { setSubscriberUnsubscribed } from '@/lib/newsletter-service';
import { verifyUnsubscribeToken } from '@/lib/newsletter-unsubscribe';
import { getSiteOrigin } from '@/lib/site-config';

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function readPair(request: Request, body: { email?: unknown; token?: unknown }): { email: string; token: string } {
  const url = new URL(request.url);
  const email = String(body.email || url.searchParams.get('email') || '')
    .trim()
    .toLowerCase();
  const token = String(body.token || url.searchParams.get('token') || '').trim();
  return { email, token };
}

async function applyUnsubscribe(email: string): Promise<{ ok: boolean; error?: string }> {
  const local = await setSubscriberUnsubscribed(email, true);
  const remote = await setResendUnsubscribed(email, true).catch((err: unknown) => ({
    ok: false,
    error: err instanceof Error ? err.message : 'Resend update failed',
  }));
  if (local.ok) return { ok: true };
  if (remote.ok) return { ok: true };
  return { ok: false, error: local.error || remote.error || 'Could not unsubscribe.' };
}

export async function GET(request: Request) {
  const { email, token } = readPair(request, {});
  const origin = getSiteOrigin();
  const next = new URL('/notes/unsubscribe', origin);
  if (email) next.searchParams.set('email', email);
  if (token) next.searchParams.set('token', token);
  return NextResponse.redirect(next, 302);
}

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get('content-type') || '';
    let body: { email?: unknown; token?: unknown } = {};
    if (contentType.includes('application/json')) {
      body = (await request.json()) as { email?: unknown; token?: unknown };
    } else if (contentType.includes('application/x-www-form-urlencoded') || contentType.includes('multipart/form-data')) {
      const form = await request.formData();
      body = { email: form.get('email'), token: form.get('token') };
    }

    const { email, token } = readPair(request, body);
    if (!isValidEmail(email) || !verifyUnsubscribeToken(email, token)) {
      return NextResponse.json({ error: 'That unsubscribe link is not valid.' }, { status: 400 });
    }

    const result = await applyUnsubscribe(email);
    if (!result.ok) {
      return NextResponse.json(
        { error: result.error || 'Could not unsubscribe. Try again or email me directly.' },
        { status: 502 }
      );
    }
    return NextResponse.json({ ok: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
