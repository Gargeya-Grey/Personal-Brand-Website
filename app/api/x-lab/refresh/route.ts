import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { requireAllowedSession } from '@/lib/auth';
import { runRefresh } from '@/lib/x-lab-service';

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const user = await requireAllowedSession(cookieStore.get('auth_session')?.value);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json().catch(() => ({}));
    const force = !!body.force;
    const maxPages = typeof body.maxPages === 'number' ? body.maxPages : 2;

    const result = await runRefresh({ force, maxPages });
    if (!result.ok) {
      return NextResponse.json(result, { status: 502 });
    }
    return NextResponse.json(result, {
      headers: { 'Cache-Control': 'private, no-store' },
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Refresh failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
