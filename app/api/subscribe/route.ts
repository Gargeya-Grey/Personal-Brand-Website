import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { normalizeTimeZone } from '@/lib/newsletter-model';
import { upsertSubscriberTimezone } from '@/lib/newsletter-service';
import { renderWelcomeEmail } from '@/lib/newsletter-html';
import { sendResendEmail } from '@/lib/resend';

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function getResendKey(): string {
  return (process.env.RESEND_API_KEY || '').trim().replace(/^["']|["']$/g, '');
}

function getSegmentId(): string {
  return (
    process.env.RESEND_SEGMENT_ID ||
    process.env.RESEND_AUDIENCE_ID ||
    ''
  )
    .trim()
    .replace(/^["']|["']$/g, '');
}

async function appendLocalSubscriber(payload: {
  email: string;
  source: string;
  subscribedAt: string;
}): Promise<void> {
  const dir = path.join(process.cwd(), 'data');
  await fs.mkdir(dir, { recursive: true });
  const file = path.join(dir, 'subscribers.json');
  let list: { email: string }[] = [];
  try {
    list = JSON.parse(await fs.readFile(file, 'utf-8'));
    if (!Array.isArray(list)) list = [];
  } catch {
    list = [];
  }
  if (!list.some((s) => s.email === payload.email)) {
    list.push(payload);
    await fs.writeFile(file, JSON.stringify(list, null, 2), 'utf-8');
  }
}

/**
 * Newsletter subscribe via Resend Contacts + Segment.
 *
 * Env:
 *   RESEND_API_KEY
 *   RESEND_SEGMENT_ID (or RESEND_AUDIENCE_ID)
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = String(body.email || '').trim().toLowerCase();
    const source = String(body.source || 'site').slice(0, 64);
    const timezone = normalizeTimeZone(body.timezone);

    if (!email || !isValidEmail(email) || email.length > 200) {
      return NextResponse.json({ error: 'Please provide a valid email address.' }, { status: 400 });
    }

    const payload = {
      email,
      source,
      subscribedAt: new Date().toISOString(),
    };

    const resendKey = getResendKey();
    const segmentId = getSegmentId();

    // If Resend is partially configured, fail loudly — never fake success
    if (resendKey && !segmentId) {
      return NextResponse.json(
        {
          error:
            'Newsletter segment is not configured. Set RESEND_SEGMENT_ID in .env.',
        },
        { status: 503 }
      );
    }
    if (!resendKey && segmentId) {
      return NextResponse.json(
        {
          error: 'Resend API key is missing. Set RESEND_API_KEY in .env.',
        },
        { status: 503 }
      );
    }

    if (resendKey && segmentId) {
      // Prefer Contacts API with segment attachment (current Resend model)
      let lastError = '';

      const attempts: Array<{ url: string; body: Record<string, unknown> }> = [
        {
          url: 'https://api.resend.com/contacts',
          body: {
            email,
            unsubscribed: false,
            segments: [{ id: segmentId }],
          },
        },
        // Without segments first if segment payload fails (then patch segment later not available simply)
        {
          url: 'https://api.resend.com/contacts',
          body: {
            email,
            unsubscribed: false,
          },
        },
        // Legacy audiences endpoint
        {
          url: `https://api.resend.com/audiences/${segmentId}/contacts`,
          body: {
            email,
            unsubscribed: false,
          },
        },
      ];

      for (const attempt of attempts) {
        const res = await fetch(attempt.url, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${resendKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(attempt.body),
        });

        if (res.ok || res.status === 409) {
          await upsertSubscriberTimezone({ email, timezone, source }).catch(() => undefined);
          if (process.env.NODE_ENV !== 'production') {
            await appendLocalSubscriber(payload).catch(() => undefined);
          }
          if (res.ok) {
            const welcome = renderWelcomeEmail();
            await sendResendEmail({
              to: email,
              subject: welcome.subject,
              html: welcome.html,
              text: welcome.text,
            }).catch(() => undefined);
          }
          return NextResponse.json({
            success: true,
            delivery: 'resend',
            message: 'You are on the list. One letter on Sunday. No roundup.',
          });
        }

        lastError = await res.text().catch(() => `HTTP ${res.status}`);
        // Invalid key / auth — do not try more variants
        if (res.status === 401 || res.status === 403) break;
        try {
          const parsed = JSON.parse(lastError);
          if (
            typeof parsed?.message === 'string' &&
            /api key is invalid/i.test(parsed.message)
          ) {
            break;
          }
        } catch {
          /* ignore */
        }
      }

      console.error('[subscribe] Resend failed:', lastError);

      let friendly =
        'Could not add you to the newsletter list. Please try again or email me directly.';
      try {
        const parsed = JSON.parse(lastError);
        if (parsed?.message === 'API key is invalid') {
          friendly =
            'Resend API key is invalid or revoked. Create a new key in Resend and update RESEND_API_KEY in .env, then restart the server.';
        } else if (typeof parsed?.message === 'string') {
          friendly = `Resend error: ${parsed.message}`;
        }
      } catch {
        /* keep default */
      }

      return NextResponse.json(
        {
          error: friendly,
          delivery: 'failed',
          detail: process.env.NODE_ENV !== 'production' ? lastError : undefined,
        },
        { status: 502 }
      );
    }

    // No Resend configured: local-only (dev) or webhook
    const webhook = process.env.NEWSLETTER_WEBHOOK_URL || process.env.CONTACT_WEBHOOK_URL;
    if (webhook) {
      try {
        const res = await fetch(webhook, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: 'subscribe', ...payload }),
        });
        if (res.ok) {
          return NextResponse.json({
            success: true,
            delivery: 'webhook',
            message: 'You are on the list.',
          });
        }
      } catch (err) {
        console.error('Subscribe webhook failed:', err);
      }
    }

    if (process.env.NODE_ENV !== 'production') {
      await appendLocalSubscriber(payload);
      await upsertSubscriberTimezone({ email, timezone, source }).catch(() => undefined);
      return NextResponse.json({
        success: true,
        delivery: 'local',
        message:
          'Saved locally (dev only). Configure a valid RESEND_API_KEY + RESEND_SEGMENT_ID to sync to Resend.',
      });
    }

    return NextResponse.json(
      {
        error:
          'Newsletter is not configured yet. Email me directly and I will add you manually.',
        email: process.env.CONTACT_EMAIL,
      },
      { status: 503 }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: `Failed to subscribe: ${message}` }, { status: 500 });
  }
}
