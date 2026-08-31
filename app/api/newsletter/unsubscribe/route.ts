import { NextResponse } from 'next/server';
import { unsubscribeResendContact } from '@/lib/resend';
import { verifyUnsubscribeToken } from '@/lib/newsletter-unsubscribe';

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get('content-type') || '';
    let email = '';
    let token = '';
    if (contentType.includes('application/json')) {
      const body = await request.json();
      email = String(body.email || '').trim().toLowerCase();
      token = String(body.token || '').trim();
    } else {
      const form = await request.formData();
      email = String(form.get('email') || '').trim().toLowerCase();
      token = String(form.get('token') || '').trim();
    }

    if (!isValidEmail(email) || !verifyUnsubscribeToken(email, token)) {
      return NextResponse.json({ error: 'That unsubscribe link is not valid.' }, { status: 400 });
    }

    const result = await unsubscribeResendContact(email);
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
