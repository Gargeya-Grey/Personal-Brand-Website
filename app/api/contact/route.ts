import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { siteConfig } from '@/lib/site-config';

const PROJECT_TYPES = new Set([
  'ai-development',
  'venture-architecture',
  'educational-evaluation',
  'consulting',
  'other',
]);

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * Contact intake. Prefers Resend or webhook when configured;
 * always persists a durable fallback in non-ephemeral environments and
 * returns a mailto URI so the client never silently drops messages.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const name = String(body.name || '').trim();
    const email = String(body.email || '').trim().toLowerCase();
    const projectType = String(body.projectType || 'other').trim();
    const details = String(body.details || '').trim();

    if (!name || name.length > 120) {
      return NextResponse.json({ error: 'Please provide a valid name.' }, { status: 400 });
    }
    if (!email || !isValidEmail(email) || email.length > 200) {
      return NextResponse.json({ error: 'Please provide a valid email address.' }, { status: 400 });
    }
    if (!details || details.length < 10 || details.length > 8000) {
      return NextResponse.json(
        { error: 'Please share a bit more detail (at least 10 characters).' },
        { status: 400 }
      );
    }
    if (!PROJECT_TYPES.has(projectType)) {
      return NextResponse.json({ error: 'Invalid inquiry type.' }, { status: 400 });
    }

    const payload = {
      name,
      email,
      projectType,
      details,
      receivedAt: new Date().toISOString(),
      userAgent: request.headers.get('user-agent') || undefined,
    };

    let delivery: 'resend' | 'webhook' | 'local' | 'mailto' = 'mailto';

    // 1) Resend transactional email
    const resendKey = process.env.RESEND_API_KEY;
    if (resendKey) {
      // Prefer CONTACT_EMAIL (e.g. personal inbox while brand address is public-facing)
      const to = process.env.CONTACT_EMAIL || siteConfig.email;
      const from = process.env.RESEND_FROM || 'onboarding@resend.dev';
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${resendKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from,
          to: [to],
          reply_to: email,
          subject: `[Site] ${projectType} — ${name}`,
          text: [
            `Name: ${name}`,
            `Email: ${email}`,
            `Type: ${projectType}`,
            '',
            details,
          ].join('\n'),
        }),
      });
      if (res.ok) {
        delivery = 'resend';
      } else {
        console.error('Resend contact error:', await res.text());
      }
    }

    // 2) Generic webhook (Zapier, Make, n8n, Discord, Slack, etc.)
    const webhook = process.env.CONTACT_WEBHOOK_URL;
    if (delivery === 'mailto' && webhook) {
      try {
        const res = await fetch(webhook, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: 'contact', ...payload }),
        });
        if (res.ok) delivery = 'webhook';
      } catch (err) {
        console.error('Contact webhook failed:', err);
      }
    }

    // 3) Local append for self-hosted / dev
    if (delivery === 'mailto' && process.env.NODE_ENV !== 'production') {
      try {
        const dir = path.join(process.cwd(), 'data');
        await fs.mkdir(dir, { recursive: true });
        const file = path.join(dir, 'inquiries.json');
        let list: unknown[] = [];
        try {
          list = JSON.parse(await fs.readFile(file, 'utf-8'));
          if (!Array.isArray(list)) list = [];
        } catch {
          list = [];
        }
        list.push(payload);
        await fs.writeFile(file, JSON.stringify(list, null, 2), 'utf-8');
        delivery = 'local';
      } catch (err) {
        console.error('Local inquiry save failed:', err);
      }
    }

    const mailto = `mailto:${encodeURIComponent(siteConfig.email)}?subject=${encodeURIComponent(
      `[Inquiry] ${projectType} — ${name}`
    )}&body=${encodeURIComponent(
      `From: ${name} <${email}>\n\n${details}`
    )}`;

    return NextResponse.json({
      success: true,
      delivery,
      mailto: delivery === 'mailto' ? mailto : undefined,
      message:
        delivery === 'mailto'
          ? 'Open your email client to complete sending, or email me directly.'
          : 'Message received. I typically reply within 24–48 hours.',
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: `Failed to process contact: ${message}` }, { status: 500 });
  }
}
