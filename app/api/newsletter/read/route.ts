import { NextResponse } from 'next/server';
import { READ_CAP_SECONDS } from '@/lib/newsletter-model';
import { getWeekBySlug, recordReadPing } from '@/lib/newsletter-service';
import { publicWeek } from '@/lib/newsletter-model';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const issueId = String(body.issueId || body.slug || '').trim().slice(0, 80);
    const sessionId = String(body.sessionId || '').trim().slice(0, 80);
    const seconds = Number(body.seconds);
    if (!issueId || !sessionId || !Number.isFinite(seconds)) {
      return NextResponse.json({ ok: false }, { status: 400 });
    }
    const week = await getWeekBySlug(issueId);
    if (!week || !publicWeek(week)) {
      return NextResponse.json({ ok: false }, { status: 404 });
    }
    await recordReadPing({
      issueId: week.id,
      sessionId,
      seconds: Math.min(READ_CAP_SECONDS, Math.max(0, Math.round(seconds))),
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
