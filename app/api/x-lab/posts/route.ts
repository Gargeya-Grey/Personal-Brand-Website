import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { requireAllowedSession } from '@/lib/auth';
import { listPosts } from '@/lib/x-lab-service';

export async function GET(request: Request) {
  try {
    const cookieStore = await cookies();
    const user = await requireAllowedSession(cookieStore.get('auth_session')?.value);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const rangeParam = searchParams.get('range') || '30d';
    const range =
      rangeParam === '7d' || rangeParam === '90d' || rangeParam === 'all' || rangeParam === '30d'
        ? (rangeParam as '7d' | '30d' | '90d' | 'all')
        : '30d';
    const content_class = searchParams.get('content_class') || 'all';
    const limit = Math.min(500, parseInt(searchParams.get('limit') || '100', 10) || 100);

    const posts = await listPosts({ range, content_class, limit });
    return NextResponse.json(
      { posts, n: posts.length },
      { headers: { 'Cache-Control': 'private, no-store' } }
    );
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Posts failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
