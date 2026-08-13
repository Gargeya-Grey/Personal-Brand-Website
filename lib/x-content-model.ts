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

/** Per-draft quality gate — see data/x-reply-quality.md. Pass if total ≥ 90. */
export interface XDraftQualityDimensions {
  lengthFit: number;
  clarity: number;
  hook: number;
  funRead: number;
  relatability: number;
  voiceMatch: number;
  humanTexture: number;
  groundingFit: number;
}

export interface XDraftAdversary {
  /** Must be true after the last-mile creative rewrite */
  passed: boolean;
  /** Stranger reaction the line is built for */
  click: 'i believe this' | "he's right" | "i don't like this" | "that's me";
  /** What the adversary changed, or "kept: already landed" */
  change: string;
}

export interface XDraftQuality {
  /** 0–100; must be ≥ 90 to ship */
  total: number;
  /** Shape from voice palette (values_jab, blunt, micro, …) */
  shape?: string;
  dimensions: XDraftQualityDimensions;
  /** Why it passed / what was rewritten */
  notes: string;
  /** Rewrite attempts before pass */
  attempts?: number;
  /** Required last pass: adversary creative writer */
  adversary?: XDraftAdversary;
}

export const QUALITY_PASS_SCORE = 90;

export const QUALITY_DIMENSION_CAPS: Record<keyof XDraftQualityDimensions, number> = {
  lengthFit: 12,
  clarity: 15,
  hook: 15,
  funRead: 12,
  relatability: 15,
  voiceMatch: 15,
  humanTexture: 12,
  groundingFit: 4,
};

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
  /**
   * Quality gate (required for new scout packs). total ≥ 90 to pass.
   * See data/x-reply-quality.md
   */
  quality?: XDraftQuality;
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
    title: 'Two replies',
    maxMinutes: 10,
    description: 'Two real comments on big climbing rooms. Education at most once.',
  },
  {
    id: 'core',
    title: 'Two small tweets',
    maxMinutes: 10,
    description:
      'Two short own-posts from different parts of him (psych, care, optimism, AI comfort, etc.).',
  },
  {
    id: 'bonus',
    title: 'Rare quote',
    maxMinutes: 5,
    description: 'Skip by default. May replace one own-tweet on a mega still-hot post.',
  },
];

/** Two sitting packs a day: morning t11, evening t19 (Asia/Kolkata). */
export const SCOUT_TIMEZONE = 'Asia/Kolkata';
export const SCOUT_IST_SLOTS = [11, 19] as const;

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
    quality: sanitizeQuality((raw as { quality?: unknown }).quality),
  };
}

function sanitizeQuality(raw: unknown): XDraftQuality | undefined {
  if (!raw || typeof raw !== 'object') return undefined;
  const q = raw as Partial<XDraftQuality> & { dimensions?: Partial<XDraftQualityDimensions> };
  const dimsIn = q.dimensions && typeof q.dimensions === 'object' ? q.dimensions : null;
  if (!dimsIn) return undefined;
  const dimensions = {} as XDraftQualityDimensions;
  for (const key of Object.keys(QUALITY_DIMENSION_CAPS) as (keyof XDraftQualityDimensions)[]) {
    const n = dimsIn[key];
    dimensions[key] = typeof n === 'number' && Number.isFinite(n) ? n : 0;
  }
  const total =
    typeof q.total === 'number' && Number.isFinite(q.total)
      ? q.total
      : Object.values(dimensions).reduce((a, b) => a + b, 0);
  const notes = typeof q.notes === 'string' ? q.notes : '';
  const advRaw = (q as { adversary?: unknown }).adversary;
  let adversary: XDraftAdversary | undefined;
  if (advRaw && typeof advRaw === 'object') {
    const a = advRaw as Record<string, unknown>;
    const click = typeof a.click === 'string' ? a.click.trim() : '';
    const change = typeof a.change === 'string' ? a.change.trim() : '';
    if (click && change) {
      adversary = {
        passed: a.passed === true,
        click: click as XDraftAdversary['click'],
        change,
      };
    }
  }
  return {
    total,
    shape: typeof q.shape === 'string' ? q.shape : undefined,
    dimensions,
    notes,
    attempts:
      typeof q.attempts === 'number' && Number.isFinite(q.attempts) ? q.attempts : undefined,
    adversary,
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

function istParts(now: Date): { date: string; hour: number } {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: SCOUT_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    hour12: false,
  }).formatToParts(now);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? '';
  let hour = parseInt(get('hour'), 10);
  if (hour === 24) hour = 0; // some engines
  return { date: `${get('year')}-${get('month')}-${get('day')}`, hour };
}

/** Calendar date ± days (YYYY-MM-DD arithmetic, no TZ drift). */
function shiftDateString(date: string, dayDelta: number): string {
  const [y, m, d] = date.split('-').map(Number);
  const utc = new Date(Date.UTC(y, m - 1, d + dayDelta));
  return utc.toISOString().slice(0, 10);
}

/**
 * Map a moment to the active IST scout slot hour (11,13,15,17,19,21).
 * Before 11:00 IST → previous day's 21:00 slot.
 * After 21:59 IST → same day's 21:00 slot.
 */
export function scoutIstSlot(now: Date = new Date()): { date: string; slotHour: number } {
  const { date, hour } = istParts(now);
  if (hour < SCOUT_IST_SLOTS[0]) {
    return { date: shiftDateString(date, -1), slotHour: SCOUT_IST_SLOTS[SCOUT_IST_SLOTS.length - 1] };
  }
  let slotHour: number = SCOUT_IST_SLOTS[0];
  for (const s of SCOUT_IST_SLOTS) {
    if (hour >= s) slotHour = s;
  }
  return { date, slotHour };
}

/** True during the human posting day 11:00–22:59 IST (scout window). */
export function isScoutWindowOpen(now: Date = new Date()): boolean {
  const { hour } = istParts(now);
  return hour >= 11 && hour <= 22;
}

/**
 * One pack per sitting — morning t11, evening t19 (Asia/Kolkata).
 * The loop may wake more often; it only writes a pack near those two times.
 * Legacy t13/t15/t17/t21 or UTC t00/t06/t12/t18 packs may still exist.
 */
export function createRunPackId(now: Date = new Date()): string {
  const { date, slotHour } = scoutIstSlot(now);
  return `pack-${date}-t${String(slotHour).padStart(2, '0')}`;
}

/** Human label e.g. "29 Jul · 15:00 IST run" from pack id / timestamps. */
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
      timeZone: SCOUT_TIMEZONE,
    });
  } catch {
    /* keep datePart */
  }
  if (slotMatch) {
    const slot = parseInt(slotMatch[1], 10);
    // New cadence: IST hours 11–22. Old UTC 00/06/12/18 still labeled UTC.
    const isIstCadence = SCOUT_IST_SLOTS.includes(slot as (typeof SCOUT_IST_SLOTS)[number]);
    return isIstCadence
      ? `${when} · ${slotMatch[1]}:00 IST`
      : `${when} · slot ${slotMatch[1]}:00 UTC (legacy)`;
  }
  return when;
}

/**
 * Derive MVP ids: explicit list, else full mini-pack queue.
 * Two sittings: 2 replies + 2 small own tweets.
 */
export function resolveMvpIds(pack: XContentPack): string[] {
  if (pack.mvpDraftIds?.length) return pack.mvpDraftIds;
  const ready = sortDraftsForExecution(pack.drafts.filter((d) => d.status === 'ready'));
  // Prefer conversion long-forms first (priority 1 / growth tip), then other replies, then original
  const replies = ready.filter((d) => d.kind === 'reply');
  const conversion = replies.filter(
    (d) =>
      d.intent === 'growth' &&
      ((d.estimatedSeconds ?? 0) >= 150 ||
        /conversion|long.?form|profile|follow/i.test(`${d.why || ''} ${d.tip || ''} ${d.label || ''}`))
  );
  const otherReplies = replies.filter((d) => !conversion.some((c) => c.id === d.id));
  const orderedReplies = [...conversion.slice(0, 2), ...otherReplies.slice(0, 1)];
  const original = ready.find((d) => d.kind === 'short' || d.kind === 'flagship');
  const quote = ready.find((d) => d.kind === 'quote');
  const ids = [...orderedReplies.map((d) => d.id)];
  if (original) ids.push(original.id);
  else if (quote && ids.length < 4) ids.push(quote.id);
  return ids.slice(0, 4);
}
