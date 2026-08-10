import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { requireAllowedSession } from '@/lib/auth';
import { getLabSummary } from '@/lib/x-lab-service';
import { xOAuthConfigured } from '@/lib/x-api';
import { isTokenEncryptionConfigured } from '@/lib/x-lab-crypto';

export async function GET(request: Request) {
  try {
    const cookieStore = await cookies();
    const user = await requireAllowedSession(cookieStore.get('auth_session')?.value);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const rangeParam = searchParams.get('range') || '30d';
    const range =
      rangeParam === '7d' || rangeParam === '90d' || rangeParam === 'all'
        ? rangeParam
        : '30d';

    const payload = await getLabSummary(range);
    return NextResponse.json(
      {
        ...payload,
        config: {
          xOAuthConfigured: xOAuthConfigured(),
          encryptionConfigured: isTokenEncryptionConfigured(),
        },
      },
      { headers: { 'Cache-Control': 'private, no-store' } }
    );
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Summary failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
