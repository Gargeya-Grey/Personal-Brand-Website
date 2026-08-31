import { NextResponse } from 'next/server';
import { requireEditorialUser } from '@/lib/newsletter-auth';
import { getNewsletterDashboard } from '@/lib/newsletter-metrics';

export async function GET() {
  try {
    const user = await requireEditorialUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const dashboard = await getNewsletterDashboard();
    return NextResponse.json(dashboard, { headers: { 'Cache-Control': 'private, no-store' } });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
