import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { requireAllowedSession } from '@/lib/auth';
import { completeWithConfiguredProvider } from '@/lib/ai-providers';
import {
  buildChatDataPacket,
  getLabSummary,
  listPosts,
} from '@/lib/x-lab-service';

const SYSTEM = `You are the X Lab growth data scientist for @GargeyaS (private editorial tool).

Primary job: help him hack growth from engagements — what replies work, what to kill, originals vs replies, timing IST, funnel leaks.

Rules:
1. Answer ONLY from the JSON data packet. If evidence is thin, say so.
2. Prefer concrete numbers (n, medians, ER, dead_rate, Pareto shares). Cite tweet ids when listing posts.
3. Separate REACH plays (high impressions) from CONVERSION plays (high ER with enough impressions).
4. Never claim causation. Use "associated with" / "in this sample".
5. Call out small-n and unreliable buckets. ER needs impressions floor.
6. Follower deltas are snapshot-based only, not per-post attribution.
7. End with 2-4 testable experiments when asked about strategy.
8. Be concise, plain English, short bullets. English only. No em-dash characters.`;

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const user = await requireAllowedSession(cookieStore.get('auth_session')?.value);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json().catch(() => ({}));
    const question = typeof body.question === 'string' ? body.question.trim() : '';
    if (!question) {
      return NextResponse.json({ error: 'Missing question' }, { status: 400 });
    }
    if (question.length > 2000) {
      return NextResponse.json({ error: 'Question too long' }, { status: 400 });
    }

    const rangeParam = body.range || '30d';
    const range =
      rangeParam === '7d' || rangeParam === '90d' || rangeParam === 'all'
        ? rangeParam
        : '30d';

    const lab = await getLabSummary(range);
    if (!lab.summary) {
      return NextResponse.json(
        {
          error:
            lab.error ||
            'No warehouse data yet. Connect X and press Refresh first.',
        },
        { status: 400 }
      );
    }

    const posts = await listPosts({ range, limit: 200 });
    const packet = buildChatDataPacket(lab.summary, posts);

    const userContent = `DATA_PACKET:\n${JSON.stringify(packet)}\n\nQUESTION:\n${question}`;

    const { provider, model, text } = await completeWithConfiguredProvider({
      provider: body.provider,
      systemPrompt: SYSTEM,
      userContent,
      jsonFormat: false,
    });

    return NextResponse.json(
      {
        answer: text,
        provider,
        model,
        range,
        sampleSize: packet.sampleSize,
      },
      { headers: { 'Cache-Control': 'private, no-store' } }
    );
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Chat failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
