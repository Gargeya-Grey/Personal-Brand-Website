/** Client-safe X content types + pure helpers (no Node fs). */

export type XDraftKind = 'flagship' | 'short' | 'reply' | 'quote';
export type XDraftStatus = 'ready' | 'posted' | 'skipped';

/** Why this action exists in the growth plan */
export type XDraftIntent =
  | 'growth' // high-visibility reply / timely hook — follower discovery
  | 'authority' // brand thesis, eval POV
  | 'ship' // product / build-in-public proof
  | 'relationship' // genuine conversation, not pure reach
  | 'optional'; // nice-to-have if time left

/** Which time-box this belongs to */
export type XSessionId = 'sprint' | 'core' | 'bonus';

export type XPostingWindow = 'morning' | 'midday' | 'evening' | 'anytime';

export interface XDraftItem {
  id: string;
  kind: XDraftKind;
  label: string;
  body: string;
  /**
   * Source post URL (reply/QT target) or a free-text note.
   * Scouts sometimes send `{ url, note }` — normalize with `normalizeDraftMeta`.
   */
  meta?: string;
  status: XDraftStatus;

  /** 1 = do first (highest ROI), 5 = skip if short on time */
  priority: number;
  intent: XDraftIntent;
  /** Which session bucket */
  session: XSessionId;
  /** Seconds of human time (copy, paste, light edit, post) */
  estimatedSeconds: number;
  /** One line: why this moves the 10k goal */
  why: string;
  /** Optional tip while posting */
  tip?: string;
  postingWindow: XPostingWindow;
  /** Reply/QT target context */
  targetHandle?: string;
  /**
   * Target heat for prioritization — prefer viral posts, not quiet niches.
   * e.g. "viral" | "hyper" | "50k-followers" | "2k-likes" | "mid"
   */
  targetReach?: string;
}

export interface XSignalItem {
  id: string;
  summary: string;
  whyItMatters: string;
  url?: string;
  /** Heat / urgency 1–5 */
  heat?: number;
  category?: string;
}

export interface XSessionBlock {
  id: XSessionId;
  title: string;
  /** Soft time budget in minutes */
  maxMinutes: number;
  description: string;
}

export interface XContentPack {
  id: string;
  date: string;
  title: string;
  briefing?: string;
  /** Theme of the day for focus */
  theme?: string;
  /** Minimum tasks to stay consistent (ids). UI “MVP only” uses these or falls back to top priorities. */
  mvpDraftIds?: string[];
  /** Total planned minutes if doing full plan */
  plannedMinutes?: number;
  signals: XSignalItem[];
  skipList: string[];
  drafts: XDraftItem[];
  schedule: string[];
  sessions?: XSessionBlock[];
  createdAt: string;
  updatedAt: string;
}

export const DEFAULT_SESSIONS: XSessionBlock[] = [
  {
    id: 'sprint',
    title: 'Reply sprint',
    maxMinutes: 20,
    description: 'High-ROI replies only — open, paste, go. Max reach per minute.',
  },
  {
    id: 'core',
    title: 'Core posts',
    maxMinutes: 35,
    description: 'Flagship + strongest shorts. Authority and ship proof.',
  },
  {
    id: 'bonus',
    title: 'Bonus',
    maxMinutes: 25,
    description: 'Optional QT / extras if you still have energy.',
  },
];

export function defaultEstimatedSeconds(kind: XDraftKind): number {
  switch (kind) {
    case 'reply':
      return 75;
    case 'short':
      return 90;
    case 'quote':
      return 90;
    case 'flagship':
      return 240;
    default:
      return 90;
  }
}

export function defaultSessionForKind(kind: XDraftKind): XSessionId {
  if (kind === 'reply') return 'sprint';
  if (kind === 'quote') return 'bonus';
  return 'core';
}

export function defaultIntentForKind(kind: XDraftKind): XDraftIntent {
  if (kind === 'reply') return 'growth';
  if (kind === 'flagship') return 'authority';
  if (kind === 'quote') return 'optional';
  return 'authority';
}

const VALID_KINDS = new Set<XDraftKind>(['reply', 'flagship', 'short', 'quote']);

export function isXDraftKind(value: unknown): value is XDraftKind {
  return typeof value === 'string' && VALID_KINDS.has(value as XDraftKind);
}

/**
 * Pull a post URL from draft.meta whether scouts stored a string or `{ url, note }`.
 * Used by Copy & open X so replies land on the original post, not a blank compose.
 */
export function extractDraftSourceUrl(meta: unknown): string | undefined {
  if (meta == null) return undefined;
  if (typeof meta === 'string') {
    const t = meta.trim();
    if (/^https?:\/\//i.test(t)) {
      // First URL in a longer note string
      const m = t.match(/https?:\/\/[^\s)"']+/i);
      return m ? m[0] : t;
    }
    // JSON string of { url }
    if (t.startsWith('{')) {
      try {
        return extractDraftSourceUrl(JSON.parse(t));
      } catch {
        return undefined;
      }
    }
    return undefined;
  }
  if (typeof meta === 'object') {
    const o = meta as Record<string, unknown>;
    for (const key of ['url', 'href', 'source', 'link', 'postUrl', 'statusUrl']) {
      const v = o[key];
      if (typeof v === 'string' && /^https?:\/\//i.test(v.trim())) {
        return v.trim().match(/https?:\/\/[^\s)"']+/i)?.[0] ?? v.trim();
      }
    }
  }
  return undefined;
}

/** Normalize scout meta (string | object) → URL string for storage + optional tip from note. */
export function normalizeDraftMeta(rawMeta: unknown, existingTip?: string): {
  meta?: string;
  tip?: string;
} {
  const url = extractDraftSourceUrl(rawMeta);
  let tip = existingTip;
  if (rawMeta && typeof rawMeta === 'object') {
    const note = (rawMeta as Record<string, unknown>).note;
    if (typeof note === 'string' && note.trim() && !tip?.trim()) {
      tip = note.trim();
    }
  }
  if (url) return { meta: url, tip };
  if (typeof rawMeta === 'string' && rawMeta.trim()) return { meta: rawMeta.trim(), tip };
  return { meta: undefined, tip };
}

/** Open target for Copy & open: source post if we have one, else blank compose. */
export function draftOpenUrl(draft: Pick<XDraftItem, 'meta' | 'kind'> | null | undefined): string {
  const url = extractDraftSourceUrl(draft?.meta);
  if (url) return url;
  return 'https://x.com/compose/post';
}

/** Coerce messy API / JSON rows so the studio never crashes mid-render. */
export function sanitizeDraft(raw: Partial<XDraftItem> | null | undefined, index = 0): XDraftItem | null {
  if (!raw || typeof raw !== 'object') return null;
  const kind: XDraftKind = isXDraftKind(raw.kind) ? raw.kind : 'short';
  const id =
    typeof raw.id === 'string' && raw.id.trim()
      ? raw.id.trim()
      : `draft-${index + 1}`;
  const label =
    typeof raw.label === 'string' && raw.label.trim()
      ? raw.label
      : `Untitled ${kind}`;
  const body = typeof raw.body === 'string' ? raw.body : String(raw.body ?? '');
  const priority =
    typeof raw.priority === 'number' && Number.isFinite(raw.priority) ? raw.priority : 3;
  const estimatedSeconds =
    typeof raw.estimatedSeconds === 'number' && Number.isFinite(raw.estimatedSeconds)
      ? raw.estimatedSeconds
      : defaultEstimatedSeconds(kind);
  const session: XSessionId =
    raw.session === 'sprint' || raw.session === 'core' || raw.session === 'bonus'
      ? raw.session
      : defaultSessionForKind(kind);
  const status: XDraftStatus =
    raw.status === 'posted' || raw.status === 'skipped' || raw.status === 'ready'
      ? raw.status
      : 'ready';

  const { meta, tip } = normalizeDraftMeta(
    raw.meta,
    typeof raw.tip === 'string' ? raw.tip : undefined
  );

  return {
    id,
    kind,
    label,
    body,
    meta,
    status,
    priority,
    intent: raw.intent ?? defaultIntentForKind(kind),
    session,
    estimatedSeconds,
    why: typeof raw.why === 'string' ? raw.why : '',
    tip,
    postingWindow: raw.postingWindow ?? 'anytime',
    targetHandle: typeof raw.targetHandle === 'string' ? raw.targetHandle : undefined,
    targetReach: typeof raw.targetReach === 'string' ? raw.targetReach : undefined,
  };
}

export function sanitizePack(raw: Partial<XContentPack> | null | undefined): XContentPack | null {
  if (!raw || typeof raw !== 'object') return null;
  const id = typeof raw.id === 'string' && raw.id.trim() ? raw.id.trim() : '';
  if (!id) return null;
  const drafts = (Array.isArray(raw.drafts) ? raw.drafts : [])
    .map((d, i) => sanitizeDraft(d, i))
    .filter((d): d is XDraftItem => d != null);
  return {
    id,
    date: typeof raw.date === 'string' ? raw.date : '',
    title: typeof raw.title === 'string' && raw.title.trim() ? raw.title : id,
    theme: typeof raw.theme === 'string' ? raw.theme : undefined,
    briefing: typeof raw.briefing === 'string' ? raw.briefing : undefined,
    plannedMinutes:
      typeof raw.plannedMinutes === 'number' && Number.isFinite(raw.plannedMinutes)
        ? raw.plannedMinutes
        : undefined,
    mvpDraftIds: Array.isArray(raw.mvpDraftIds)
      ? raw.mvpDraftIds.filter((x): x is string => typeof x === 'string')
      : undefined,
    signals: Array.isArray(raw.signals) ? raw.signals : [],
    skipList: Array.isArray(raw.skipList)
      ? raw.skipList.filter((x): x is string => typeof x === 'string')
      : [],
    drafts,
    schedule: Array.isArray(raw.schedule)
      ? raw.schedule.filter((x): x is string => typeof x === 'string')
      : [],
    sessions: Array.isArray(raw.sessions) && raw.sessions.length ? raw.sessions : DEFAULT_SESSIONS,
    createdAt: typeof raw.createdAt === 'string' ? raw.createdAt : new Date().toISOString(),
    updatedAt: typeof raw.updatedAt === 'string' ? raw.updatedAt : new Date().toISOString(),
  };
}

export function sortDraftsForExecution(drafts: XDraftItem[]): XDraftItem[] {
  const sessionOrder: Record<XSessionId, number> = { sprint: 0, core: 1, bonus: 2 };
  const kindOrder: Record<XDraftKind, number> = {
    reply: 0,
    flagship: 1,
    short: 2,
    quote: 3,
  };
  return [...(drafts || [])].sort((a, b) => {
    if (a.priority !== b.priority) return a.priority - b.priority;
    const sa = sessionOrder[a.session] ?? 9;
    const sb = sessionOrder[b.session] ?? 9;
    if (sa !== sb) return sa - sb;
    const ka = kindOrder[a.kind] ?? 9;
    const kb = kindOrder[b.kind] ?? 9;
    if (ka !== kb) return ka - kb;
    return String(a.label || '').localeCompare(String(b.label || ''));
  });
}

export function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const m = Math.round(seconds / 60);
  return m <= 1 ? '~1 min' : `~${m} min`;
}

export function sumEstimatedSeconds(drafts: XDraftItem[]): number {
  return drafts.reduce((n, d) => n + (d.estimatedSeconds || 0), 0);
}

/** Legacy one-pack-per-day id (prefer createRunPackId for scouts). */
export function createPackId(date: string): string {
  return `pack-${date}`;
}

/**
 * One pack per scout run (12h slots UTC: t00, t12).
 * Two distinct queues per calendar day — never overwrites an earlier run.
 * (Legacy packs may still use t06 / t18 from the old 6h cadence.)
 */
export function createRunPackId(now: Date = new Date()): string {
  const date = now.toISOString().slice(0, 10);
  const hour = now.getUTCHours();
  const slot = Math.floor(hour / 12) * 12;
  return `pack-${date}-t${String(slot).padStart(2, '0')}`;
}

/** Human label e.g. "21 Jul · 12:00 UTC run" from pack id / timestamps. */
export function formatPackRunLabel(pack: {
  id: string;
  date: string;
  title: string;
  updatedAt?: string;
  createdAt?: string;
}): string {
  const slotMatch = pack.id.match(/-t(\d{2})$/);
  const datePart = pack.date || pack.id.slice(5, 15);
  let when = datePart;
  try {
    const d = new Date(pack.updatedAt || pack.createdAt || `${datePart}T12:00:00Z`);
    when = d.toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    /* keep datePart */
  }
  if (slotMatch) {
    return `${when} · slot ${slotMatch[1]}:00 UTC`;
  }
  return when;
}

/** Derive MVP ids: explicit list, else top-priority ready items (replies + 1 original). */
export function resolveMvpIds(pack: XContentPack): string[] {
  if (pack.mvpDraftIds?.length) return pack.mvpDraftIds;
  const ready = sortDraftsForExecution(pack.drafts.filter((d) => d.status === 'ready'));
  const replies = ready.filter((d) => d.kind === 'reply').slice(0, 5);
  const original =
    ready.find((d) => d.kind === 'flagship') || ready.find((d) => d.kind === 'short');
  const ids = [...replies.map((d) => d.id)];
  if (original) ids.push(original.id);
  return ids;
}
