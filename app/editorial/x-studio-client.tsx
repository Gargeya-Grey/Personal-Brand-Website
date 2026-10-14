'use client';
import './x-studio.css';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, MotionConfig, motion } from 'motion/react';
import {
  Check,
  ChevronDown,
  ExternalLink,
  Loader2,
  RefreshCw,
  Radio,
  Upload,
} from 'lucide-react';
import {
  type XContentPack,
  type XDraftItem,
  type XDraftKind,
  type XDraftStatus,
  type XSessionId,
  type XSignalItem,
  formatDuration,
  formatPackRunLabel,
  resolveMvpIds,
  sanitizePack,
  sortDraftsForExecution,
  sumEstimatedSeconds,
  DEFAULT_SESSIONS,
  extractDraftSourceUrl,
  draftOpenUrl,
} from '@/lib/x-content-model';

/** Poll while tab is visible; silent reloads only. */
const POLL_MS = 20_000;

type ViewMode = 'focus' | 'list' | 'library';
type FilterId = 'all' | 'mvp' | 'sprint' | 'core' | 'bonus' | 'replies' | 'originals' | 'p1';

function readyCount(p: XContentPack): number {
  return (p.drafts || []).filter((d) => d.status === 'ready').length;
}

function isPackCleared(p: XContentPack): boolean {
  const drafts = p.drafts || [];
  return drafts.length > 0 && readyCount(p) === 0;
}

function sortPacks(data: XContentPack[]): XContentPack[] {
  return [...data].sort((a, b) => {
    const u = (b.updatedAt || '').localeCompare(a.updatedAt || '');
    if (u !== 0) return u;
    return (b.date || '').localeCompare(a.date || '');
  });
}

/** Active queue: only packs with at least one ready task. */
function pickBestPackId(activeSorted: XContentPack[]): string | null {
  if (!activeSorted.length) return null;
  return activeSorted[0]?.id ?? null;
}

function packSubtitle(p: XContentPack): string {
  const ready = readyCount(p);
  const total = p.drafts?.length ?? 0;
  const run = formatPackRunLabel(p);
  if (ready === 0) return `${run} · completed`;
  return `${run} · ${ready}/${total} ready`;
}

/** The sitting a pack belongs to, from its id (`pack-YYYY-MM-DD-tHH`, IST). */
function sittingOf(p: XContentPack): { name: string; short: string } {
  const slotMatch = p.id.match(/-t(\d{2})$/);
  if (!slotMatch) return { name: 'Scout run', short: 'Run' };
  const hour = parseInt(slotMatch[1], 10);
  if (hour === 11) return { name: 'Morning sitting', short: 'Morning' };
  if (hour === 19) return { name: 'Evening sitting', short: 'Evening' };
  if ([13, 15, 17, 21].includes(hour)) {
    return { name: `${slotMatch[1]}:00 IST run`, short: `${slotMatch[1]}:00` };
  }
  return { name: `${slotMatch[1]}:00 UTC run (legacy)`, short: `${slotMatch[1]}:00 UTC` };
}

/** "Monday 14 October" and "14 Oct" from a pack's YYYY-MM-DD date. */
function formatPackDate(date: string | undefined): { long: string; short: string } | null {
  const match = (date || '').match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return null;
  const day = new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])));
  if (Number.isNaN(day.getTime())) return null;
  const parts = (options: Intl.DateTimeFormatOptions) =>
    new Intl.DateTimeFormat('en-GB', { ...options, timeZone: 'UTC' }).formatToParts(day);
  const pick = (list: Intl.DateTimeFormatPart[], type: string) =>
    list.find((part) => part.type === type)?.value ?? '';
  const longParts = parts({ weekday: 'long', day: 'numeric', month: 'long' });
  const shortParts = parts({ day: 'numeric', month: 'short' });
  return {
    long: `${pick(longParts, 'weekday')} ${pick(longParts, 'day')} ${pick(longParts, 'month')}`,
    short: `${pick(shortParts, 'day')} ${pick(shortParts, 'month')}`,
  };
}

const FILTERS: { id: FilterId; label: string }[] = [
  { id: 'all', label: 'All tasks' },
  { id: 'mvp', label: 'MVP' },
  { id: 'sprint', label: 'Sprint' },
  { id: 'core', label: 'Core' },
  { id: 'bonus', label: 'Bonus' },
  { id: 'replies', label: 'Replies' },
  { id: 'originals', label: 'Originals' },
  { id: 'p1', label: 'P1–2' },
];

const VIEWS: { id: ViewMode; label: string }[] = [
  { id: 'focus', label: 'Focus' },
  { id: 'list', label: 'List' },
  { id: 'library', label: 'Archive' },
];

/** Replies stay replies; a short, flagship or other own post is an "Original". */
function kindLabel(kind: XDraftKind | string | undefined): string {
  if (kind === 'reply') return 'Reply';
  if (kind === 'quote') return 'Quote';
  return 'Original';
}

/** The scout writes "Reply · UChicago analog Core"; the kind already has its own column. */
function draftTitle(label: string): string {
  const stripped = label.replace(/^(reply|original|short|flagship|quote)\s*[·:\-–—]\s*/i, '').trim();
  return stripped || label;
}

function charHint(text: string | undefined | null) {
  const count = typeof text === 'string' ? text.length : String(text ?? '').length;
  if (count <= 4000) return { count, tone: 'plain' as const };
  return { count, tone: 'over' as const };
}

function comparableStatusUrl(url: string): string {
  return url.trim().replace(/[?#].*$/, '').replace(/\/+$/, '').toLowerCase();
}

/** The scout signal that describes the post a draft answers (same status URL). */
function findSourceSignal(signals: XSignalItem[] | undefined, draft: XDraftItem): XSignalItem | undefined {
  const sourceUrl = extractDraftSourceUrl(draft.meta);
  if (!sourceUrl) return undefined;
  const wanted = comparableStatusUrl(sourceUrl);
  return (signals || []).find((s) => s.url && comparableStatusUrl(s.url) === wanted);
}

function filterDrafts(
  drafts: XDraftItem[] | undefined | null,
  filter: FilterId,
  mvpIds: Set<string>
): XDraftItem[] {
  let list = (drafts || []).filter((d) => d && d.status === 'ready');
  switch (filter) {
    case 'mvp':
      list = list.filter((d) => mvpIds.has(d.id));
      break;
    case 'sprint':
      list = list.filter((d) => d.session === 'sprint');
      break;
    case 'core':
      list = list.filter((d) => d.session === 'core');
      break;
    case 'bonus':
      list = list.filter((d) => d.session === 'bonus');
      break;
    case 'replies':
      list = list.filter((d) => d.kind === 'reply');
      break;
    case 'originals':
      list = list.filter((d) => d.kind !== 'reply');
      break;
    case 'p1':
      list = list.filter((d) => d.priority <= 2);
      break;
    default:
      break;
  }
  return sortDraftsForExecution(list);
}

function useDraftActions(
  draft: XDraftItem | null,
  onStatus: (id: string, s: XDraftStatus) => Promise<void>
) {
  const [copied, setCopied] = useState(false);
  const [busy, setBusy] = useState(false);

  const copyOpen = useCallback(async () => {
    if (!draft) return;
    try {
      await navigator.clipboard.writeText(draft.body);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      alert('Could not copy');
    }
    window.open(draftOpenUrl(draft), '_blank', 'noopener,noreferrer');
  }, [draft]);

  const done = useCallback(async () => {
    if (!draft) return;
    setBusy(true);
    try {
      await onStatus(draft.id, 'posted');
    } finally {
      setBusy(false);
    }
  }, [draft, onStatus]);

  const skip = useCallback(async () => {
    if (!draft) return;
    setBusy(true);
    try {
      await onStatus(draft.id, 'skipped');
    } finally {
      setBusy(false);
    }
  }, [draft, onStatus]);

  return { copied, busy, copyOpen, done, skip };
}

/**
 * One draft as a row of the queue.
 * - `primary`: the draft to do now. It carries the one filled button of the view.
 * - `next`: an open draft further down; its Copy & open is a hairline button.
 * - `archive`: any draft of the pack; posted and skipped ones step back and fold their text away.
 */
function DraftRow({
  draft,
  signals,
  mode,
  large,
  position,
  onStatus,
}: {
  draft: XDraftItem;
  signals: XSignalItem[] | undefined;
  mode: 'primary' | 'next' | 'archive';
  large?: boolean;
  position?: { index: number; total: number };
  onStatus: (id: string, s: XDraftStatus) => Promise<void>;
}) {
  const { copied, busy, copyOpen, done, skip } = useDraftActions(draft, onStatus);
  const chars = charHint(draft.body);
  const sourceUrl = extractDraftSourceUrl(draft.meta);
  const sourceSignal = findSourceSignal(signals, draft);
  const isPosted = draft.status === 'posted';
  const isSkipped = draft.status === 'skipped';
  const isDone = isPosted || isSkipped;
  const stateWord = isPosted ? 'Posted' : isSkipped ? 'Skipped' : null;
  const handle = draft.targetHandle ? `@${draft.targetHandle.replace(/^@/, '')}` : null;
  const reach = draft.targetReach ? draft.targetReach.replace(/-/g, ' ') : null;

  const body = (
    <p className="xq-body" data-size={large ? 'lg' : undefined}>
      {draft.body}
    </p>
  );

  return (
    <motion.li
      className="atelier-row xq-row"
      data-recede={isDone ? '' : undefined}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="xq-kind">
        <span className="atelier-status" data-tone={isPosted ? 'done' : isSkipped ? 'draft' : undefined}>
          {stateWord ?? kindLabel(draft.kind)}
        </span>
        {stateWord && <span className="xq-kind-sub">{kindLabel(draft.kind)}</span>}
      </div>

      <div className="xq-main">
        <h3 className="xq-title">{draftTitle(draft.label)}</h3>

        {sourceSignal && (
          <blockquote className="xq-source">
            <p>{sourceSignal.summary}</p>
            {(handle || reach) && (
              <footer className="atelier-mono">
                {handle && <span>{handle}</span>}
                {reach && <span>{reach}</span>}
              </footer>
            )}
          </blockquote>
        )}

        {isDone ? (
          <details className="xq-fold">
            <summary className="atelier-link">
              Show draft <ChevronDown className="w-3.5 h-3.5" aria-hidden="true" />
            </summary>
            {body}
          </details>
        ) : (
          body
        )}

        {!isDone && (draft.why || draft.tip) && (
          <div className="xq-notes">
            {draft.why && <p className="atelier-row-note">{draft.why}</p>}
            {draft.tip && (
              <p className="atelier-row-note">
                <strong>Tip.</strong> {draft.tip}
              </p>
            )}
          </div>
        )}

        <p className="atelier-meta atelier-mono xq-facts">
          {position && (
            <span>
              {position.index + 1} of {position.total}
            </span>
          )}
          {!sourceSignal && handle && <span>{handle}</span>}
          {!sourceSignal && reach && <span>{reach}</span>}
          <span data-tone={chars.tone}>{chars.count} chars</span>
          <span>{formatDuration(draft.estimatedSeconds)}</span>
          <span>P{draft.priority}</span>
          {draft.kind === 'flagship' && <span>Flagship thread</span>}
          {!sourceUrl && <span>No source link, opens compose</span>}
        </p>
      </div>

      <div className="xq-actions">
        {mode === 'archive' ? (
          <div className="xq-links">
            {isDone ? (
              <button type="button" className="atelier-link" onClick={() => void onStatus(draft.id, 'ready')}>
                Undo
              </button>
            ) : (
              <button type="button" className="atelier-link" onClick={() => void onStatus(draft.id, 'posted')}>
                Mark posted
              </button>
            )}
            {sourceUrl && (
              <a href={sourceUrl} target="_blank" rel="noopener noreferrer" className="atelier-link">
                Source <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
              </a>
            )}
          </div>
        ) : (
          <>
            <button
              type="button"
              onClick={() => void copyOpen()}
              className={`atelier-btn ${mode === 'primary' ? 'atelier-btn-primary' : 'atelier-btn-line'}`}
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" aria-hidden="true" /> Copied
                </>
              ) : (
                'Copy & open'
              )}
            </button>
            <div className="xq-links">
              <button type="button" className="atelier-link" disabled={busy} onClick={() => void done()}>
                {busy && <Loader2 className="w-3.5 h-3.5 xq-spin" aria-hidden="true" />}
                Mark posted
              </button>
              <button type="button" className="atelier-link" disabled={busy} onClick={() => void skip()}>
                Skip
              </button>
              {sourceUrl && (
                <a href={sourceUrl} target="_blank" rel="noopener noreferrer" className="atelier-link">
                  Source <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
                </a>
              )}
            </div>
          </>
        )}
      </div>
    </motion.li>
  );
}

function ImportPanel({
  open,
  onToggle,
  onImported,
}: {
  open: boolean;
  onToggle: () => void;
  onImported: (pack: XContentPack) => void;
}) {
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const run = async () => {
    setBusy(true);
    setErr(null);
    setMessage(null);
    try {
      const res = await fetch('/api/x-content', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ import: text, dryRun: false, preserveStatuses: true }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Import failed');
      onImported(data.pack);
      setMessage(`Saved “${data.pack.title}”`);
      setText('');
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : 'Import failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="atelier-section xq-minor">
      <button
        type="button"
        onClick={onToggle}
        className="atelier-link xq-disclosure"
        aria-expanded={open}
      >
        <Upload className="w-3.5 h-3.5" aria-hidden="true" />
        Advanced import
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            className="xq-import"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={5}
              placeholder="Paste pack JSON…"
              aria-label="Pack JSON"
              className="atelier-input"
              spellCheck={false}
            />
            <button
              type="button"
              disabled={busy || !text.trim()}
              onClick={() => void run()}
              className="atelier-btn atelier-btn-line"
            >
              {busy && <Loader2 className="w-4 h-4 xq-spin" aria-hidden="true" />}
              Save import
            </button>
            {message && (
              <div className="atelier-notice" data-tone="ok" role="status">
                {message}
              </div>
            )}
            {err && (
              <div className="atelier-notice" data-tone="warn" role="alert">
                {err}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

export function XStudioClient() {
  const [packs, setPacks] = useState<XContentPack[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<ViewMode>('focus');
  /** Default "all" so a pack with only non-MVP ready tasks still shows up. */
  const [filter, setFilter] = useState<FilterId>('all');
  const [importOpen, setImportOpen] = useState(false);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [live, setLive] = useState(true);
  const [pulse, setPulse] = useState(false);
  const [showMore, setShowMore] = useState(false);
  /** Show fully completed runs in the picker (hidden by default — keeps focus clean). */
  const [showCompletedRuns, setShowCompletedRuns] = useState(false);
  const knownUpdated = useRef<string | null>(null);
  /** When set, user manually chose a pack; auto-switch only if that pack has no ready work. */
  const userPickedRef = useRef<string | null>(null);
  /** Skip silent poll apply while a status mutation is in flight (avoids clobbering optimistic UI). */
  const statusInflightRef = useRef(0);

  const applyPacks = useCallback((data: XContentPack[], opts?: { forceLatest?: boolean }) => {
    if (!Array.isArray(data)) {
      console.warn('[x-studio] API did not return an array', data);
      return;
    }
    const cleaned = data
      .map((p) => sanitizePack(p))
      .filter((p): p is XContentPack => p != null);
    const sorted = sortPacks(cleaned);
    setPacks(sorted);

    const activeOnly = sorted.filter((p) => readyCount(p) > 0);
    const bestId = pickBestPackId(activeOnly);

    setSelectedId((prev) => {
      if (opts?.forceLatest) {
        userPickedRef.current = null;
        return bestId;
      }

      const locked = userPickedRef.current;
      if (locked && sorted.some((p) => p.id === locked)) {
        const lockedPack = sorted.find((p) => p.id === locked)!;
        // Stay on locked pack only while it still has ready work
        if (readyCount(lockedPack) > 0) return locked;
        userPickedRef.current = null;
        return bestId;
      }

      // If previous selection still has ready work, keep it; else jump to newest ready run
      if (prev) {
        const prevPack = sorted.find((p) => p.id === prev);
        if (prevPack && readyCount(prevPack) > 0) return prev;
      }
      return bestId;
    });

    setLastSync(new Date());
    const best = sorted.find((p) => p.id === bestId) ?? activeOnly[0] ?? sorted[0];
    const fingerprint = best
      ? `${best.id}|${best.updatedAt}|${best.title}|${readyCount(best)}`
      : null;
    if (fingerprint && knownUpdated.current && knownUpdated.current !== fingerprint) {
      setPulse(true);
      window.setTimeout(() => setPulse(false), 2400);
    }
    if (fingerprint) knownUpdated.current = fingerprint;
  }, []);

  const selectPack = useCallback((id: string) => {
    userPickedRef.current = id;
    setSelectedId(id);
    setFilter('all');
    setView('focus');
  }, []);

  const load = useCallback(
    async (opts?: { silent?: boolean; forceLatest?: boolean }) => {
      // Don't overwrite optimistic Done/Skip with a stale poll mid-request
      if (opts?.silent && statusInflightRef.current > 0) return;
      if (!opts?.silent) {
        setLoading(true);
        setError(null);
      }
      try {
        const res = await fetch('/api/x-content', {
          cache: 'no-store',
          credentials: 'include',
          headers: { Accept: 'application/json' },
        });
        const raw = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(raw.error || `Failed to load (${res.status})`);
        if (!Array.isArray(raw)) throw new Error('Unexpected API response — not a pack list');
        if (opts?.silent && statusInflightRef.current > 0) return;
        applyPacks(raw as XContentPack[], { forceLatest: opts?.forceLatest });
        setError(null);
      } catch (e: unknown) {
        if (!opts?.silent) setError(e instanceof Error ? e.message : 'Load failed');
      } finally {
        if (!opts?.silent) setLoading(false);
      }
    },
    [applyPacks]
  );

  useEffect(() => {
    const frameId = window.requestAnimationFrame(() => void load());
    return () => window.cancelAnimationFrame(frameId);
  }, [load]);

  useEffect(() => {
    if (!live) return;
    const tick = () => {
      if (document.visibilityState === 'visible') void load({ silent: true });
    };
    const id = window.setInterval(tick, POLL_MS);
    document.addEventListener('visibilitychange', tick);
    return () => {
      window.clearInterval(id);
      document.removeEventListener('visibilitychange', tick);
    };
  }, [live, load]);

  const activeRuns = useMemo(
    () => packs.filter((p) => readyCount(p) > 0),
    [packs]
  );
  const completedRuns = useMemo(
    () => packs.filter((p) => isPackCleared(p)),
    [packs]
  );

  /** Packs shown in the picker: active runs only, unless user expands completed. */
  const pickerPacks = useMemo(() => {
    if (showCompletedRuns) return packs;
    // Always include selected pack even if just cleared (so UI doesn't jump mid-click)
    const base = activeRuns;
    if (selectedId && !base.some((p) => p.id === selectedId)) {
      const sel = packs.find((p) => p.id === selectedId);
      if (sel) return sortPacks([sel, ...base]);
    }
    return base;
  }, [packs, activeRuns, showCompletedRuns, selectedId]);

  /** Single active pack for Focus, List, and Archive — driven by selectedId. */
  const active = useMemo(() => {
    if (!packs.length) return null;
    return packs.find((p) => p.id === selectedId) ?? activeRuns[0] ?? null;
  }, [packs, selectedId, activeRuns]);

  const otherReadyPack = useMemo(() => {
    if (!active) return activeRuns[0] ?? null;
    return activeRuns.find((p) => p.id !== active.id) ?? null;
  }, [activeRuns, active]);

  const mvpIds = useMemo(() => new Set(active ? resolveMvpIds(active) : []), [active]);

  const remaining = useMemo(() => {
    if (!active) return [];
    return filterDrafts(active.drafts, filter, mvpIds);
  }, [active, filter, mvpIds]);

  const allReady = useMemo(
    () => (active ? active.drafts.filter((d) => d.status === 'ready') : []),
    [active]
  );

  const doneCount = useMemo(() => {
    if (!active) return 0;
    return active.drafts.filter((d) => d.status === 'posted' || d.status === 'skipped').length;
  }, [active]);

  /** One progress step per draft, in the order the drafts are done. */
  const steps = useMemo(() => {
    if (!active) return [];
    const ordered = sortDraftsForExecution(active.drafts);
    const totals = { Reply: 0, Original: 0, Quote: 0 };
    const seen = { Reply: 0, Original: 0, Quote: 0 };
    const labelOf = (d: XDraftItem) => kindLabel(d.kind) as keyof typeof totals;
    ordered.forEach((d) => {
      totals[labelOf(d)] += 1;
    });
    return ordered.map((d) => {
      const group = labelOf(d);
      seen[group] += 1;
      return {
        id: d.id,
        name: totals[group] > 1 ? `${group} ${seen[group]}` : group,
        state: d.status === 'ready' ? ('open' as const) : d.status,
      };
    });
  }, [active]);

  const totalCount = active?.drafts.length ?? 0;
  const etaSeconds = sumEstimatedSeconds(remaining);
  const current = remaining[0] ?? null;

  const onStatus = useCallback(
    async (draftId: string, status: XDraftStatus) => {
      if (!active) return;
      const packId = active.id;
      statusInflightRef.current += 1;
      // Optimistic update — UI feels instant; rollback on failure
      let snapshot: XContentPack[] | null = null;
      setPacks((prev) => {
        snapshot = prev;
        const next = prev.map((p) => {
          if (p.id !== packId) return p;
          return {
            ...p,
            drafts: (p.drafts || []).map((d) => (d.id === draftId ? { ...d, status } : d)),
            updatedAt: new Date().toISOString(),
          };
        });
        return sortPacks(next);
      });
      try {
        const res = await fetch('/api/x-content', {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ packId, draftId, status }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          if (snapshot) setPacks(snapshot);
          alert(data.error || 'Update failed');
          return;
        }
        const updated = sanitizePack(data as XContentPack) ?? (data as XContentPack);
        setPacks((prev) => {
          const next = sortPacks(prev.map((p) => (p.id === updated.id ? updated : p)));
          // Only jump after server confirms (not on optimistic-only empty)
          if (readyCount(updated) === 0) {
            const best = pickBestPackId(next.filter((p) => readyCount(p) > 0));
            if (best && best !== updated.id) {
              userPickedRef.current = null;
              queueMicrotask(() => setSelectedId(best));
            }
          }
          return next;
        });
      } catch {
        if (snapshot) setPacks(snapshot);
        alert('Update failed — check your connection and try again.');
      } finally {
        statusInflightRef.current = Math.max(0, statusInflightRef.current - 1);
      }
    },
    [active]
  );
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable) return;
      if (view === 'library') return;
      const d = current;
      if (!d) return;
      const k = e.key.toLowerCase();
      if (k === 'c') {
        e.preventDefault();
        void navigator.clipboard.writeText(d.body);
        window.open(draftOpenUrl(d), '_blank', 'noopener,noreferrer');
      } else if (k === 'd') {
        e.preventDefault();
        void onStatus(d.id, 'posted');
      } else if (k === 's') {
        e.preventDefault();
        void onStatus(d.id, 'skipped');
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [view, current, onStatus]);

  const onImported = (saved: XContentPack) => {
    setPacks((prev) => sortPacks([saved, ...prev.filter((p) => p.id !== saved.id)]));
    userPickedRef.current = null;
    setSelectedId(saved.id);
    setView('focus');
    setFilter('all');
  };

  const sessions = active?.sessions?.length ? active.sessions : DEFAULT_SESSIONS;

  if (loading) {
    return (
      <div className="atelier-empty xq" aria-busy="true" aria-label="Loading queue">
        <Loader2 className="w-5 h-5 xq-spin" aria-hidden="true" />
        <p>Loading queue…</p>
      </div>
    );
  }

  if (error && !active) {
    return (
      <div className="xq">
        <section className="atelier-section">
          <div className="xq-failure">
            <div className="atelier-notice" data-tone="warn" role="alert">
              <div>
                <strong>Could not load queue.</strong> {error}
              </div>
            </div>
            <button type="button" onClick={() => void load()} className="atelier-btn atelier-btn-primary">
              <RefreshCw className="w-4 h-4" aria-hidden="true" /> Retry
            </button>
          </div>
        </section>
        <ImportPanel open onToggle={() => {}} onImported={onImported} />
      </div>
    );
  }

  const activeSitting = active ? sittingOf(active) : null;
  const activeDate = active ? formatPackDate(active.date) : null;
  const isQueueClear = !active || (activeRuns.length === 0 && !showCompletedRuns && isPackCleared(active));
  const showRemainingButton = filter !== 'all' && allReady.length > 0;
  const showOtherPackButton = otherReadyPack != null;
  const packTitle = active ? active.title.replace(/^t\d{2}\s*[·:\-–—]\s*/i, '').trim() || active.title : '';

  return (
    <MotionConfig reducedMotion="user">
      <div className="xq">
        <section className="atelier-section" aria-labelledby="xq-pack-heading">
          {/* Scout runs: which sitting is on screen */}
          {packs.length > 0 && (
            <div className="xq-runs">
              <p className="atelier-meta">
                <span>Scout runs</span>
                <span>
                  <span className="xq-num">{activeRuns.length}</span> open
                </span>
                {completedRuns.length > 0 && (
                  <span>
                    <span className="xq-num">{completedRuns.length}</span> done
                  </span>
                )}
              </p>
              <div className="xq-runs-row">
                <div className="atelier-tabs" role="group" aria-label="Scout runs">
                  {pickerPacks.map((p) => {
                    const ready = readyCount(p);
                    const cleared = isPackCleared(p);
                    const runDate = formatPackDate(p.date);
                    return (
                      <button
                        key={p.id}
                        type="button"
                        className="atelier-tab"
                        aria-pressed={p.id === active?.id}
                        title={`${p.title} · ${packSubtitle(p)}`}
                        onClick={() => selectPack(p.id)}
                      >
                        {sittingOf(p).short}
                        {runDate ? `, ${runDate.short}` : ''}
                        <span className="atelier-tab-count">{cleared ? 'done' : `${ready} left`}</span>
                      </button>
                    );
                  })}
                </div>
                <div className="xq-runs-links">
                  {completedRuns.length > 0 && (
                    <button type="button" className="atelier-link" onClick={() => setShowCompletedRuns((v) => !v)}>
                      {showCompletedRuns ? 'Hide completed' : 'Show completed'}
                    </button>
                  )}
                  <button type="button" className="atelier-link" onClick={() => void load({ forceLatest: true })}>
                    Jump to latest
                  </button>
                </div>
              </div>
              {activeRuns.length === 0 && !showCompletedRuns && (
                <p className="xq-runs-note">
                  All open runs are cleared. Completed packs stay in the cloud but stay out of your way.
                  {completedRuns.length > 0
                    ? ' Use “Show completed” only if you need to restore a draft.'
                    : ' Wait for the next 1h scout (11:00–22:00 IST).'}
                </p>
              )}
            </div>
          )}

          {/* The pack */}
          <div className="atelier-section-head">
            <h2 id="xq-pack-heading">
              {active && activeSitting ? (
                <>
                  {activeSitting.name}.{activeDate ? <> <em>{activeDate.long}</em></> : null}
                </>
              ) : activeRuns.length === 0 ? (
                'No open runs'
              ) : (
                'Waiting for pack'
              )}
            </h2>
            <div className="xq-tools">
              <span className="atelier-status" data-tone={live ? 'live' : 'draft'}>
                {live ? 'Live' : 'Paused'}
              </span>
              {pulse && (
                <span className="atelier-status" data-tone="live" role="status">
                  Updated
                </span>
              )}
              {lastSync && <span className="atelier-mono">synced {lastSync.toLocaleTimeString()}</span>}
              <button
                type="button"
                onClick={() => setLive((v) => !v)}
                className="atelier-icon-btn"
                aria-pressed={live}
                aria-label={live ? 'Pause live updates' : 'Resume live updates'}
                title={live ? 'Pause live updates' : 'Resume live updates'}
              >
                <Radio className="w-4 h-4" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => void load({ forceLatest: true })}
                className="atelier-icon-btn"
                aria-label="Refresh and open latest ready pack"
                title="Refresh & open latest ready pack"
              >
                <RefreshCw className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>
          </div>

          {active && (
            <>
              <p className="xq-pack-title">{packTitle}</p>
              <p className="atelier-meta">
                <span className="atelier-mono">{active.id}</span>
                <span>
                  <span className="xq-num">{remaining.length}</span> in view
                </span>
                <span>
                  <span className="xq-num">{allReady.length}</span> ready
                </span>
                <span>
                  <span className="xq-num">{formatDuration(etaSeconds)}</span>
                </span>
                <span>
                  <span className="xq-num">
                    {doneCount}/{totalCount}
                  </span>{' '}
                  cleared
                </span>
              </p>
              {totalCount > 0 && (
                <div className="xq-progress">
                  <ol className="xq-steps" aria-label="Pack progress">
                    {steps.map((step) => (
                      <li key={step.id} data-state={step.state}>
                        {step.name}
                        <span className="sr-only">
                          {step.state === 'posted' ? ' (posted)' : step.state === 'skipped' ? ' (skipped)' : ' (open)'}
                        </span>
                      </li>
                    ))}
                  </ol>
                  <span className="atelier-mono">
                    {doneCount} of {totalCount} done
                  </span>
                </div>
              )}
            </>
          )}

          {/* View and filters */}
          <div className="xq-controls">
            <div className="atelier-tabs" role="group" aria-label="View">
              {VIEWS.map((v) => (
                <button
                  key={v.id}
                  type="button"
                  className="atelier-tab"
                  aria-pressed={view === v.id}
                  onClick={() => setView(v.id)}
                >
                  {v.label}
                  {v.id === 'list' && active && <span className="atelier-tab-count">{remaining.length}</span>}
                  {v.id === 'library' && active && <span className="atelier-tab-count">{totalCount}</span>}
                </button>
              ))}
            </div>
            {view !== 'library' && active && readyCount(active) > 0 && (
              <div className="xq-filters" role="group" aria-label="Filter drafts">
                {FILTERS.map((f) => {
                  const count = filterDrafts(active.drafts, f.id, mvpIds).length;
                  return (
                    <button
                      key={f.id}
                      type="button"
                      className="atelier-chip"
                      aria-pressed={filter === f.id}
                      onClick={() => setFilter(f.id)}
                    >
                      {f.label}
                      <span className="atelier-mono">{count}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Main stage */}
          {isQueueClear ? (
            <div className="atelier-empty">
              <h3 className="atelier-h2">{packs.length === 0 ? 'No scout runs yet' : 'Queue is clear'}</h3>
              <p>
                {packs.length === 0
                  ? 'When Grok’s 4-hour scout loop runs on your laptop, new runs appear here. Pick any one to work.'
                  : 'Finished and skipped runs are hidden so you only see open work. Next scout adds a new card without overwriting older ones.'}
              </p>
              {completedRuns.length > 0 && (
                <button
                  type="button"
                  onClick={() => setShowCompletedRuns(true)}
                  className="atelier-btn atelier-btn-primary"
                >
                  Show {completedRuns.length} completed run{completedRuns.length === 1 ? '' : 's'}
                </button>
              )}
            </div>
          ) : view === 'library' && active ? (
            <>
              <p className="atelier-row-note xq-more">
                Archive of every draft in this pack (including done/skipped). Switch pack above to compare days.
              </p>
              <ul className="atelier-rows xq-rows">
                {sortDraftsForExecution(active.drafts).map((d) => (
                  <DraftRow key={d.id} draft={d} signals={active.signals} mode="archive" onStatus={onStatus} />
                ))}
              </ul>
            </>
          ) : remaining.length === 0 ? (
            <div className="atelier-empty">
              <h3 className="atelier-h2">
                {filter !== 'all' ? 'Filter clear' : totalCount > 0 ? 'All tasks done for this pack' : 'Queue clear'}
              </h3>
              <p>
                {filter !== 'all'
                  ? 'Nothing left in this filter — try “All” or another session.'
                  : totalCount > 0
                    ? `Pack “${active?.title}” is loaded (${doneCount}/${totalCount} cleared).`
                    : 'New tasks appear after the next scout run.'}
              </p>
              <div className="xq-empty-actions">
                {showRemainingButton && (
                  <button type="button" onClick={() => setFilter('all')} className="atelier-btn atelier-btn-primary">
                    Show {allReady.length} remaining
                  </button>
                )}
                {otherReadyPack && (
                  <button
                    type="button"
                    onClick={() => selectPack(otherReadyPack.id)}
                    className={`atelier-btn ${showRemainingButton ? 'atelier-btn-line' : 'atelier-btn-primary'}`}
                  >
                    Open pack with {readyCount(otherReadyPack)} ready
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => void load({ forceLatest: true })}
                  className={`atelier-btn ${showRemainingButton || showOtherPackButton ? 'atelier-btn-line' : 'atelier-btn-primary'}`}
                >
                  <RefreshCw className="w-4 h-4" aria-hidden="true" /> Refresh latest
                </button>
              </div>
            </div>
          ) : (
            <>
              <p className="atelier-meta xq-keys">
                {view === 'focus' && (
                  <span>
                    Up next, <span className="xq-num">{remaining.length}</span> left
                  </span>
                )}
                <span>
                  <kbd>C</kbd> copy &amp; open
                </span>
                <span>
                  <kbd>D</kbd> posted
                </span>
                <span>
                  <kbd>S</kbd> skip
                </span>
              </p>
              <ul className="atelier-rows xq-rows">
                {view === 'focus' ? (
                  <AnimatePresence mode="wait">
                    {current && (
                      <DraftRow
                        key={current.id}
                        draft={current}
                        signals={active?.signals}
                        mode="primary"
                        large
                        onStatus={onStatus}
                      />
                    )}
                  </AnimatePresence>
                ) : (
                  <AnimatePresence>
                    {remaining.map((d, i) => (
                      <DraftRow
                        key={d.id}
                        draft={d}
                        signals={active?.signals}
                        mode={i === 0 ? 'primary' : 'next'}
                        position={{ index: i, total: remaining.length }}
                        onStatus={onStatus}
                      />
                    ))}
                  </AnimatePresence>
                )}
              </ul>
            </>
          )}
        </section>

        {/* Session budgets: collapsed by default */}
        {view !== 'library' && active && (
          <section className="atelier-section xq-minor">
            <button
              type="button"
              onClick={() => setShowMore((v) => !v)}
              className="atelier-link xq-disclosure"
              aria-expanded={showMore}
            >
              <ChevronDown
                className="w-3.5 h-3.5"
                aria-hidden="true"
                style={{ transform: showMore ? 'rotate(180deg)' : undefined }}
              />
              Session budgets &amp; theme
            </button>
            <AnimatePresence initial={false}>
              {showMore && (
                <motion.div
                  className="xq-disclosure-body"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  {active.theme && <p className="xq-theme">{active.theme}</p>}
                  {active.briefing && <p className="xq-briefing">{active.briefing}</p>}
                  <ul className="xq-sessions">
                    {sessions.map((s) => {
                      const inSession = allReady.filter((d) => d.session === (s.id as XSessionId));
                      const sec = sumEstimatedSeconds(inSession);
                      return (
                        <li key={s.id}>
                          <button
                            type="button"
                            className="xq-session"
                            aria-pressed={filter === s.id}
                            onClick={() => setFilter(s.id as FilterId)}
                          >
                            <span className="xq-session-name">{s.title}</span>
                            <span className="atelier-mono">
                              {inSession.length} left · {formatDuration(sec)} / {s.maxMinutes}m
                            </span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </motion.div>
              )}
            </AnimatePresence>
          </section>
        )}

        {active && active.signals.length > 0 && view !== 'library' && (
          <section className="atelier-section xq-minor">
            <details>
              <summary className="atelier-link xq-disclosure">
                <ChevronDown className="w-3.5 h-3.5" aria-hidden="true" />
                Context <span className="atelier-mono">({active.signals.length})</span>
              </summary>
              <ul className="xq-signals">
                {active.signals.map((s) => (
                  <li key={s.id}>
                    {s.summary}
                    {s.whyItMatters ? <span>{s.whyItMatters}</span> : null}
                  </li>
                ))}
              </ul>
            </details>
          </section>
        )}

        <ImportPanel open={importOpen} onToggle={() => setImportOpen((v) => !v)} onImported={onImported} />
      </div>
    </MotionConfig>
  );
}
