import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { requireAllowedSession } from '@/lib/auth';
import {
  getXContentPacks,
  getLatestXContentPack,
  getXContentPack,
  upsertXContentPack,
  updateDraftStatus,
  type XContentPack,
  type XDraftStatus,
} from '@/lib/x-content-service';
import { parsePackImport, PACK_JSON_EXAMPLE } from '@/lib/x-content-import';

function checkCsrf(request: Request): boolean {
  const origin = request.headers.get('origin');
  if (!origin) return true;
  const requestUrl = new URL(request.url);
  if (origin === requestUrl.origin) return true;
  // Allow apex ↔ www when both point at this site
  try {
    const o = new URL(origin);
    const host = requestUrl.hostname.replace(/^www\./, '');
    const originHost = o.hostname.replace(/^www\./, '');
    return o.protocol === requestUrl.protocol && originHost === host;
  } catch {
    return false;
  }
}

async function requireAuth() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('auth_session');
  return requireAllowedSession(sessionCookie?.value);
}

/**
 * Protected: list packs, latest, or one by id.
 * GET /api/x-content?schema=1 — returns JSON example for scouts
 */
export async function GET(request: Request) {
  try {
    const user = await requireAuth();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    if (searchParams.get('schema') === '1') {
      return NextResponse.json({ example: PACK_JSON_EXAMPLE, path: 'data/x-content-packs.json' });
    }

    const id = searchParams.get('id');
    const latest = searchParams.get('latest') === '1' || searchParams.get('latest') === 'true';

    if (id) {
      const pack = await getXContentPack(id);
      if (!pack) return NextResponse.json({ error: 'Pack not found' }, { status: 404 });
      return NextResponse.json(pack);
    }

    if (latest) {
      const pack = await getLatestXContentPack();
      return NextResponse.json(pack);
    }

    const packs = await getXContentPacks();
    // Newest first: updatedAt then date (client also sorts; server is source of truth order)
    const sorted = [...packs].sort((a, b) => {
      const u = (b.updatedAt || '').localeCompare(a.updatedAt || '');
      if (u !== 0) return u;
      return (b.date || '').localeCompare(a.date || '');
    });
    return NextResponse.json(sorted, {
      headers: {
        'Cache-Control': 'private, no-store, max-age=0, must-revalidate',
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: `Failed to load X packs: ${message}` }, { status: 500 });
  }
}

/**
 * Protected mutations:
 *   { pack } — upsert pack object
 *   { packId, draftId, status } — patch draft status
 *   { import: string, dryRun?: boolean, preserveStatuses?: boolean } — parse scout paste / JSON
 */
export async function POST(request: Request) {
  try {
    if (!checkCsrf(request)) {
      return NextResponse.json({ error: 'CSRF check failed' }, { status: 403 });
    }

    const user = await requireAuth();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    if (body.packId && body.draftId && body.status) {
      const status = body.status as XDraftStatus;
      if (!['ready', 'posted', 'skipped'].includes(status)) {
        return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
      }
      const pack = await updateDraftStatus(body.packId, body.draftId, status);
      if (!pack) return NextResponse.json({ error: 'Pack or draft not found' }, { status: 404 });
      return NextResponse.json(pack);
    }

    if (typeof body.import === 'string') {
      const raw = body.import as string;
      if (!raw.trim()) {
        return NextResponse.json({ error: 'Import text is empty' }, { status: 400 });
      }

      let parsed;
      try {
        parsed = parsePackImport(raw);
      } catch (e: unknown) {
        return NextResponse.json(
          { error: e instanceof Error ? e.message : 'Parse failed' },
          { status: 400 }
        );
      }

      if (body.dryRun) {
        return NextResponse.json({
          dryRun: true,
          source: parsed.source,
          warning: parsed.warning,
          pack: parsed.pack,
        });
      }

      const saved = await upsertXContentPack(parsed.pack, {
        preserveStatuses: body.preserveStatuses !== false,
      });
      return NextResponse.json({
        source: parsed.source,
        warning: parsed.warning,
        pack: saved,
      });
    }

    if (body.pack) {
      const pack = body.pack as XContentPack;
      if (!pack.date || !Array.isArray(pack.drafts)) {
        return NextResponse.json({ error: 'Invalid pack: need date and drafts' }, { status: 400 });
      }
      if (!pack.id) {
        pack.id = `pack-${pack.date}`;
      }
      if (!pack.createdAt) pack.createdAt = new Date().toISOString();
      const saved = await upsertXContentPack(pack, {
        preserveStatuses: body.preserveStatuses !== false,
      });
      return NextResponse.json({ pack: saved });
    }

    return NextResponse.json(
      { error: 'Provide pack, import text, or packId+draftId+status' },
      { status: 400 }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: `Failed to save X pack: ${message}` }, { status: 500 });
  }
}
