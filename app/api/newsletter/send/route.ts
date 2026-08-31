import { NextResponse } from 'next/server';
import { checkCsrf, requireEditorialUser } from '@/lib/newsletter-auth';
import { getNewsletterWeek } from '@/lib/newsletter-service';
import { sendWeekNow } from '@/lib/newsletter-send';
import { renderNewsletterEmail } from '@/lib/newsletter-html';

export async function POST(request: Request) {
  try {
    if (!checkCsrf(request)) {
      return NextResponse.json({ error: 'Invalid origin' }, { status: 403 });
    }
    const user = await requireEditorialUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const week = await getNewsletterWeek(String(body.id || ''));
    if (!week) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    if (body.preview === true) {
      const rendered = renderNewsletterEmail(week, { includeUnsubscribe: false });
      return NextResponse.json({ html: rendered.html, text: rendered.text, subject: rendered.subject });
    }

    const testEmail = typeof body.test === 'string' ? body.test.trim().toLowerCase() : '';
    if (testEmail) {
      const sent = await sendWeekNow(week, { onlyEmail: testEmail, forceAll: true });
      return NextResponse.json({ ok: sent.sent > 0, send: sent, week: sent.week });
    }

    const sent = await sendWeekNow(week, { forceAll: Boolean(body.forceAll) });
    return NextResponse.json({ ok: !sent.error, send: sent, week: sent.week });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
