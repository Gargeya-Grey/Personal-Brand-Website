import { NextResponse } from 'next/server';
import { authorizeScout } from '@/lib/newsletter-auth';
import { subscriberAlertFromWebhook } from '@/lib/notes-alerts';
import { notifySubscriberAlert } from '@/lib/telegram';

/**
 * Supabase Database Webhook target for newsletter_subscribers INSERT/UPDATE.
 * Auth: x-scout-secret or Authorization Bearer (X_SCOUT_SECRET).
 * Telegram stays silent until TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID are set.
 */
export async function POST(request: Request) {
  try {
    if (!authorizeScout(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const body = await request.json().catch(() => null);
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }
    const alert = subscriberAlertFromWebhook(body as { type?: unknown; record?: unknown; old_record?: unknown });
    if (!alert) {
      return NextResponse.json({ ok: true, skipped: true });
    }
    await notifySubscriberAlert(alert);
    return NextResponse.json({ ok: true, kind: alert.kind });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
