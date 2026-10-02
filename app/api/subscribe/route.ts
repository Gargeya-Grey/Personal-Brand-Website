import { NextResponse } from 'next/server';
import { normalizeTimeZone } from '@/lib/newsletter-model';
import { createNewsletterConfirmation } from '@/lib/newsletter-confirmation';
import { admitPublicIntake, releasePublicIntake } from '@/lib/security-state';
import { getSiteOrigin } from '@/lib/site-config';
import { getResendKey, getResendSegmentId, sendResendEmail } from '@/lib/resend';

export async function POST(request: Request) {
  let identity: string | undefined;
  let reserved = false;
  try {
    const body = await request.json();
    const email = String(body.email || '').trim().toLowerCase();
    const source = String(body.source || 'site').slice(0, 64);
    const timezone = normalizeTimeZone(body.timezone);
    if (email.length > 200 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Please provide a valid email address.' }, { status: 400 });
    }
    if (!getResendKey() || !getResendSegmentId()) {
      return NextResponse.json({ error: 'Newsletter signup is temporarily unavailable. Please email me directly.' }, { status: 503 });
    }
    identity = `subscribe:${email}:${Math.floor(Date.now()/600000)}`;
    const admission = await admitPublicIntake(request, email, identity, 1);
    if (admission === 'denied') return NextResponse.json({ error: 'Too many requests. Please try later.' },
      { status: 429, headers: { 'Retry-After': '3600' } });
    if (admission === 'allowed') {
      reserved = true;
      const token = createNewsletterConfirmation(email, timezone, source);
      const link = new URL('/notes/confirm', getSiteOrigin());
      link.searchParams.set('token', token);
      const result = await sendResendEmail({ to: email, subject: 'Confirm your Sunday letter subscription',
        text: `Confirm your subscription within 30 minutes: ${link.href}\nIf you did not ask to subscribe, ignore this email.`,
        html: `<p>Confirm your subscription within 30 minutes.</p><p><a href="${link.href.replace(/&/g, '&amp;')}">Confirm subscription</a></p><p>If you did not ask to subscribe, ignore this email.</p>` });
      if (!result.ok) {
        await releasePublicIntake(identity);
        reserved = false;
        return NextResponse.json({ error: 'Could not send confirmation. Please try again later.' }, { status: 502 });
      }
      reserved = false;
    }
    return NextResponse.json({ success: true, delivery: 'confirmation',
      message: 'Check your inbox and confirm your subscription. Existing opt-outs remain in effect until you confirm.' });
  } catch {
    if (reserved && identity) await releasePublicIntake(identity).catch(() => undefined);
    return NextResponse.json({ error: 'Newsletter signup is temporarily unavailable. Please try later.' }, { status: 503 });
  }
}
