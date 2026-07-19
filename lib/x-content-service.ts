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

let cachedPacks: XContentPack[] | null = null;
let cacheLoadedAt = 0;
const CACHE_TTL_MS = 2_000;

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

async function ensureFile(): Promise<void> {
  try {
    await fs.access(dataFilePath);
  } catch {
    await fs.mkdir(dataDir, { recursive: true });
    await fs.writeFile(dataFilePath, '[]', 'utf-8');
  }
}

function hydrateDraft(d: Partial<XDraftItem> & { id: string; kind: XDraftKind; label: string; body: string }, index: number): XDraftItem {
  return {
    id: d.id,
    kind: d.kind,
    label: d.label,
    body: d.body,
    meta: d.meta,
    status: d.status ?? 'ready',
    priority: typeof d.priority === 'number' ? d.priority : d.kind === 'reply' ? 1 + Math.min(2, index) : d.kind === 'flagship' ? 2 : d.kind === 'quote' ? 4 : 3,
    intent: d.intent ?? defaultIntentForKind(d.kind),
    session: d.session ?? defaultSessionForKind(d.kind),
    estimatedSeconds: d.estimatedSeconds ?? defaultEstimatedSeconds(d.kind),
    why: d.why?.trim() || (d.kind === 'reply' ? `Growth reply on ${d.label}` : 'On-brand action'),
    tip: d.tip,
    postingWindow: d.postingWindow ?? 'anytime',
    targetHandle: d.targetHandle ?? (d.label.startsWith('@') ? d.label : undefined),
    targetReach: d.targetReach,
  };
}

/** Fill defaults for packs written before rich fields existed. */
export function hydratePack(raw: XContentPack): XContentPack {
  const drafts = (raw.drafts || []).map((d, i) => hydrateDraft(d, i));
  return {
    ...raw,
    drafts,
    signals: raw.signals || [],
    skipList: raw.skipList || [],
    schedule: raw.schedule || [],
    sessions: raw.sessions?.length ? raw.sessions : DEFAULT_SESSIONS,
    plannedMinutes:
      raw.plannedMinutes ?? Math.max(1, Math.ceil(sumEstimatedSeconds(drafts) / 60)),
  };
}

async function loadLocal(): Promise<XContentPack[]> {
  await ensureFile();
  const raw = await fs.readFile(dataFilePath, 'utf-8');
  const list = JSON.parse(raw) as XContentPack[];
  if (!Array.isArray(list)) return [];
  return list.map((p) => hydratePack(p));
}

async function saveLocal(packs: XContentPack[]): Promise<void> {
  await ensureFile();
  await fs.writeFile(dataFilePath, JSON.stringify(packs, null, 2), 'utf-8');
}

function rowToPack(row: {
  id: string;
  payload: XContentPack | string;
  date?: string;
  title?: string;
  theme?: string | null;
  planned_minutes?: number | null;
  created_at?: string;
  updated_at?: string;
}): XContentPack {
  const payload =
    typeof row.payload === 'string' ? (JSON.parse(row.payload) as XContentPack) : row.payload;
  return {
    ...payload,
    id: payload.id || row.id,
    date: payload.date || String(row.date || '').slice(0, 10),
    title: payload.title || row.title || row.id,
    theme: payload.theme ?? row.theme ?? undefined,
    plannedMinutes: payload.plannedMinutes ?? row.planned_minutes ?? undefined,
    createdAt: payload.createdAt || row.created_at || new Date().toISOString(),
    updatedAt: payload.updatedAt || row.updated_at || new Date().toISOString(),
  };
}

export async function getXContentPacks(): Promise<XContentPack[]> {
  if (cachedPacks && Date.now() - cacheLoadedAt < CACHE_TTL_MS) {
    return cachedPacks;
  }

  if (!isSupabaseUsable()) {
    const local = await loadLocal();
    cachedPacks = local;
    cacheLoadedAt = Date.now();
    return local;
  }

  try {
    const { data, error } = await supabase
      .from('x_content_packs')
      .select('id, date, title, theme, planned_minutes, payload, created_at, updated_at')
      .order('date', { ascending: false });

    if (error) {
      markSupabaseUnavailable(error);
      const local = await loadLocal();
      cachedPacks = local;
      cacheLoadedAt = Date.now();
      return local;
    }

    supabaseFailureLogged = false;
    cachedPacks = (data || []).map((row) =>
      hydratePack(rowToPack(row as Parameters<typeof rowToPack>[0]))
    );
    cacheLoadedAt = Date.now();
    saveLocal(cachedPacks).catch(() => {});
    return cachedPacks;
  } catch (e) {
    markSupabaseUnavailable(e);
    const local = await loadLocal();
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
  await saveLocal(packs);

  if (!isSupabaseConfigured()) return;

  try {
    const rows = packs.map(toRow);
    const { error: upsertError } = await supabase
      .from('x_content_packs')
      .upsert(rows, { onConflict: 'id' });
    if (upsertError) {
      console.error('[x-content] Supabase upsert failed:', upsertError);
    }
  } catch (e) {
    console.error('[x-content] Supabase save failed:', e);
  }
}

export async function upsertXContentPack(
  pack: XContentPack,
  options?: { preserveStatuses?: boolean }
): Promise<XContentPack> {
  const packs = await getXContentPacks();
  const idx = packs.findIndex((p) => p.id === pack.id);
  const preserve = options?.preserveStatuses !== false;
  let next: XContentPack = { ...pack, updatedAt: new Date().toISOString() };

  if (idx >= 0) {
    const existing = packs[idx];
    if (preserve) {
      const statusById = new Map(existing.drafts.map((d) => [d.id, d.status]));
      next = {
        ...next,
        createdAt: existing.createdAt || next.createdAt,
        drafts: next.drafts.map((d) => ({
          ...d,
          status: statusById.get(d.id) ?? d.status,
        })),
      };
    } else {
      next = { ...next, createdAt: existing.createdAt || next.createdAt };
    }
    packs[idx] = next;
  } else {
    if (!next.createdAt) next.createdAt = new Date().toISOString();
    packs.unshift(next);
  }

  if (isSupabaseUsable()) {
    try {
      const { error } = await supabase.from('x_content_packs').upsert(toRow(next), { onConflict: 'id' });
      if (error) throw error;
      supabaseFailureLogged = false;
      cachedPacks = packs;
      cacheLoadedAt = Date.now();
      await saveLocal(packs);
      return next;
    } catch (e) {
      markSupabaseUnavailable(e);
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
  const packs = await getXContentPacks();
  const pack = packs.find((p) => p.id === packId);
  if (!pack) return null;
  const draft = pack.drafts.find((d) => d.id === draftId);
  if (!draft) return null;
  draft.status = status;
  pack.updatedAt = new Date().toISOString();
  await upsertXContentPack(pack, { preserveStatuses: false });
  return pack;
}

export function xContentUsesCloud(): boolean {
  return isSupabaseConfigured();
}
