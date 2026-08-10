import 'server-only';
import fs from 'fs/promises';
import path from 'path';
import { supabase, isSupabaseConfigured } from './supabase';
import {
  DEFAULT_SESSIONS,
  defaultEstimatedSeconds,
  defaultIntentForKind,
  defaultSessionForKind,
  sumEstimatedSeconds,
  normalizeDraftMeta,
  type XContentPack,
  type XDraftItem,
  type XDraftKind,
  type XDraftStatus,
} from './x-content-model';

export type {
  XContentPack,
  XDraftIntent,
  XDraftItem,
  XDraftKind,
  XDraftStatus,
  XPostingWindow,
  XSessionBlock,
  XSessionId,
  XSignalItem,
} from './x-content-model';

export {
  DEFAULT_SESSIONS,
  createPackId,
  createRunPackId,
  formatPackRunLabel,
  defaultEstimatedSeconds,
  defaultIntentForKind,
  defaultSessionForKind,
  formatDuration,
  resolveMvpIds,
  sortDraftsForExecution,
  sumEstimatedSeconds,
} from './x-content-model';

const dataDir = path.join(process.cwd(), 'data');
const dataFilePath = path.join(dataDir, 'x-content-packs.json');

/** Keep at most this many calendar days of packs (pack.date, IST-oriented). */
export const X_PACK_RETENTION_DAYS = 2;

let cachedPacks: XContentPack[] | null = null;
let cacheLoadedAt = 0;
const CACHE_TTL_MS = 2_000;
let lastPruneAt = 0;
const PRUNE_EVERY_MS = 60_000;

/**
 * Bare draft id for fuzzy match (handles `pack-…-t15__r-foo` vs `r-foo`).
 */
export function bareDraftId(draftId: string, packId?: string): string {
  const id = String(draftId || '').trim();
  if (!id) return id;
  if (packId && id.startsWith(`${packId}__`)) return id.slice(packId.length + 2);
  const m = id.match(/^pack-\d{4}-\d{2}-\d{2}-t\d{2}__(.+)$/);
  return m ? m[1] : id;
}

export function draftIdsEqual(a: string, b: string, packId?: string): boolean {
  if (a === b) return true;
  return bareDraftId(a, packId) === bareDraftId(b, packId);
}

/** YYYY-MM-DD in Asia/Kolkata, shifted by dayDelta. */
function istDateOnly(dayDelta = 0, now = new Date()): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(now);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? '';
  const y = parseInt(get('year'), 10);
  const m = parseInt(get('month'), 10);
  const d = parseInt(get('day'), 10);
  const utc = new Date(Date.UTC(y, m - 1, d + dayDelta));
  return utc.toISOString().slice(0, 10);
}

export function packRetentionCutoffDate(days = X_PACK_RETENTION_DAYS): string {
  // Keep today and (days-1) previous days → cutoff is today-(days-1) inclusive min date
  return istDateOnly(-(Math.max(1, days) - 1));
}

/**
 * Merge draft statuses from an existing pack into an incoming scout pack.
 * Always keep posted/skipped for the same draft identity (even if body was polished).
 * Body-only changes on ready drafts stay ready with new text.
 */
export function mergePreservedDraftStatuses(
  incoming: XDraftItem[],
  existing: XDraftItem[] | undefined,
  packId: string
): XDraftItem[] {
  const prevList = Array.isArray(existing) ? existing : [];
  const byExact = new Map(prevList.map((d) => [d.id, d]));
  const byBare = new Map(prevList.map((d) => [bareDraftId(d.id, packId), d]));

  return incoming.map((d) => {
    const prev = byExact.get(d.id) || byBare.get(bareDraftId(d.id, packId));
    if (!prev) return { ...d, status: d.status || 'ready' };
    // User already cleared this task — never re-open on scout re-ingest / polish.
    if (prev.status === 'posted' || prev.status === 'skipped') {
      return { ...d, status: prev.status };
    }
    if (prev.status === 'ready' || !prev.status) {
      return { ...d, status: d.status || 'ready' };
    }
    return { ...d, status: prev.status || d.status || 'ready' };
  });
}

export function findDraftInPack(
  pack: XContentPack,
  draftId: string
): XDraftItem | undefined {
  return pack.drafts.find((d) => draftIdsEqual(d.id, draftId, pack.id));
}

let supabaseCooldownUntil = 0;
let supabaseFailureLogged = false;
const SUPABASE_COOLDOWN_MS = 60_000;

function isSupabaseUsable(): boolean {
  return isSupabaseConfigured() && Date.now() >= supabaseCooldownUntil;
}

function markSupabaseUnavailable(reason: unknown): void {
  supabaseCooldownUntil = Date.now() + SUPABASE_COOLDOWN_MS;
  if (!supabaseFailureLogged) {
    supabaseFailureLogged = true;
    console.warn(
      `[x-content] Supabase unavailable — using local JSON for ~${SUPABASE_COOLDOWN_MS / 1000}s.`,
      reason
    );
  }
}

/** Local JSON is a laptop/dev fallback — Vercel FS is read-only. */
function preferLocalJson(): boolean {
  return !process.env.VERCEL && !isSupabaseConfigured();
}

async function ensureFile(): Promise<void> {
  try {
    await fs.access(dataFilePath);
  } catch {
    await fs.mkdir(dataDir, { recursive: true });
    await fs.writeFile(dataFilePath, '[]', 'utf-8');
  }
}

async function saveLocalSafe(packs: XContentPack[]): Promise<void> {
  try {
    await saveLocal(packs);
  } catch (e) {
    // On serverless (EROFS), cloud is the source of truth — never fail the request for this.
    if (isSupabaseConfigured() || process.env.VERCEL) return;
    throw e;
  }
}

function hydrateDraft(
  d: Partial<XDraftItem> & { id?: string; kind?: XDraftKind; label?: string; body?: string },
  index: number
): XDraftItem {
  const kind: XDraftKind =
    d.kind === 'reply' || d.kind === 'flagship' || d.kind === 'short' || d.kind === 'quote'
      ? d.kind
      : 'short';
  const label =
    typeof d.label === 'string' && d.label.trim() ? d.label : `Untitled ${kind}`;
  const body = typeof d.body === 'string' ? d.body : String(d.body ?? '');
  const id =
    typeof d.id === 'string' && d.id.trim() ? d.id.trim() : `draft-${index + 1}`;
  const { meta, tip } = normalizeDraftMeta(d.meta, d.tip);
  return {
    id,
    kind,
    label,
    body,
    meta,
    status: d.status ?? 'ready',
    priority:
      typeof d.priority === 'number'
        ? d.priority
        : kind === 'reply'
          ? 1 + Math.min(2, index)
          : kind === 'flagship'
            ? 2
            : kind === 'quote'
              ? 4
              : 3,
    intent: d.intent ?? defaultIntentForKind(kind),
    session: d.session ?? defaultSessionForKind(kind),
    estimatedSeconds: d.estimatedSeconds ?? defaultEstimatedSeconds(kind),
    why: d.why?.trim() || (kind === 'reply' ? `Growth reply on ${label}` : 'On-brand action'),
    tip,
    postingWindow: d.postingWindow ?? 'anytime',
    targetHandle:
      d.targetHandle ?? (typeof label === 'string' && label.startsWith('@') ? label : undefined),
    targetReach: d.targetReach,
  };
}

/** Fill defaults for packs written before rich fields existed. */
export function hydratePack(raw: XContentPack): XContentPack {
  const drafts = (Array.isArray(raw?.drafts) ? raw.drafts : [])
    .filter((d) => d != null && typeof d === 'object')
    .map((d, i) => hydrateDraft(d as Partial<XDraftItem>, i));
  return {
    ...raw,
    id: raw?.id || 'unknown-pack',
    date: raw?.date || '',
    title: raw?.title || raw?.id || 'Untitled pack',
    drafts,
    signals: Array.isArray(raw?.signals) ? raw.signals : [],
    skipList: Array.isArray(raw?.skipList) ? raw.skipList : [],
    schedule: Array.isArray(raw?.schedule) ? raw.schedule : [],
    sessions: raw?.sessions?.length ? raw.sessions : DEFAULT_SESSIONS,
    plannedMinutes:
      raw?.plannedMinutes ?? Math.max(1, Math.ceil(sumEstimatedSeconds(drafts) / 60)),
    createdAt: raw?.createdAt || new Date().toISOString(),
    updatedAt: raw?.updatedAt || new Date().toISOString(),
  };
}

async function loadLocal(): Promise<XContentPack[]> {
  try {
    await ensureFile();
    const raw = await fs.readFile(dataFilePath, 'utf-8');
    const list = JSON.parse(raw) as XContentPack[];
    if (!Array.isArray(list)) return [];
    return list.map((p) => hydratePack(p));
  } catch {
    return [];
  }
}

async function saveLocal(packs: XContentPack[]): Promise<void> {
  await ensureFile();
  await fs.writeFile(dataFilePath, JSON.stringify(packs, null, 2), 'utf-8');
}

/** Normalize any date-ish value to YYYY-MM-DD (Postgres / JSON quirks). */
function toDateOnly(value: unknown): string {
  if (value == null) return '';
  const s = String(value);
  const m = s.match(/(\d{4}-\d{2}-\d{2})/);
  return m ? m[1] : s.slice(0, 10);
}

function rowToPack(row: {
  id: string;
  payload: XContentPack | string | null | undefined;
  date?: string;
  title?: string;
  theme?: string | null;
  planned_minutes?: number | null;
  created_at?: string;
  updated_at?: string;
}): XContentPack {
  let payload: Partial<XContentPack> = {};
  try {
    if (typeof row.payload === 'string') {
      payload = (JSON.parse(row.payload) as XContentPack) || {};
    } else if (row.payload && typeof row.payload === 'object') {
      payload = row.payload;
    }
  } catch (e) {
    console.warn('[x-content] Invalid pack payload for', row.id, e);
    payload = {};
  }
  return {
    ...payload,
    id: payload.id || row.id,
    date: toDateOnly(payload.date || row.date),
    title: payload.title || row.title || row.id,
    theme: payload.theme ?? row.theme ?? undefined,
    plannedMinutes: payload.plannedMinutes ?? row.planned_minutes ?? undefined,
    drafts: Array.isArray(payload.drafts) ? payload.drafts : [],
    signals: Array.isArray(payload.signals) ? payload.signals : [],
    skipList: Array.isArray(payload.skipList) ? payload.skipList : [],
    schedule: Array.isArray(payload.schedule) ? payload.schedule : [],
    createdAt: payload.createdAt || row.created_at || new Date().toISOString(),
    updatedAt: payload.updatedAt || row.updated_at || new Date().toISOString(),
  } as XContentPack;
}

/**
 * Drop packs older than retention window (by pack.date).
 * Returns kept packs; optionally deletes expired rows from Supabase.
 */
export async function pruneOldXContentPacks(
  packs: XContentPack[],
  options?: { persist?: boolean; days?: number }
): Promise<XContentPack[]> {
  const days = options?.days ?? X_PACK_RETENTION_DAYS;
  const cutoff = packRetentionCutoffDate(days);
  const kept = packs.filter((p) => {
    const d = toDateOnly(p.date);
    return d && d >= cutoff;
  });
  const removed = packs.length - kept.length;
  if (removed <= 0) return packs;

  if (options?.persist !== false) {
    if (isSupabaseUsable()) {
      try {
        const { error } = await supabase
          .from('x_content_packs')
          .delete()
          .lt('date', cutoff);
        if (error) console.warn('[x-content] prune Supabase delete failed:', error);
      } catch (e) {
        console.warn('[x-content] prune Supabase delete failed:', e);
      }
    }
    await saveLocalSafe(kept);
  }

  cachedPacks = kept;
  cacheLoadedAt = Date.now();
  lastPruneAt = Date.now();
  return kept;
}

async function maybePrune(packs: XContentPack[]): Promise<XContentPack[]> {
  if (Date.now() - lastPruneAt < PRUNE_EVERY_MS) {
    // Still filter in-memory so UI never shows stale rows between prune runs
    const cutoff = packRetentionCutoffDate();
    return packs.filter((p) => {
      const d = toDateOnly(p.date);
      return d && d >= cutoff;
    });
  }
  return pruneOldXContentPacks(packs);
}

export async function getXContentPacks(): Promise<XContentPack[]> {
  if (cachedPacks && Date.now() - cacheLoadedAt < CACHE_TTL_MS) {
    return cachedPacks;
  }

  if (!isSupabaseUsable()) {
    const local = await maybePrune(await loadLocal());
    cachedPacks = local;
    cacheLoadedAt = Date.now();
    return local;
  }

  try {
    const { data, error } = await supabase
      .from('x_content_packs')
      .select('id, date, title, theme, planned_minutes, payload, created_at, updated_at')
      .order('updated_at', { ascending: false });

    if (error) {
      markSupabaseUnavailable(error);
      const local = await maybePrune(await loadLocal());
      cachedPacks = local;
      cacheLoadedAt = Date.now();
      return local;
    }

    supabaseFailureLogged = false;
    const loaded = (data || []).map((row) =>
      hydratePack(rowToPack(row as Parameters<typeof rowToPack>[0]))
    );
    cachedPacks = await maybePrune(loaded);
    cacheLoadedAt = Date.now();
    void saveLocalSafe(cachedPacks);
    return cachedPacks;
  } catch (e) {
    markSupabaseUnavailable(e);
    const local = await maybePrune(await loadLocal());
    cachedPacks = local;
    cacheLoadedAt = Date.now();
    return local;
  }
}

export async function getXContentPack(id: string): Promise<XContentPack | null> {
  const packs = await getXContentPacks();
  return packs.find((p) => p.id === id) ?? null;
}

export async function getLatestXContentPack(): Promise<XContentPack | null> {
  const packs = await getXContentPacks();
  if (packs.length === 0) return null;
  return [...packs].sort(
    (a, b) => b.date.localeCompare(a.date) || b.updatedAt.localeCompare(a.updatedAt)
  )[0];
}

function toRow(p: XContentPack) {
  return {
    id: p.id,
    date: p.date,
    title: p.title,
    theme: p.theme ?? null,
    planned_minutes: p.plannedMinutes ?? null,
    payload: p,
    created_at: p.createdAt,
    updated_at: p.updatedAt || new Date().toISOString(),
  };
}

export async function saveXContentPacks(packs: XContentPack[]): Promise<void> {
  cachedPacks = packs;
  cacheLoadedAt = Date.now();

  if (isSupabaseConfigured()) {
    try {
      const rows = packs.map(toRow);
      const { error: upsertError } = await supabase
        .from('x_content_packs')
        .upsert(rows, { onConflict: 'id' });
      if (upsertError) {
        console.error('[x-content] Supabase upsert failed:', upsertError);
        throw upsertError;
      }
      await saveLocalSafe(packs);
      return;
    } catch (e) {
      console.error('[x-content] Supabase save failed:', e);
      if (process.env.VERCEL || !preferLocalJson()) throw e;
    }
  }

  await saveLocal(packs);
}

export async function upsertXContentPack(
  pack: XContentPack,
  options?: { preserveStatuses?: boolean }
): Promise<XContentPack> {
  let packs = await getXContentPacks();
  packs = await maybePrune(packs);
  const idx = packs.findIndex((p) => p.id === pack.id);
  const preserve = options?.preserveStatuses !== false;
  let next: XContentPack = hydratePack({
    ...pack,
    updatedAt: new Date().toISOString(),
  });

  if (idx >= 0) {
    const existing = packs[idx];
    if (preserve) {
      // Keep posted/skipped even when scout polishes body text (Done must survive re-ingest).
      next = {
        ...next,
        createdAt: existing.createdAt || next.createdAt,
        drafts: mergePreservedDraftStatuses(next.drafts, existing.drafts, next.id),
      };
    } else {
      next = { ...next, createdAt: existing.createdAt || next.createdAt };
    }
    packs[idx] = next;
  } else {
    if (!next.createdAt) next.createdAt = new Date().toISOString();
    packs.unshift(next);
  }

  packs = packs.filter((p) => {
    const d = toDateOnly(p.date);
    return d && d >= packRetentionCutoffDate();
  });

  if (isSupabaseUsable()) {
    try {
      const { error } = await supabase.from('x_content_packs').upsert(toRow(next), { onConflict: 'id' });
      if (error) throw error;
      supabaseFailureLogged = false;
      cachedPacks = packs;
      cacheLoadedAt = Date.now();
      await saveLocalSafe(packs);
      return next;
    } catch (e) {
      markSupabaseUnavailable(e);
      // On Vercel, do not fall back to a read-only local file write
      if (process.env.VERCEL || isSupabaseConfigured()) {
        throw e instanceof Error ? e : new Error(String(e));
      }
    }
  }

  await saveXContentPacks(packs);
  return next;
}

export async function updateDraftStatus(
  packId: string,
  draftId: string,
  status: XDraftStatus
): Promise<XContentPack | null> {
  // Bypass short cache so we never patch a stale snapshot after scout ingest
  cacheLoadedAt = 0;
  const packs = await getXContentPacks();
  const packIndex = packs.findIndex((p) => p.id === packId);
  if (packIndex < 0) return null;
  const pack = packs[packIndex];
  const draft = findDraftInPack(pack, draftId);
  if (!draft) return null;

  const next: XContentPack = hydratePack({
    ...pack,
    drafts: pack.drafts.map((d) =>
      draftIdsEqual(d.id, draftId, pack.id) ? { ...d, status } : d
    ),
    updatedAt: new Date().toISOString(),
  });

  // Direct write — do not go through preserveStatuses path (this IS the status source of truth)
  packs[packIndex] = next;

  if (isSupabaseUsable()) {
    try {
      const { error } = await supabase.from('x_content_packs').upsert(toRow(next), { onConflict: 'id' });
      if (error) throw error;
      supabaseFailureLogged = false;
      cachedPacks = packs;
      cacheLoadedAt = Date.now();
      await saveLocalSafe(packs);
      return next;
    } catch (e) {
      markSupabaseUnavailable(e);
      if (process.env.VERCEL || isSupabaseConfigured()) {
        throw e instanceof Error ? e : new Error(String(e));
      }
    }
  }

  await saveXContentPacks(packs);
  return next;
}

export function xContentUsesCloud(): boolean {
  return isSupabaseConfigured();
}
