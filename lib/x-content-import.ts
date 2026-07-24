import type {
  XContentPack,
  XDraftItem,
  XDraftIntent,
  XDraftKind,
  XDraftStatus,
  XPostingWindow,
  XSessionBlock,
  XSessionId,
  XSignalItem,
} from './x-content-model';
import {
  createPackId,
  createRunPackId,
  DEFAULT_SESSIONS,
  defaultEstimatedSeconds,
  defaultIntentForKind,
  defaultSessionForKind,
  normalizeDraftMeta,
  sumEstimatedSeconds,
} from './x-content-model';

const KINDS: XDraftKind[] = ['flagship', 'short', 'reply', 'quote'];
const STATUSES: XDraftStatus[] = ['ready', 'posted', 'skipped'];
const INTENTS: XDraftIntent[] = ['growth', 'authority', 'ship', 'relationship', 'optional'];
const SESSIONS: XSessionId[] = ['sprint', 'core', 'bonus'];
const WINDOWS: XPostingWindow[] = ['morning', 'midday', 'evening', 'anytime'];

function todayIsoDate(): string {
  return new Date().toISOString().slice(0, 10);
}

function slugId(prefix: string, label: string, index: number): string {
  const base = label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 40);
  return `${prefix}-${base || index}`;
}

function asKind(v: unknown): XDraftKind {
  if (typeof v === 'string' && KINDS.includes(v as XDraftKind)) return v as XDraftKind;
  const s = String(v ?? '').toLowerCase();
  if (s.includes('flag') || s.includes('thread') || s.includes('long')) return 'flagship';
  if (s.includes('reply')) return 'reply';
  if (s.includes('quote') || s === 'qt') return 'quote';
  return 'short';
}

function asStatus(v: unknown): XDraftStatus {
  if (typeof v === 'string' && STATUSES.includes(v as XDraftStatus)) return v as XDraftStatus;
  return 'ready';
}

function asIntent(v: unknown, kind: XDraftKind): XDraftIntent {
  if (typeof v === 'string' && INTENTS.includes(v as XDraftIntent)) return v as XDraftIntent;
  return defaultIntentForKind(kind);
}

function asSession(v: unknown, kind: XDraftKind): XSessionId {
  if (typeof v === 'string' && SESSIONS.includes(v as XSessionId)) return v as XSessionId;
  return defaultSessionForKind(kind);
}

function asWindow(v: unknown): XPostingWindow {
  if (typeof v === 'string' && WINDOWS.includes(v as XPostingWindow)) return v as XPostingWindow;
  return 'anytime';
}

function asPriority(v: unknown, index: number, kind: XDraftKind): number {
  const n = typeof v === 'number' ? v : parseInt(String(v ?? ''), 10);
  if (Number.isFinite(n) && n >= 1 && n <= 5) return n;
  // Default: earlier items + replies slightly higher priority
  if (kind === 'reply') return Math.min(5, 1 + Math.floor(index / 2));
  if (kind === 'flagship') return 2;
  if (kind === 'quote') return 4;
  return 3;
}

function normalizeDraft(raw: Record<string, unknown>, index: number): XDraftItem {
  const kind = asKind(raw.kind ?? raw.type);
  const label = String(raw.label ?? raw.title ?? raw.handle ?? `${kind} ${index + 1}`);
  const body = String(raw.body ?? raw.text ?? raw.content ?? '').trim();
  const id =
    typeof raw.id === 'string' && raw.id.trim() ? raw.id.trim() : slugId(kind, label, index);
  const metaRaw =
    raw.meta ??
    (typeof raw.url === 'string'
      ? raw.url
      : typeof raw.target === 'string'
        ? raw.target
        : undefined);
  const { meta, tip } = normalizeDraftMeta(
    metaRaw,
    typeof raw.tip === 'string' ? raw.tip : undefined
  );

  const targetHandle =
    typeof raw.targetHandle === 'string'
      ? raw.targetHandle
      : label.startsWith('@')
        ? label
        : undefined;

  const est =
    typeof raw.estimatedSeconds === 'number' && raw.estimatedSeconds > 0
      ? raw.estimatedSeconds
      : defaultEstimatedSeconds(kind);

  return {
    id,
    kind,
    label,
    body,
    meta,
    status: asStatus(raw.status),
    priority: asPriority(raw.priority, index, kind),
    intent: asIntent(raw.intent, kind),
    session: asSession(raw.session, kind),
    estimatedSeconds: est,
    why: String(raw.why ?? raw.rationale ?? '').trim() || defaultWhy(kind, label),
    tip,
    postingWindow: asWindow(raw.postingWindow),
    targetHandle,
    targetReach: typeof raw.targetReach === 'string' ? raw.targetReach : undefined,
  };
}

function defaultWhy(kind: XDraftKind, label: string): string {
  switch (kind) {
    case 'reply':
      return `Growth reply on ${label} — discovery via someone else's audience.`;
    case 'flagship':
      return 'Authority post — teaches your evaluation thesis; pin-worthy if it hits.';
    case 'short':
      return 'Quick original — stays on-brand without a long thread.';
    case 'quote':
      return 'Optional QT — only if still relevant when you reach it.';
    default:
      return 'On-brand action.';
  }
}

function normalizeSignal(raw: Record<string, unknown>, index: number): XSignalItem {
  const heatRaw = raw.heat ?? raw.urgency;
  const heat =
    typeof heatRaw === 'number'
      ? heatRaw
      : parseInt(String(heatRaw ?? ''), 10);
  return {
    id: typeof raw.id === 'string' && raw.id.trim() ? raw.id.trim() : `sig-${index + 1}`,
    summary: String(raw.summary ?? raw.title ?? raw.headline ?? '').trim(),
    whyItMatters: String(
      raw.whyItMatters ?? raw.why ?? raw.relevance ?? raw.whyYou ?? ''
    ).trim(),
    url: typeof raw.url === 'string' ? raw.url : undefined,
    heat: Number.isFinite(heat) ? Math.min(5, Math.max(1, heat)) : undefined,
    category: typeof raw.category === 'string' ? raw.category : undefined,
  };
}

function normalizeSessions(raw: unknown): XSessionBlock[] {
  if (!Array.isArray(raw) || raw.length === 0) return DEFAULT_SESSIONS;
  const parsed = raw
    .filter((s): s is Record<string, unknown> => s != null && typeof s === 'object')
    .map((s) => ({
      id: asSession(s.id, 'short'),
      title: String(s.title ?? s.id ?? 'Session'),
      maxMinutes: typeof s.maxMinutes === 'number' ? s.maxMinutes : 20,
      description: String(s.description ?? ''),
    }));
  return parsed.length ? parsed : DEFAULT_SESSIONS;
}

/**
 * Normalize a loose object into a valid XContentPack with rich defaults.
 */
export function normalizePack(input: Record<string, unknown>): XContentPack {
  const date =
    typeof input.date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(input.date)
      ? input.date
      : todayIsoDate();

  const id =
    typeof input.id === 'string' && input.id.trim()
      ? input.id.trim()
      : createRunPackId();

  const draftsRaw = Array.isArray(input.drafts) ? input.drafts : [];
  const drafts = draftsRaw
    .filter((d): d is Record<string, unknown> => d != null && typeof d === 'object')
    .map((d, i) => normalizeDraft(d, i))
    .filter((d) => d.body.length > 0);

  const signalsRaw = Array.isArray(input.signals) ? input.signals : [];
  const signals = signalsRaw
    .filter((s): s is Record<string, unknown> => s != null && typeof s === 'object')
    .map((s, i) => normalizeSignal(s, i))
    .filter((s) => s.summary.length > 0);

  const skipList = Array.isArray(input.skipList)
    ? input.skipList.map(String).filter(Boolean)
    : Array.isArray(input.skip)
      ? input.skip.map(String).filter(Boolean)
      : [];

  const schedule = Array.isArray(input.schedule) ? input.schedule.map(String).filter(Boolean) : [];

  const mvpDraftIds = Array.isArray(input.mvpDraftIds)
    ? input.mvpDraftIds.map(String).filter(Boolean)
    : undefined;

  const plannedFromDrafts = Math.ceil(sumEstimatedSeconds(drafts) / 60);
  const plannedMinutes =
    typeof input.plannedMinutes === 'number' ? input.plannedMinutes : plannedFromDrafts || undefined;

  const now = new Date().toISOString();
  const title =
    String(input.title ?? '').trim() ||
    (drafts[0]?.label ? `Daily pack — ${drafts[0].label}` : `X pack ${date}`);

  return {
    id,
    date,
    title,
    briefing:
      typeof input.briefing === 'string'
        ? input.briefing
        : typeof input.summary === 'string'
          ? input.summary
          : undefined,
    theme: typeof input.theme === 'string' ? input.theme : undefined,
    mvpDraftIds,
    plannedMinutes,
    signals,
    skipList,
    drafts,
    schedule,
    sessions: normalizeSessions(input.sessions),
    createdAt: typeof input.createdAt === 'string' ? input.createdAt : now,
    updatedAt: now,
  };
}

export function extractJsonCandidate(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;

  const fence = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fence?.[1]) return fence[1].trim();

  if (trimmed.startsWith('{') || trimmed.startsWith('[')) return trimmed;

  const objStart = trimmed.indexOf('{');
  const arrStart = trimmed.indexOf('[');
  let start = -1;
  if (objStart >= 0 && arrStart >= 0) start = Math.min(objStart, arrStart);
  else start = Math.max(objStart, arrStart);
  if (start < 0) return null;

  const slice = trimmed.slice(start);
  const open = slice[0];
  const close = open === '{' ? '}' : ']';
  let depth = 0;
  let inStr = false;
  let esc = false;
  for (let i = 0; i < slice.length; i++) {
    const ch = slice[i];
    if (inStr) {
      if (esc) esc = false;
      else if (ch === '\\') esc = true;
      else if (ch === '"') inStr = false;
      continue;
    }
    if (ch === '"') {
      inStr = true;
      continue;
    }
    if (ch === open) depth++;
    else if (ch === close) {
      depth--;
      if (depth === 0) return slice.slice(0, i + 1);
    }
  }
  return null;
}

export function parseScoutMarkdown(raw: string): XContentPack {
  const date = todayIsoDate();
  const drafts: XDraftItem[] = [];
  const signals: XSignalItem[] = [];
  const skipList: string[] = [];
  const schedule: string[] = [];
  let title = `Scout pack ${date}`;
  let briefing: string | undefined;

  const lines = raw.replace(/\r\n/g, '\n').split('\n');
  let section = '';
  let buf: string[] = [];

  const flushDraft = (kind: XDraftKind, label: string) => {
    const body = buf.join('\n').trim();
    if (!body) return;
    drafts.push(
      normalizeDraft(
        {
          kind,
          label,
          body,
          status: 'ready',
        },
        drafts.length
      )
    );
    buf = [];
  };

  for (const line of lines) {
    const h = line.match(/^#{1,3}\s+(.+)/);
    if (h) {
      const heading = h[1].trim().toLowerCase();
      if (heading.includes('fresh signal') || heading.includes('signal')) section = 'signals';
      else if (heading.includes('skip')) section = 'skip';
      else if (heading.includes('draft')) section = 'drafts';
      else if (heading.includes('reply')) section = 'replies';
      else if (heading.includes('schedule') || heading.includes('2-hour') || heading.includes('2 hour'))
        section = 'schedule';
      else if (heading.includes('flagship') || heading.includes('mini-thread') || heading.includes('thread')) {
        if (section === 'drafts' || section === 'flagship') flushDraft('flagship', h[1].trim());
        section = 'flagship';
        buf = [];
      } else if (heading.includes('short')) {
        if (section === 'short' || section === 'drafts') flushDraft('short', h[1].trim());
        section = 'short';
        buf = [];
      } else if (heading.includes('quote') || heading === 'qt' || heading.includes('optional qt')) {
        if (section === 'quote') flushDraft('quote', h[1].trim());
        section = 'quote';
        buf = [];
      } else {
        section = 'other';
      }
      continue;
    }

    if (section === 'signals') {
      const m = line.match(/^\d+\.\s+\*\*(.+?)\*\*\s*[—–-]\s*(.+)/);
      if (m) {
        signals.push({
          id: `sig-${signals.length + 1}`,
          summary: m[1].trim(),
          whyItMatters: m[2].trim(),
        });
        continue;
      }
      const m2 = line.match(/^\d+\.\s+(.+)/);
      if (m2) {
        signals.push({
          id: `sig-${signals.length + 1}`,
          summary: m2[1].trim(),
          whyItMatters: '',
        });
      }
      continue;
    }

    if (section === 'skip') {
      const bullet = line.match(/^[-*]\s+(.+)/);
      if (bullet) skipList.push(bullet[1].trim());
      continue;
    }

    if (section === 'schedule') {
      const bullet = line.match(/^[-*|\d.]+\s+(.+)/);
      if (bullet) schedule.push(bullet[1].trim());
      else if (line.trim()) schedule.push(line.trim());
      continue;
    }

    if (section === 'replies') {
      const handleLine =
        line.match(/^\d+\.\s+\*\*(@?[\w]+)\*\*/i) || line.match(/^\*\*(@?[\w]+)\*\*/);
      if (handleLine) {
        const label = handleLine[1].startsWith('@') ? handleLine[1] : `@${handleLine[1]}`;
        drafts.push(
          normalizeDraft({ kind: 'reply', label, body: ' ', status: 'ready' }, drafts.length)
        );
        // body filled below — use placeholder then fix
        drafts[drafts.length - 1].body = '';
        continue;
      }
      const lastReply = [...drafts].reverse().find((d) => d.kind === 'reply');
      if (lastReply && line.trim() && !line.startsWith('http')) {
        lastReply.body = (lastReply.body ? lastReply.body + '\n' : '') + line.trim();
      }
      if (lastReply && line.includes('x.com')) {
        lastReply.meta = line.match(/https?:\/\/\S+/)?.[0] ?? lastReply.meta;
      }
      continue;
    }

    if (section === 'flagship' || section === 'short' || section === 'quote') {
      const sub = line.match(/^\*\*([ABC]|\d+)\.?\*\*\s*(.*)/);
      if (sub && section === 'short') {
        if (buf.length) flushDraft('short', `Short ${sub[1]}`);
        buf = sub[2] ? [sub[2]] : [];
        continue;
      }
      buf.push(line);
    }
  }

  if (section === 'flagship' && buf.length) flushDraft('flagship', 'Flagship mini-thread');
  if (section === 'short' && buf.length)
    flushDraft('short', `Short ${drafts.filter((d) => d.kind === 'short').length + 1}`);
  if (section === 'quote' && buf.length) flushDraft('quote', 'Quote tweet');

  const cleaned = drafts
    .map((d) => ({ ...d, body: d.body.trim() }))
    .filter((d) => d.body.length > 0);

  if (signals[0]?.summary) {
    title = signals[0].summary.slice(0, 80);
    briefing = signals
      .slice(0, 3)
      .map((s) => s.summary)
      .join(' · ');
  }

  return normalizePack({
    date,
    title,
    briefing,
    signals,
    skipList,
    drafts: cleaned,
    schedule,
  });
}

export type ImportResult = {
  pack: XContentPack;
  source: 'json' | 'markdown';
  warning?: string;
};

export function parsePackImport(raw: string): ImportResult {
  const jsonText = extractJsonCandidate(raw);
  if (jsonText) {
    try {
      const parsed = JSON.parse(jsonText) as unknown;
      let obj: Record<string, unknown>;

      if (Array.isArray(parsed)) {
        const first = parsed[0];
        if (!first || typeof first !== 'object') {
          throw new Error('JSON array did not contain a pack object');
        }
        obj = first as Record<string, unknown>;
      } else if (parsed && typeof parsed === 'object') {
        const rec = parsed as Record<string, unknown>;
        if (rec.pack && typeof rec.pack === 'object') {
          obj = rec.pack as Record<string, unknown>;
        } else {
          obj = rec;
        }
      } else {
        throw new Error('JSON root must be an object or array');
      }

      const pack = normalizePack(obj);
      if (pack.drafts.length === 0) {
        return {
          pack,
          source: 'json',
          warning: 'Pack parsed but has zero drafts — check the JSON drafts array.',
        };
      }
      return { pack, source: 'json' };
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'JSON parse failed';
      const pack = parseScoutMarkdown(raw);
      return {
        pack,
        source: 'markdown',
        warning: `JSON failed (${msg}); used markdown parser instead.`,
      };
    }
  }

  const pack = parseScoutMarkdown(raw);
  if (pack.drafts.length === 0 && pack.signals.length === 0) {
    throw new Error(
      'Could not parse import. Paste pack JSON (preferred) or scout markdown with Drafts/Replies.'
    );
  }
  return {
    pack,
    source: 'markdown',
    warning:
      pack.drafts.length === 0
        ? 'Parsed signals/schedule but no draft bodies — prefer JSON import.'
        : undefined,
  };
}

export const PACK_JSON_EXAMPLE = `{
  "date": "2026-07-20",
  "title": "Short title for the day",
  "theme": "Process eval > leaderboard theater",
  "briefing": "One-line context for you",
  "plannedMinutes": 60,
  "mvpDraftIds": ["reply-1", "reply-2", "reply-3", "flag-1"],
  "signals": [
    {
      "id": "sig-1",
      "summary": "What happened",
      "whyItMatters": "Why for Gargeya",
      "url": "https://x.com/...",
      "heat": 5,
      "category": "models"
    }
  ],
  "skipList": ["Noise to ignore"],
  "drafts": [
    {
      "id": "reply-1",
      "kind": "reply",
      "label": "@handle",
      "body": "Specific insight…",
      "meta": "https://x.com/...",
      "status": "ready",
      "priority": 1,
      "intent": "growth",
      "session": "sprint",
      "estimatedSeconds": 75,
      "why": "Their audience = your ICP",
      "targetHandle": "@handle",
      "targetReach": "80k",
      "postingWindow": "anytime"
    },
    {
      "id": "flag-1",
      "kind": "flagship",
      "label": "Flagship mini-thread",
      "body": "1/ …",
      "status": "ready",
      "priority": 2,
      "intent": "authority",
      "session": "core",
      "estimatedSeconds": 240,
      "why": "Thesis post for profile visitors",
      "postingWindow": "midday"
    }
  ],
  "schedule": ["0–20m sprint replies", "20–55m flagship + shorts"],
  "sessions": [
    { "id": "sprint", "title": "Reply sprint", "maxMinutes": 20, "description": "Reach" },
    { "id": "core", "title": "Core posts", "maxMinutes": 35, "description": "Authority" },
    { "id": "bonus", "title": "Bonus", "maxMinutes": 25, "description": "Optional" }
  ]
}`;
