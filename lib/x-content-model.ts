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
  /** Source post URL or note */
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
  /** Rough audience size of target (e.g. "50k") for prioritization */
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

export function sortDraftsForExecution(drafts: XDraftItem[]): XDraftItem[] {
  const sessionOrder: Record<XSessionId, number> = { sprint: 0, core: 1, bonus: 2 };
  const kindOrder: Record<XDraftKind, number> = {
    reply: 0,
    flagship: 1,
    short: 2,
    quote: 3,
  };
  return [...drafts].sort((a, b) => {
    if (a.priority !== b.priority) return a.priority - b.priority;
    const sa = sessionOrder[a.session] ?? 9;
    const sb = sessionOrder[b.session] ?? 9;
    if (sa !== sb) return sa - sb;
    const ka = kindOrder[a.kind] ?? 9;
    const kb = kindOrder[b.kind] ?? 9;
    if (ka !== kb) return ka - kb;
    return a.label.localeCompare(b.label);
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

export function createPackId(date: string): string {
  return `pack-${date}`;
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
