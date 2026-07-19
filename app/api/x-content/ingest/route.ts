import { NextResponse } from 'next/server';
import { upsertXContentPack, xContentUsesCloud } from '@/lib/x-content-service';
import { parsePackImport } from '@/lib/x-content-import';
import type { XContentPack } from '@/lib/x-content-model';

/**
 * Machine ingest for local Grok scout → hosted site.
 * Auth: Authorization: Bearer <X_SCOUT_SECRET>  OR  x-scout-secret header
 * (Not Google OAuth — so automation can push without a browser session.)
 *
 * Body: { pack } | { import: string }
 */
function authorize(request: Request): boolean {
  const secret = process.env.X_SCOUT_SECRET;
  if (!secret || secret.length < 16) {
    // Misconfigured production: refuse rather than open write
    return false;
  }
  const header =
    request.headers.get('x-scout-secret') ||
    request.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
  return header === secret;
}

export async function POST(request: Request) {
  try {
    if (!authorize(request)) {
      return NextResponse.json(
        {
          error:
            'Unauthorized. Set X_SCOUT_SECRET on the host and send it as Bearer or x-scout-secret.',
        },
        { status: 401 }
      );
    }

    const body = await request.json();
    let pack: XContentPack;

    if (typeof body.import === 'string') {
      const parsed = parsePackImport(body.import);
      pack = parsed.pack;
    } else if (body.pack) {
      pack = body.pack as XContentPack;
    } else {
      // raw pack at root
      pack = body as XContentPack;
    }

    if (!pack?.date || !Array.isArray(pack.drafts)) {
      return NextResponse.json(
        { error: 'Invalid pack: need date and drafts[]' },
        { status: 400 }
      );
    }
    if (!pack.id) pack.id = `pack-${pack.date}`;
    if (!pack.createdAt) pack.createdAt = new Date().toISOString();
    if (!pack.title) pack.title = `X pack ${pack.date}`;
    if (!pack.signals) pack.signals = [];
    if (!pack.skipList) pack.skipList = [];
    if (!pack.schedule) pack.schedule = [];

    const saved = await upsertXContentPack(pack, {
      preserveStatuses: body.preserveStatuses !== false,
    });

    return NextResponse.json({
      ok: true,
      pack: { id: saved.id, date: saved.date, drafts: saved.drafts.length, title: saved.title },
      cloud: xContentUsesCloud(),
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    endpoint: '/api/x-content/ingest',
    auth: 'Bearer X_SCOUT_SECRET or x-scout-secret header',
    cloud: xContentUsesCloud(),
  });
}
