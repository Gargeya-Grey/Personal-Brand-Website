/** Client-safe Notes types + pure helpers (no Node fs). */

export const NEWSLETTER_TZ = 'Asia/Kolkata';
export const SEND_HOUR_LOCAL = 19;
export const SEND_WINDOW_MINUTES = 35;
export const READ_PING_SECONDS = 15;
export const READ_CAP_SECONDS = 20 * 60;
export const READ_MEDIAN_MIN_SECONDS = 20;
export const MAX_BODY_CHARS = 40_000;
export const BRIEF_URL =
  'https://raw.githubusercontent.com/Gargeya-Grey/Personal-Brand-Website/main/data/newsletter-brief.md';
export const VOICE_URL =
  'https://raw.githubusercontent.com/Gargeya-Grey/Personal-Brand-Website/main/data/gargeya-voice.md';

export type NewsletterStage = 'draft' | 'approved' | 'sending' | 'sent' | 'skipped';

export type NewsletterLinkKind = 'x' | 'blog' | 'source';

export type NewsletterLink = {
  label: string;
  url: string;
  kind: NewsletterLinkKind;
};

export type NewsletterSource = {
  title: string;
  url: string;
};

export type NewsletterTopicStatus = 'proposed' | 'picked' | 'rejected';

export type NewsletterTopic = {
  id: string;
  title: string;
  thesisFit: string;
  whyDistinct: string;
  sources: NewsletterSource[];
  status: NewsletterTopicStatus;
  curatorNote?: string;
};

export type NewsletterRecipientSend = {
  email: string;
  timezone: string;
  sentAt: string;
  resendId?: string;
};

export type CuratorEventKind =
  | 'picked'
  | 'rejected'
  | 'edited'
  | 'acknowledged'
  | 'skipped'
  | 'auto_publish_on'
  | 'auto_publish_off'
  | 'note'
  | 'research_refresh';

export type CuratorEvent = {
  at: string;
  kind: CuratorEventKind;
  note?: string;
};

export type NewsletterWeek = {
  id: string;
  weekOf: string;
  slug: string;
  title: string;
  dek: string;
  subject: string;
  stage: NewsletterStage;
  autoPublish: boolean;
  acknowledgedAt: string | null;
  bodyMd: string;
  draftMd: string;
  links: NewsletterLink[];
  topics: NewsletterTopic[];
  sources: NewsletterSource[];
  events: CuratorEvent[];
  sentTo: NewsletterRecipientSend[];
  resendBroadcastIds: string[];
  sentAt: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type NewsletterTaste = {
  briefUrl: string;
  voiceUrl: string;
  rejectedTopics: { title: string; reason: string }[];
  editPairs: { weekOf: string; title: string; draftMd: string; bodyMd: string }[];
  notes: string[];
};

export type IssueMetrics = {
  id: string;
  weekOf: string;
  title: string;
  stage: NewsletterStage;
  subscribersAtSend: number | null;
  uniqueOpens: number | null;
  medianReadSeconds: number | null;
  sentCount: number;
};

export type NewsletterDashboard = {
  subscribers: number | null;
  lastUniqueOpens: number | null;
  lastMedianReadSeconds: number | null;
  issues: IssueMetrics[];
};

const STAGES: NewsletterStage[] = ['draft', 'approved', 'sending', 'sent', 'skipped'];
const LINK_KINDS: NewsletterLinkKind[] = ['x', 'blog', 'source'];
const TOPIC_STATUSES: NewsletterTopicStatus[] = ['proposed', 'picked', 'rejected'];
const EVENT_KINDS: CuratorEventKind[] = [
  'picked',
  'rejected',
  'edited',
  'acknowledged',
  'skipped',
  'auto_publish_on',
  'auto_publish_off',
  'note',
  'research_refresh',
];

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function asString(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback;
}

function asBoolean(value: unknown, fallback = false): boolean {
  return typeof value === 'boolean' ? value : fallback;
}

function isStage(value: string): value is NewsletterStage {
  return (STAGES as string[]).includes(value);
}

function part(parts: Intl.DateTimeFormatPart[], type: string): string {
  return parts.find((p) => p.type === type)?.value ?? '';
}

export function zonedParts(
  now: Date,
  timeZone: string
): { date: string; weekday: string; hour: number; minute: number } {
  const dateParts = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(now);
  const clockParts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(now);
  return {
    date: `${part(dateParts, 'year')}-${part(dateParts, 'month')}-${part(dateParts, 'day')}`,
    weekday: part(clockParts, 'weekday'),
    hour: Number(part(clockParts, 'hour')),
    minute: Number(part(clockParts, 'minute')),
  };
}

export function addDays(dateStr: string, days: number): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateStr);
  if (!match) return dateStr;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const dt = new Date(Date.UTC(year, month - 1, day + days));
  return dt.toISOString().slice(0, 10);
}

/** Upcoming Sunday in a timezone. If today is Sunday, return today. */
export function upcomingSunday(now = new Date(), timeZone = NEWSLETTER_TZ): string {
  const { date, weekday } = zonedParts(now, timeZone);
  const idx = WEEKDAYS.indexOf(weekday as (typeof WEEKDAYS)[number]);
  if (idx <= 0) return date;
  return addDays(date, 7 - idx);
}

export function letterIdForSunday(sunday: string): string {
  return `letter-${sunday}`;
}

export function sanitizeSlug(raw: string, fallback: string): string {
  const cleaned = raw
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 120);
  return cleaned || fallback;
}

export function isIanaTimeZone(value: string): boolean {
  if (!value || value.length > 80) return false;
  try {
    Intl.DateTimeFormat('en-US', { timeZone: value }).format(new Date());
    return true;
  } catch {
    return false;
  }
}

export function normalizeTimeZone(value: unknown): string {
  const raw = asString(value).trim();
  if (isIanaTimeZone(raw)) return raw;
  return NEWSLETTER_TZ;
}

export function isLocalSunday7pm(timeZone: string, now = new Date()): boolean {
  const tz = normalizeTimeZone(timeZone);
  const local = zonedParts(now, tz);
  if (local.weekday !== 'Sun') return false;
  const minutes = local.hour * 60 + local.minute;
  const start = SEND_HOUR_LOCAL * 60;
  return minutes >= start && minutes < start + SEND_WINDOW_MINUTES;
}

export function isInSendWindow(weekOf: string, now = new Date()): boolean {
  const ist = zonedParts(now, NEWSLETTER_TZ).date;
  const earliest = addDays(weekOf, -1);
  const latest = addDays(weekOf, 2);
  return ist >= earliest && ist <= latest;
}

export function wordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function sanitizeSource(raw: unknown): NewsletterSource | null {
  if (!isRecord(raw)) return null;
  const url = asString(raw.url).trim();
  const title = asString(raw.title).trim() || url;
  if (!/^https?:\/\//i.test(url)) return null;
  return { title: title.slice(0, 200), url: url.slice(0, 500) };
}

function sanitizeLink(raw: unknown): NewsletterLink | null {
  if (!isRecord(raw)) return null;
  const url = asString(raw.url).trim();
  const label = asString(raw.label).trim();
  const kindRaw = asString(raw.kind);
  if (!label || !/^https?:\/\//i.test(url)) return null;
  const kind: NewsletterLinkKind = LINK_KINDS.includes(kindRaw as NewsletterLinkKind)
    ? (kindRaw as NewsletterLinkKind)
    : 'source';
  return { label: label.slice(0, 120), url: url.slice(0, 500), kind };
}

function sanitizeTopic(raw: unknown, index: number): NewsletterTopic | null {
  if (!isRecord(raw)) return null;
  const title = asString(raw.title).trim();
  if (!title) return null;
  const statusRaw = asString(raw.status, 'proposed');
  const status: NewsletterTopicStatus = TOPIC_STATUSES.includes(statusRaw as NewsletterTopicStatus)
    ? (statusRaw as NewsletterTopicStatus)
    : 'proposed';
  const sources = Array.isArray(raw.sources)
    ? raw.sources.map(sanitizeSource).filter((s): s is NewsletterSource => Boolean(s))
    : [];
  const note = asString(raw.curatorNote).trim();
  return {
    id: asString(raw.id).trim() || `topic-${index + 1}`,
    title: title.slice(0, 180),
    thesisFit: asString(raw.thesisFit).trim().slice(0, 500),
    whyDistinct: asString(raw.whyDistinct).trim().slice(0, 500),
    sources,
    status,
    curatorNote: note ? note.slice(0, 500) : undefined,
  };
}

function sanitizeEvent(raw: unknown): CuratorEvent | null {
  if (!isRecord(raw)) return null;
  const kind = asString(raw.kind);
  if (!EVENT_KINDS.includes(kind as CuratorEventKind)) return null;
  const note = asString(raw.note).trim();
  return {
    at: asString(raw.at) || new Date().toISOString(),
    kind: kind as CuratorEventKind,
    note: note ? note.slice(0, 800) : undefined,
  };
}

function sanitizeSend(raw: unknown): NewsletterRecipientSend | null {
  if (!isRecord(raw)) return null;
  const email = asString(raw.email).trim().toLowerCase();
  if (!email.includes('@')) return null;
  return {
    email: email.slice(0, 200),
    timezone: normalizeTimeZone(raw.timezone),
    sentAt: asString(raw.sentAt) || new Date().toISOString(),
    resendId: asString(raw.resendId).trim() || undefined,
  };
}

export function emptyWeek(sunday: string, now = new Date()): NewsletterWeek {
  const iso = now.toISOString();
  return {
    id: letterIdForSunday(sunday),
    weekOf: sunday,
    slug: sunday,
    title: '',
    dek: '',
    subject: '',
    stage: 'draft',
    autoPublish: false,
    acknowledgedAt: null,
    bodyMd: '',
    draftMd: '',
    links: [],
    topics: [],
    sources: [],
    events: [],
    sentTo: [],
    resendBroadcastIds: [],
    sentAt: null,
    completedAt: null,
    createdAt: iso,
    updatedAt: iso,
  };
}

export function sanitizeWeek(raw: unknown, now = new Date()): NewsletterWeek {
  const baseSunday = upcomingSunday(now);
  const base = emptyWeek(baseSunday, now);
  if (!isRecord(raw)) return base;

  const weekOfMatch = asString(raw.weekOf || raw.week_of).match(/\d{4}-\d{2}-\d{2}/);
  const weekOf = weekOfMatch ? weekOfMatch[0] : base.weekOf;
  const stageRaw = asString(raw.stage, 'draft');
  const stage: NewsletterStage = isStage(stageRaw) ? stageRaw : 'draft';
  const title = asString(raw.title).trim().slice(0, 180);
  const subject = asString(raw.subject).trim().slice(0, 180) || title;
  const slug = sanitizeSlug(asString(raw.slug), weekOf);
  const bodyMd = asString(raw.bodyMd).slice(0, MAX_BODY_CHARS);
  const draftMd = asString(raw.draftMd).slice(0, MAX_BODY_CHARS);
  const ack = asString(raw.acknowledgedAt).trim();

  return {
    id: asString(raw.id).trim() || letterIdForSunday(weekOf),
    weekOf,
    slug,
    title,
    dek: asString(raw.dek).trim().slice(0, 280),
    subject,
    stage,
    autoPublish: asBoolean(raw.autoPublish, false),
    acknowledgedAt: ack || null,
    bodyMd,
    draftMd: draftMd || bodyMd,
    links: Array.isArray(raw.links)
      ? raw.links.map(sanitizeLink).filter((l): l is NewsletterLink => Boolean(l)).slice(0, 12)
      : [],
    topics: Array.isArray(raw.topics)
      ? raw.topics.map(sanitizeTopic).filter((t): t is NewsletterTopic => Boolean(t)).slice(0, 6)
      : [],
    sources: Array.isArray(raw.sources)
      ? raw.sources.map(sanitizeSource).filter((s): s is NewsletterSource => Boolean(s)).slice(0, 20)
      : [],
    events: Array.isArray(raw.events)
      ? raw.events.map(sanitizeEvent).filter((e): e is CuratorEvent => Boolean(e)).slice(-40)
      : [],
    sentTo: Array.isArray(raw.sentTo)
      ? raw.sentTo.map(sanitizeSend).filter((s): s is NewsletterRecipientSend => Boolean(s))
      : [],
    resendBroadcastIds: Array.isArray(raw.resendBroadcastIds)
      ? raw.resendBroadcastIds.map((id) => asString(id).trim()).filter(Boolean).slice(0, 20)
      : [],
    sentAt: asString(raw.sentAt).trim() || null,
    completedAt: asString(raw.completedAt).trim() || null,
    createdAt: asString(raw.createdAt) || now.toISOString(),
    updatedAt: asString(raw.updatedAt) || now.toISOString(),
  };
}

function curatorEdited(week: NewsletterWeek): boolean {
  return week.bodyMd.trim() !== week.draftMd.trim() && week.bodyMd.trim().length > 0;
}

function terminalStage(stage: NewsletterStage): boolean {
  return stage === 'sent' || stage === 'skipped';
}

/**
 * Bot ingest merge. Curator fields survive a rewrite the way X To-Do
 * preserves posted/skipped.
 */
export function mergeIngest(
  existing: NewsletterWeek | null,
  incomingRaw: unknown,
  now = new Date()
): NewsletterWeek {
  const incoming = sanitizeWeek(incomingRaw, now);
  if (!existing) {
    const created = {
      ...incoming,
      draftMd: incoming.draftMd || incoming.bodyMd,
      bodyMd: incoming.bodyMd || incoming.draftMd,
      autoPublish: incoming.autoPublish,
      stage: incoming.stage === 'skipped' || incoming.stage === 'sent' ? 'draft' : incoming.stage,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };
    if (incoming.draftMd && incoming.bodyMd && incoming.draftMd !== incoming.bodyMd) {
      created.bodyMd = incoming.bodyMd;
      created.draftMd = incoming.draftMd;
    } else {
      created.bodyMd = incoming.bodyMd || incoming.draftMd;
      created.draftMd = incoming.draftMd || incoming.bodyMd;
    }
    return created;
  }

  if (terminalStage(existing.stage)) {
    return {
      ...existing,
      updatedAt: existing.updatedAt,
    };
  }

  const keepBody = Boolean(existing.acknowledgedAt) || curatorEdited(existing);
  const nextBody = keepBody ? existing.bodyMd : incoming.bodyMd || incoming.draftMd || existing.bodyMd;
  const nextDraft = incoming.draftMd || incoming.bodyMd || existing.draftMd;
  const researchChanged = nextDraft.trim() !== existing.draftMd.trim();

  const events = [...existing.events];
  if (researchChanged) {
    events.push({
      at: now.toISOString(),
      kind: 'research_refresh',
      note: 'Bot updated the draft. Curator body kept if already edited.',
    });
  }

  const incomingTopics = incoming.topics.length ? incoming.topics : existing.topics;
  const topics = incomingTopics.map((topic) => {
    const prior = existing.topics.find((t) => t.id === topic.id || t.title === topic.title);
    if (!prior) return topic;
    if (prior.status === 'picked' || prior.status === 'rejected') {
      return {
        ...topic,
        status: prior.status,
        curatorNote: prior.curatorNote || topic.curatorNote,
      };
    }
    return topic;
  });

  return {
    ...existing,
    title: incoming.title || existing.title,
    dek: incoming.dek || existing.dek,
    subject: incoming.subject || incoming.title || existing.subject,
    slug: incoming.slug && incoming.slug !== incoming.weekOf ? incoming.slug : existing.slug,
    draftMd: nextDraft,
    bodyMd: nextBody,
    links: incoming.links.length ? incoming.links : existing.links,
    sources: incoming.sources.length ? incoming.sources : existing.sources,
    topics,
    events: events.slice(-40),
    autoPublish: existing.autoPublish,
    acknowledgedAt: existing.acknowledgedAt,
    sentTo: existing.sentTo,
    resendBroadcastIds: existing.resendBroadcastIds,
    sentAt: existing.sentAt,
    completedAt: existing.completedAt,
    stage: existing.stage === 'approved' || existing.stage === 'sending' ? existing.stage : 'draft',
    updatedAt: now.toISOString(),
  };
}

export function canRelease(week: NewsletterWeek): boolean {
  if (week.stage === 'skipped' || week.stage === 'sent') return false;
  if (!week.bodyMd.trim() || !week.title.trim()) return false;
  if (week.autoPublish) return true;
  return Boolean(week.acknowledgedAt);
}

export function shouldSendToTimezone(
  week: NewsletterWeek,
  timeZone: string,
  now = new Date()
): boolean {
  if (!canRelease(week)) return false;
  if (!isInSendWindow(week.weekOf, now) && !(week.acknowledgedAt && !week.autoPublish)) {
    return false;
  }
  if (week.acknowledgedAt && !week.autoPublish) return true;
  return isLocalSunday7pm(timeZone, now);
}

export function alreadySentTo(week: NewsletterWeek, email: string): boolean {
  const target = email.trim().toLowerCase();
  return week.sentTo.some((row) => row.email === target);
}

export function markSent(
  week: NewsletterWeek,
  recipients: NewsletterRecipientSend[],
  now = new Date()
): NewsletterWeek {
  const sentTo = [...week.sentTo];
  for (const row of recipients) {
    if (!alreadySentTo({ ...week, sentTo }, row.email)) sentTo.push(row);
  }
  const firstSent = week.sentAt || (sentTo.length ? now.toISOString() : null);
  return {
    ...week,
    sentTo,
    sentAt: firstSent,
    stage: 'sending',
    updatedAt: now.toISOString(),
  };
}

export function markComplete(week: NewsletterWeek, now = new Date()): NewsletterWeek {
  return {
    ...week,
    stage: 'sent',
    completedAt: now.toISOString(),
    updatedAt: now.toISOString(),
  };
}

export function acknowledge(week: NewsletterWeek, now = new Date()): NewsletterWeek {
  const events = [
    ...week.events,
    { at: now.toISOString(), kind: 'acknowledged' as const, note: "I'm happy with this." },
  ];
  return {
    ...week,
    acknowledgedAt: now.toISOString(),
    stage: week.stage === 'sent' ? 'sent' : 'approved',
    events: events.slice(-40),
    updatedAt: now.toISOString(),
  };
}

export function setAutoPublish(
  week: NewsletterWeek,
  autoPublish: boolean,
  now = new Date()
): NewsletterWeek {
  const events = [
    ...week.events,
    {
      at: now.toISOString(),
      kind: autoPublish ? ('auto_publish_on' as const) : ('auto_publish_off' as const),
    },
  ];
  return {
    ...week,
    autoPublish,
    events: events.slice(-40),
    updatedAt: now.toISOString(),
  };
}

export function skipWeek(week: NewsletterWeek, note: string, now = new Date()): NewsletterWeek {
  return {
    ...week,
    stage: 'skipped',
    events: [
      ...week.events,
      { at: now.toISOString(), kind: 'skipped' as const, note: note.slice(0, 800) },
    ].slice(-40),
    updatedAt: now.toISOString(),
  };
}

export function applyCuratorEdit(
  week: NewsletterWeek,
  patch: {
    title?: string;
    dek?: string;
    subject?: string;
    bodyMd?: string;
    slug?: string;
    links?: NewsletterLink[];
  },
  now = new Date()
): NewsletterWeek {
  const bodyMd = patch.bodyMd != null ? patch.bodyMd.slice(0, MAX_BODY_CHARS) : week.bodyMd;
  const title = patch.title != null ? patch.title.trim().slice(0, 180) : week.title;
  const changed = bodyMd !== week.bodyMd || title !== week.title;
  const events = changed
    ? [...week.events, { at: now.toISOString(), kind: 'edited' as const }]
    : week.events;
  return {
    ...week,
    title,
    dek: patch.dek != null ? patch.dek.trim().slice(0, 280) : week.dek,
    subject: patch.subject != null ? patch.subject.trim().slice(0, 180) : week.subject,
    bodyMd,
    slug: patch.slug ? sanitizeSlug(patch.slug, week.weekOf) : week.slug,
    links: patch.links ? patch.links.slice(0, 12) : week.links,
    events: events.slice(-40),
    stage: week.stage === 'approved' || week.stage === 'sending' || week.stage === 'sent'
      ? week.stage
      : 'draft',
    updatedAt: now.toISOString(),
  };
}

export function publicWeek(week: NewsletterWeek): boolean {
  return week.stage === 'sent' || week.stage === 'sending';
}

export function median(values: number[]): number | null {
  if (!values.length) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 0) {
    const a = sorted[mid - 1];
    const b = sorted[mid];
    if (a == null || b == null) return null;
    return Math.round((a + b) / 2);
  }
  return sorted[mid] ?? null;
}

export function medianReadSeconds(sessionSeconds: number[]): number | null {
  return median(sessionSeconds.filter((n) => n >= READ_MEDIAN_MIN_SECONDS));
}

export function buildTaste(weeks: NewsletterWeek[]): NewsletterTaste {
  const rejectedTopics: NewsletterTaste['rejectedTopics'] = [];
  const editPairs: NewsletterTaste['editPairs'] = [];
  const notes: string[] = [];

  const chronological = [...weeks].sort((a, b) => b.weekOf.localeCompare(a.weekOf));
  for (const week of chronological) {
    for (const topic of week.topics) {
      if (topic.status === 'rejected') {
        rejectedTopics.push({
          title: topic.title,
          reason: topic.curatorNote || 'Rejected.',
        });
      }
    }
    if (week.draftMd.trim() && week.bodyMd.trim() && week.draftMd.trim() !== week.bodyMd.trim()) {
      editPairs.push({
        weekOf: week.weekOf,
        title: week.title,
        draftMd: week.draftMd,
        bodyMd: week.bodyMd,
      });
    }
    for (const event of week.events) {
      if (event.note && (event.kind === 'note' || event.kind === 'rejected' || event.kind === 'edited')) {
        notes.push(event.note);
      }
    }
  }

  return {
    briefUrl: BRIEF_URL,
    voiceUrl: VOICE_URL,
    rejectedTopics: rejectedTopics.slice(0, 8),
    editPairs: editPairs.slice(0, 4),
    notes: notes.slice(0, 8),
  };
}

export function stageLabel(stage: NewsletterStage): string {
  if (stage === 'draft') return 'Draft';
  if (stage === 'approved') return 'Happy — waiting to send';
  if (stage === 'sending') return 'Sending';
  if (stage === 'sent') return 'Sent';
  return 'Skipped';
}
