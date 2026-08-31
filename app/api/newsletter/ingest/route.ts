import { NextResponse } from 'next/server';
import { authorizeScout } from '@/lib/newsletter-auth';
import {
  getCurrentWeek,
  getNewsletterTaste,
  getNewsletterWeeks,
  ingestNewsletterWeek,
  newsletterUsesCloud,
} from '@/lib/newsletter-service';
import { BRIEF_URL, VOICE_URL, upcomingSunday } from '@/lib/newsletter-model';

export async function GET(request: Request) {
  try {
    if (!authorizeScout(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const weeks = await getNewsletterWeeks();
    const current = await getCurrentWeek();
    const taste = await getNewsletterTaste();
    return NextResponse.json({
      ok: true,
      sunday: upcomingSunday(),
      current,
      taste,
      briefUrl: BRIEF_URL,
      voiceUrl: VOICE_URL,
      weeks: weeks.map((w) => ({
        id: w.id,
        weekOf: w.weekOf,
        stage: w.stage,
        title: w.title,
        autoPublish: w.autoPublish,
        acknowledgedAt: w.acknowledgedAt,
      })),
      cloud: newsletterUsesCloud(),
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    if (!authorizeScout(request)) {
      return NextResponse.json(
        {
          error:
            'Unauthorized. Set X_SCOUT_SECRET on the host and send it as Bearer or x-scout-secret.',
        },
        { status: 401 }
      );
    }
    const body = await request.json();
    const incoming = body?.week || body;
    const saved = await ingestNewsletterWeek(incoming);
    return NextResponse.json({
      ok: true,
      week: {
        id: saved.id,
        weekOf: saved.weekOf,
        stage: saved.stage,
        title: saved.title,
        slug: saved.slug,
      },
      cloud: newsletterUsesCloud(),
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
