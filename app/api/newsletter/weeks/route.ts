import { NextResponse } from 'next/server';
import { checkCsrf, requireEditorialUser } from '@/lib/newsletter-auth';
import {
  acknowledge,
  applyCuratorEdit,
  setAutoPublish,
  skipWeek,
  type NewsletterLink,
  type NewsletterTopicStatus,
} from '@/lib/newsletter-model';
import {
  getNewsletterWeek,
  getNewsletterWeeks,
  upsertNewsletterWeek,
} from '@/lib/newsletter-service';
import { sendWeekNow } from '@/lib/newsletter-send';

export async function GET(request: Request) {
  try {
    const user = await requireEditorialUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (id) {
      const week = await getNewsletterWeek(id);
      if (!week) return NextResponse.json({ error: 'Not found' }, { status: 404 });
      return NextResponse.json(week, { headers: { 'Cache-Control': 'private, no-store' } });
    }
    const weeks = await getNewsletterWeeks();
    return NextResponse.json(weeks, { headers: { 'Cache-Control': 'private, no-store' } });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    if (!checkCsrf(request)) {
      return NextResponse.json({ error: 'Invalid origin' }, { status: 403 });
    }
    const user = await requireEditorialUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const id = String(body.id || '');
    const week = await getNewsletterWeek(id);
    if (!week) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const action = String(body.action || 'save');
    const now = new Date();

    if (action === 'save') {
      const links = Array.isArray(body.links) ? (body.links as NewsletterLink[]) : undefined;
      const next = applyCuratorEdit(
        week,
        {
          title: body.title,
          dek: body.dek,
          subject: body.subject,
          bodyMd: body.bodyMd,
          slug: body.slug,
          links,
        },
        now
      );
      const saved = await upsertNewsletterWeek(next);
      return NextResponse.json({ ok: true, week: saved });
    }

    if (action === 'autoPublish') {
      const saved = await upsertNewsletterWeek(setAutoPublish(week, Boolean(body.autoPublish), now));
      return NextResponse.json({ ok: true, week: saved });
    }

    if (action === 'acknowledge') {
      let next = acknowledge(week, now);
      const saved = await upsertNewsletterWeek(next);
      if (!saved.autoPublish) {
        const sent = await sendWeekNow(saved, { forceAll: true, now });
        return NextResponse.json({ ok: true, week: sent.week, send: sent });
      }
      return NextResponse.json({ ok: true, week: saved });
    }

    if (action === 'skip') {
      const saved = await upsertNewsletterWeek(skipWeek(week, String(body.note || ''), now));
      return NextResponse.json({ ok: true, week: saved });
    }

    if (action === 'topic') {
      const topicId = String(body.topicId || '');
      const status = String(body.status || '') as NewsletterTopicStatus;
      const note = String(body.note || '').slice(0, 500);
      const topics = week.topics.map((topic) => {
        if (topic.id !== topicId && topic.title !== topicId) return topic;
        return {
          ...topic,
          status: status === 'picked' || status === 'rejected' ? status : topic.status,
          curatorNote: note || topic.curatorNote,
        };
      });
      const saved = await upsertNewsletterWeek({
        ...week,
        topics,
        updatedAt: now.toISOString(),
      });
      return NextResponse.json({ ok: true, week: saved });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
