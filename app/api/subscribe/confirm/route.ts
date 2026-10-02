import { NextResponse } from 'next/server';
import { isTrustedOrigin } from '@/lib/csrf';
import { readNewsletterConfirmation, consumeNewsletterConfirmation } from '@/lib/newsletter-confirmation';
import { admitPublicIntake } from '@/lib/security-state';
import { addResendContact, setResendUnsubscribed, sendResendEmail } from '@/lib/resend';
import { renderWelcomeEmail } from '@/lib/newsletter-html';
import { confirmSubscriber } from '@/lib/newsletter-service';

export async function POST(request: Request) {
  if (!isTrustedOrigin(request)) return NextResponse.json({ error: 'Untrusted origin' }, { status: 403 });
  try {
    const form = await request.formData();
    const token = String(form.get('token') || '');
    const pending = readNewsletterConfirmation(token);
    if (!pending) return NextResponse.json({ error: 'Confirmation expired or invalid. Request a new link.' }, { status: 400 });
    const admission = await admitPublicIntake(request, pending.email, `confirm:${pending.nonce}`, 7);
    if (admission === 'denied') return NextResponse.json({ error: 'Too many requests. Please try later.' }, { status: 429, headers: { 'Retry-After': '3600' } });
    const confirmed = await consumeNewsletterConfirmation(token);
    if (!confirmed) return NextResponse.json({ error: 'Confirmation already used. Request a new link if needed.' }, { status: 400 });
    const contact = await addResendContact({ email: confirmed.email, timezone: confirmed.timezone });
    if (!contact.ok) throw new Error('Provider activation failed');
    if (contact.status === 409) {
      const update = await setResendUnsubscribed(confirmed.email, false);
      if (!update.ok) throw new Error('Provider activation failed');
    }
    await confirmSubscriber(confirmed);
    if (contact.status !== 409) {
      const welcome = renderWelcomeEmail();
      await sendResendEmail({ to: confirmed.email, subject: welcome.subject,
        html: welcome.html, text: welcome.text }).catch(() => undefined);
    }
    return NextResponse.redirect(new URL('/notes/confirm?success=1', request.url), 303);
  } catch {
    return NextResponse.json({ error: 'Confirmation could not finish. Please request a new link later.' }, { status: 503 });
  }
}
