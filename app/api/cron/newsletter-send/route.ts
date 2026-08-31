import { NextResponse } from 'next/server';
import { authorizeCron } from '@/lib/newsletter-auth';
import { canRelease, isInSendWindow } from '@/lib/newsletter-model';
import { getNewsletterWeeks } from '@/lib/newsletter-service';
import { sendWeekNow } from '@/lib/newsletter-send';

export async function GET(request: Request) {
  return runCron(request);
}

export async function POST(request: Request) {
  return runCron(request);
}

async function runCron(request: Request) {
  try {
    if (!authorizeCron(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const now = new Date();
    const weeks = await getNewsletterWeeks();
    const due = weeks.filter(
      (week) => canRelease(week) && (isInSendWindow(week.weekOf, now) || (week.acknowledgedAt && !week.autoPublish))
    );
    const results = [];
    for (const week of due) {
      const sent = await sendWeekNow(week, { now });
      results.push({
        id: week.id,
        sent: sent.sent,
        complete: sent.complete,
        error: sent.error,
      });
    }
    return NextResponse.json({ ok: true, ran: results.length, results });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
