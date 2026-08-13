/**
 * Merge a pack into the store:
 * 1) Always upsert local data/x-content-packs.json
 * 2) If APP_URL + X_SCOUT_SECRET are set, POST to hosted /api/x-content/ingest
 *    so production X To-Do updates without redeploying.
 *
 * Usage: node scripts/merge-x-pack.mjs path/to/pack.json
 */
import fs from 'fs/promises';
import path from 'path';
import { readFileSync, existsSync } from 'fs';

const root = process.cwd();
const storePath = path.join(root, 'data', 'x-content-packs.json');

function loadEnvFile(filePath) {
  if (!existsSync(filePath)) return;
  const text = readFileSync(filePath, 'utf8');
  for (const line of text.split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith('#')) continue;
    const eq = t.indexOf('=');
    if (eq < 0) continue;
    const key = t.slice(0, eq).trim();
    let val = t.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (process.env[key] === undefined) process.env[key] = val;
  }
}

loadEnvFile(path.join(root, '.env.local'));
loadEnvFile(path.join(root, '.env'));

async function readStdin() {
  const chunks = [];
  for await (const c of process.stdin) chunks.push(c);
  return Buffer.concat(chunks).toString('utf8');
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

/** Two sitting packs: morning 11, evening 19. Legacy extra slots still accepted as ids. */
const SCOUT_IST_SLOTS = [11, 19];

function istParts(now = new Date()) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    hour12: false,
  }).formatToParts(now);
  const get = (type) => parts.find((p) => p.type === type)?.value ?? '';
  let hour = parseInt(get('hour'), 10);
  if (hour === 24) hour = 0;
  return { date: `${get('year')}-${get('month')}-${get('day')}`, hour };
}

function shiftDateString(date, dayDelta) {
  const [y, m, d] = date.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d + dayDelta)).toISOString().slice(0, 10);
}

/** pack-YYYY-MM-DD-tHH — HH is IST scout slot (11,13,…21) */
function runPackId(now = new Date()) {
  let { date, hour } = istParts(now);
  let slotHour;
  if (hour < 11) {
    date = shiftDateString(date, -1);
    slotHour = 21;
  } else {
    slotHour = SCOUT_IST_SLOTS[0];
    for (const s of SCOUT_IST_SLOTS) {
      if (hour >= s) slotHour = s;
    }
  }
  return `pack-${date}-t${String(slotHour).padStart(2, '0')}`;
}

function defaultSession(kind) {
  if (kind === 'reply') return 'sprint';
  if (kind === 'quote') return 'bonus';
  return 'core';
}

function defaultIntent(kind) {
  if (kind === 'reply') return 'growth';
  if (kind === 'flagship') return 'authority';
  if (kind === 'quote') return 'optional';
  return 'authority';
}

function defaultEst(kind) {
  if (kind === 'reply') return 75;
  if (kind === 'flagship') return 240;
  return 90;
}

function normalize(input) {
  const date =
    typeof input.date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(input.date)
      ? input.date
      : today();
  const id = input.id || runPackId();
  const now = new Date().toISOString();
  const drafts = Array.isArray(input.drafts) ? input.drafts : [];
  const normDrafts = drafts.map((d, i) => {
    const kind = d.kind || 'short';
    // Prefix draft ids with pack slot so same-day runs never collide on status preserve
    const rawId = d.id || `draft-${i + 1}`;
    const draftId = rawId.includes(id) ? rawId : `${id}__${rawId}`;
    return {
      id: draftId,
      kind,
      label: d.label || d.kind || `Draft ${i + 1}`,
      body: d.body || '',
      meta: d.meta,
      status: d.status || 'ready',
      priority: typeof d.priority === 'number' ? d.priority : kind === 'reply' ? 1 : 3,
      intent: d.intent || defaultIntent(kind),
      session: d.session || defaultSession(kind),
      estimatedSeconds: d.estimatedSeconds || defaultEst(kind),
      why: d.why || '',
      tip: d.tip,
      postingWindow: d.postingWindow || 'anytime',
      targetHandle: d.targetHandle,
      targetReach: d.targetReach,
      quality: d.quality,
    };
  });
  return {
    id,
    date,
    title: input.title || `X pack ${date}`,
    theme: input.theme,
    briefing: input.briefing || undefined,
    plannedMinutes: input.plannedMinutes,
    mvpDraftIds: input.mvpDraftIds,
    signals: Array.isArray(input.signals) ? input.signals : [],
    skipList: Array.isArray(input.skipList) ? input.skipList : [],
    drafts: normDrafts,
    schedule: Array.isArray(input.schedule) ? input.schedule : [],
    sessions: input.sessions,
    createdAt: input.createdAt || now,
    updatedAt: now,
  };
}

async function mergeLocal(pack) {
  let packs = [];
  try {
    packs = JSON.parse(await fs.readFile(storePath, 'utf8'));
    if (!Array.isArray(packs)) packs = [];
  } catch {
    packs = [];
  }

  const idx = packs.findIndex((p) => p.id === pack.id);
  if (idx >= 0) {
    const existing = packs[idx];
    // Always keep posted/skipped for the same draft identity — even if body was polished.
    // Re-opening Done tasks after scout re-ingest was a production bug.
    const packId = pack.id;
    const bare = (id) => {
      const s = String(id || '');
      if (s.startsWith(`${packId}__`)) return s.slice(packId.length + 2);
      const m = s.match(/^pack-\d{4}-\d{2}-\d{2}-t\d{2}__(.+)$/);
      return m ? m[1] : s;
    };
    const prevByExact = new Map((existing.drafts || []).map((d) => [d.id, d]));
    const prevByBare = new Map((existing.drafts || []).map((d) => [bare(d.id), d]));
    pack.createdAt = existing.createdAt || pack.createdAt;
    pack.drafts = pack.drafts.map((d) => {
      const prev = prevByExact.get(d.id) || prevByBare.get(bare(d.id));
      if (prev && (prev.status === 'posted' || prev.status === 'skipped')) {
        return { ...d, status: prev.status };
      }
      return { ...d, status: d.status || 'ready' };
    });
    packs[idx] = pack;
  } else {
    packs.unshift(pack);
  }

  // Retention: keep last 2 calendar days of packs (IST-oriented pack.date)
  const cutoff = retentionCutoffDate(2);
  const pruned = packs.filter((p) => {
    const d = String(p.date || '').slice(0, 10);
    return d && d >= cutoff;
  });
  if (pruned.length !== packs.length) {
    console.log(
      `Local prune: dropped ${packs.length - pruned.length} pack(s) older than ${cutoff} (retention 2d)`
    );
  }

  await fs.mkdir(path.dirname(storePath), { recursive: true });
  await fs.writeFile(storePath, JSON.stringify(pruned, null, 2), 'utf8');
  return pack;
}

function retentionCutoffDate(days = 2) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date());
  const get = (type) => parts.find((p) => p.type === type)?.value ?? '';
  const y = parseInt(get('year'), 10);
  const m = parseInt(get('month'), 10);
  const d = parseInt(get('day'), 10);
  const keep = Math.max(1, days);
  return new Date(Date.UTC(y, m - 1, d - (keep - 1))).toISOString().slice(0, 10);
}

async function pushRemote(pack) {
  const base = (process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL || '').replace(/\/$/, '');
  const secret = process.env.X_SCOUT_SECRET || '';
  if (!base || !secret) {
    return { skipped: true, reason: 'APP_URL or X_SCOUT_SECRET not set — local only' };
  }

  const url = `${base}/api/x-content/ingest`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${secret}`,
      'x-scout-secret': secret,
    },
    body: JSON.stringify({ pack, preserveStatuses: true }),
  });

  const contentType = res.headers.get('content-type') || '';
  const text = await res.text();
  let data = {};
  if (contentType.includes('application/json')) {
    try {
      data = JSON.parse(text);
    } catch {
      data = {};
    }
  }

  if (!res.ok) {
    // HTML 404 = host is running an old deploy without this route
    if (res.status === 404 || text.includes('This page could not be found')) {
      throw new Error(
        `Remote ingest 404 at ${url}\n` +
          `  → The live site does not have /api/x-content/ingest yet.\n` +
          `  → Redeploy this repo to https://sgargeya.com (and set X_SCOUT_SECRET on the host).\n` +
          `  → Quick check after deploy: open ${url} — you should see JSON, not a 404 page.`
      );
    }
    if (res.status === 401) {
      throw new Error(
        `Remote ingest 401 Unauthorized at ${url}\n` +
          `  → X_SCOUT_SECRET in local .env must match the host env var exactly.`
      );
    }
    throw new Error(
      `Remote ingest ${res.status}: ${data.error || res.statusText || text.slice(0, 120)}`
    );
  }
  return data;
}

async function main() {
  let raw;
  if (process.argv[2]) {
    raw = await fs.readFile(process.argv[2], 'utf8');
  } else if (!process.stdin.isTTY) {
    raw = await readStdin();
  } else {
    console.error('Usage: node scripts/merge-x-pack.mjs pack.json');
    process.exit(1);
  }

  const fence = raw.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fence) raw = fence[1];

  let parsed = JSON.parse(raw);
  if (parsed.pack) parsed = parsed.pack;
  if (Array.isArray(parsed)) parsed = parsed[0];

  let pack = normalize(parsed);
  if (!pack.drafts.length) {
    console.error('Pack has no drafts');
    process.exit(1);
  }

  pack = await mergeLocal(pack);
  console.log(`Local upsert: ${pack.id} (${pack.drafts.length} drafts) → ${storePath}`);

  try {
    const remote = await pushRemote(pack);
    if (remote.skipped) {
      console.log(`Remote: skipped (${remote.reason})`);
    } else {
      console.log(`Remote: OK cloud=${remote.cloud} → ${JSON.stringify(remote.pack)}`);
    }
  } catch (e) {
    console.error('Remote push failed:', e.message || e);
    console.error('Local file is updated; fix APP_URL/X_SCOUT_SECRET or host deploy.');
    process.exitCode = 2;
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
