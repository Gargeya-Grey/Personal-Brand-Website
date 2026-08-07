'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import * as motion from 'motion/react-client';
import { AnimatePresence } from 'motion/react';
import {
  Check,
  Copy,
  ExternalLink,
  Loader2,
  MessageSquare,
  Newspaper,
  Quote,
  RefreshCw,
  SkipForward,
  Sparkles,
  Clock,
  CheckCircle2,
  AlertCircle,
  Layers,
  Upload,
  ChevronDown,
  ChevronUp,
  FileJson,
  ListTodo,
  Radio,
  PartyPopper,
  Focus,
  Target,
  Timer,
  Keyboard,
} from 'lucide-react';
import {
  type XContentPack,
  type XDraftItem,
  type XDraftKind,
  type XDraftStatus,
  type XSessionId,
  formatDuration,
  formatPackRunLabel,
  resolveMvpIds,
  sanitizePack,
  sortDraftsForExecution,
  sumEstimatedSeconds,
  DEFAULT_SESSIONS,
  isXDraftKind,
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

const KIND_META: Record<
  XDraftKind,
  { label: string; chip: string; icon: typeof Sparkles; verb: string }
> = {
  reply: {
    label: 'Reply',
    chip: '!border-emerald-500/25 !bg-emerald-500/10 !text-emerald-800 dark:!text-emerald-200',
    icon: MessageSquare,
    verb: 'Reply',
  },
  flagship: {
    label: 'Flagship',
    chip: '!border-violet-500/25 !bg-violet-500/10 !text-violet-800 dark:!text-violet-200',
    icon: Layers,
    verb: 'Post thread',
  },
  short: {
    label: 'Short',
    chip: '!border-sky-500/25 !bg-sky-500/10 !text-sky-800 dark:!text-sky-200',
    icon: Newspaper,
    verb: 'Post',
  },
  quote: {
    label: 'Quote',
    chip: '!border-amber-500/25 !bg-amber-500/10 !text-amber-800 dark:!text-amber-200',
    icon: Quote,
    verb: 'Quote',
  },
};

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

function kindMeta(kind: XDraftKind | string | undefined) {
  if (kind && isXDraftKind(kind) && KIND_META[kind]) return KIND_META[kind];
  return KIND_META.short;
}

function charHint(text: string | undefined | null) {
  const count = typeof text === 'string' ? text.length : String(text ?? '').length;
  if (count <= 280) return { count, tone: 'text-emerald-600 dark:text-emerald-400' };
  if (count <= 4000) return { count, tone: 'text-[var(--atelier-faint)]' };
  return { count, tone: 'text-amber-600 dark:text-amber-400' };
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

function ActionRow({
  draft,
  busy,
  copied,
  large,
  onCopyOpen,
  onDone,
  onSkip,
}: {
  draft: XDraftItem;
  busy: boolean;
  copied: boolean;
  large?: boolean;
  onCopyOpen: () => void;
  onDone: () => void;
  onSkip: () => void;
}) {
  const h = large ? 'h-12 sm:h-14 text-sm sm:text-base px-5 sm:px-6' : 'h-11 text-sm px-4';
  return (
    <div className="flex flex-wrap gap-3">
      <button
        type="button"
        onClick={onCopyOpen}
        className={`atelier-btn ${copied ? 'atelier-btn-gold' : 'atelier-btn-primary'} ${h}`}
      >
        {copied ? (
          <>
            <Check className="w-4 h-4" /> Copied
          </>
        ) : (
          <>
            <Copy className="w-4 h-4" /> Copy & open X
          </>
        )}
      </button>
      <button
        type="button"
        disabled={busy}
        onClick={onDone}
        className={`atelier-btn atelier-btn-gold ${h} disabled:opacity-40`}
      >
        {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
        Done
      </button>
      <button
        type="button"
        disabled={busy}
        onClick={onSkip}
        className={`atelier-btn atelier-btn-ghost ${h} disabled:opacity-40`}
      >
        <SkipForward className="w-4 h-4" /> Skip
      </button>
      {(() => {
        const sourceUrl = extractDraftSourceUrl(draft.meta);
        if (!sourceUrl) return null;
        return (
          <a
            href={sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`atelier-btn atelier-btn-ghost ${h}`}
          >
            Source <ExternalLink className="w-3.5 h-3.5" />
          </a>
        );
      })()}
    </div>
  );
}

function FocusCard({
  draft,
  remainingCount,
  etaSeconds,
  onStatus,
}: {
  draft: XDraftItem;
  remainingCount: number;
  etaSeconds: number;
  onStatus: (id: string, s: XDraftStatus) => Promise<void>;
}) {
  const meta = kindMeta(draft.kind);
  const Icon = meta.icon;
  const chars = charHint(draft.body);
  const { copied, busy, copyOpen, done, skip } = useDraftActions(draft, onStatus);

  return (
    <motion.article
      key={draft.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="atelier-card-lg px-6 py-8 sm:px-10 sm:py-12 md:px-14 md:py-14 space-y-8 sm:space-y-10"
    >
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6">
        <div className="space-y-4 max-w-2xl">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[0.7rem] font-bold uppercase tracking-[0.22em] text-[var(--atelier-gold)]">
              Up next · {remainingCount} left
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className={`atelier-chip !py-1.5 !px-3 ${meta.chip}`}>
              <Icon className="w-3.5 h-3.5" /> {meta.label}
            </span>
            <span className="atelier-chip !py-1.5 !px-3">P{draft.priority}</span>
            <span className="atelier-chip !py-1.5 !px-3">
              <Timer className="w-3 h-3" /> {formatDuration(draft.estimatedSeconds)}
            </span>
          </div>
          <h2 className="font-headline text-3xl sm:text-4xl md:text-[2.75rem] font-extrabold tracking-[-0.03em] text-[var(--atelier-ink)] leading-[1.1]">
            {draft.label}
          </h2>
          {draft.why && (
            <p className="text-base sm:text-lg text-[var(--atelier-muted)] leading-relaxed flex gap-3 max-w-xl">
              <Target className="w-5 h-5 text-[var(--atelier-gold)] shrink-0 mt-0.5" />
              <span>{draft.why}</span>
            </p>
          )}
        </div>
        <div className="sm:text-right space-y-1 shrink-0 pt-1">
          <p className={`text-sm font-mono font-medium ${chars.tone}`}>{chars.count} chars</p>
          <p className="text-xs text-[var(--atelier-faint)]">
            ~{formatDuration(etaSeconds)} in this filter
          </p>
        </div>
      </div>

      <pre className="whitespace-pre-wrap font-sans text-lg sm:text-xl leading-[1.75] text-[var(--atelier-ink)] bg-[var(--atelier-paper)]/60 border border-[var(--atelier-line)] rounded-[1.75rem] sm:rounded-[2rem] px-6 py-6 sm:px-10 sm:py-9 selection:bg-[var(--atelier-gold-soft)] max-h-[min(50vh,28rem)] overflow-y-auto">
        {draft.body}
      </pre>

      {draft.tip && (
        <p className="text-sm text-[var(--atelier-muted)] pl-4 border-l-2 border-[var(--atelier-gold)]/35 leading-relaxed max-w-2xl">
          {draft.tip}
        </p>
      )}

      <div className="space-y-4 pt-1">
        <ActionRow
          draft={draft}
          busy={busy}
          copied={copied}
          large
          onCopyOpen={() => void copyOpen()}
          onDone={() => void done()}
          onSkip={() => void skip()}
        />
        <p className="text-xs text-[var(--atelier-faint)] flex items-center gap-2">
          <Keyboard className="w-3.5 h-3.5" />
          <span>
            <kbd className="font-mono text-[var(--atelier-muted)]">C</kbd> copy ·{' '}
            <kbd className="font-mono text-[var(--atelier-muted)]">D</kbd> done ·{' '}
            <kbd className="font-mono text-[var(--atelier-muted)]">S</kbd> skip
          </span>
        </p>
      </div>
    </motion.article>
  );
}

function ListCard({
  draft,
  index,
  total,
  onStatus,
}: {
  draft: XDraftItem;
  index: number;
  total: number;
  onStatus: (id: string, s: XDraftStatus) => Promise<void>;
}) {
  const meta = kindMeta(draft.kind);
  const Icon = meta.icon;
  const { copied, busy, copyOpen, done, skip } = useDraftActions(draft, onStatus);

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98 }}
      className="atelier-card px-6 py-6 sm:px-8 sm:py-7 space-y-5"
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-mono text-xs text-[var(--atelier-gold)] tabular-nums">
          {index + 1}/{total}
        </span>
        <span className={`atelier-chip ${meta.chip}`}>
          <Icon className="w-3 h-3" /> {meta.label}
        </span>
        <span className="atelier-chip">P{draft.priority}</span>
        <span className="atelier-chip">{formatDuration(draft.estimatedSeconds)}</span>
      </div>
      <h3 className="font-headline text-xl sm:text-2xl font-bold text-[var(--atelier-ink)] tracking-tight">
        {draft.label}
      </h3>
      {draft.why && (
        <p className="text-sm text-[var(--atelier-muted)] leading-relaxed max-w-2xl">{draft.why}</p>
      )}
      <pre className="whitespace-pre-wrap text-base leading-relaxed text-[var(--atelier-ink)] bg-[var(--atelier-paper)]/50 border border-[var(--atelier-line)] rounded-[1.5rem] p-5 sm:p-6 max-h-56 overflow-y-auto">
        {draft.body}
      </pre>
      <ActionRow
        draft={draft}
        busy={busy}
        copied={copied}
        onCopyOpen={() => void copyOpen()}
        onDone={() => void done()}
        onSkip={() => void skip()}
      />
    </motion.article>
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
    <div className="atelier-card overflow-hidden">
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between gap-3 px-6 py-5 text-left"
      >
        <span className="flex items-center gap-2.5 text-sm text-[var(--atelier-faint)]">
          <Upload className="w-4 h-4" />
          Advanced import
        </span>
        {open ? (
          <ChevronUp className="w-4 h-4 text-[var(--atelier-faint)]" />
        ) : (
          <ChevronDown className="w-4 h-4 text-[var(--atelier-faint)]" />
        )}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-6 pb-6 space-y-4 border-t border-[var(--atelier-line)] pt-5">
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={5}
                placeholder="Paste pack JSON…"
                className="atelier-input !rounded-2xl font-mono text-xs min-h-[8rem]"
                spellCheck={false}
              />
              <button
                type="button"
                disabled={busy || !text.trim()}
                onClick={() => void run()}
                className="atelier-btn atelier-btn-ghost h-10 text-xs disabled:opacity-40"
              >
                {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileJson className="w-4 h-4" />}
                Save import
              </button>
              {message && <p className="text-xs text-emerald-600">{message}</p>}
              {err && <p className="text-xs text-red-500">{err}</p>}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
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

  const totalCount = active?.drafts.length ?? 0;
  const progress = totalCount ? Math.round((doneCount / totalCount) * 100) : 0;
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
      <div className="space-y-6 max-w-4xl mx-auto animate-pulse" aria-busy="true" aria-label="Loading queue">
        <div className="atelier-card px-6 py-6 sm:px-8 space-y-4">
          <div className="flex flex-wrap gap-2">
            <div className="h-6 w-16 rounded-full bg-[var(--atelier-line)]" />
            <div className="h-6 w-24 rounded-full bg-[var(--atelier-line)]" />
          </div>
          <div className="h-7 w-2/3 max-w-md rounded-xl bg-[var(--atelier-line)]" />
          <div className="h-1.5 w-48 rounded-full bg-[var(--atelier-line)]" />
        </div>
        <div className="atelier-card-lg p-8 sm:p-10 space-y-4">
          <div className="h-5 w-28 rounded-full bg-[var(--atelier-line)]" />
          <div className="h-24 w-full rounded-2xl bg-[var(--atelier-line)]" />
          <div className="flex gap-2">
            <div className="h-10 w-28 rounded-full bg-[var(--atelier-line)]" />
            <div className="h-10 w-24 rounded-full bg-[var(--atelier-line)]" />
          </div>
        </div>
        <p className="text-center text-sm text-[var(--atelier-faint)] flex items-center justify-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin text-[var(--atelier-gold)]" />
          Loading queue…
        </p>
      </div>
    );
  }

  if (error && !active) {
    return (
      <div className="space-y-8">
        <div className="atelier-card-lg py-20 px-10 flex flex-col items-center gap-5 text-center">
          <AlertCircle className="w-10 h-10 text-red-500" />
          <p className="font-headline font-bold text-xl">Could not load queue</p>
          <p className="text-sm text-[var(--atelier-muted)] max-w-md">{error}</p>
          <button type="button" onClick={() => void load()} className="atelier-btn atelier-btn-gold">
            <RefreshCw className="w-4 h-4" /> Retry
          </button>
        </div>
        <ImportPanel open onToggle={() => {}} onImported={onImported} />
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8 max-w-4xl mx-auto">
      {/* Slim status bar — not a second hero */}
      <div
        className={`atelier-card px-5 py-4 sm:px-7 sm:py-5 transition-shadow duration-500 ${
          pulse ? 'ring-2 ring-[var(--atelier-gold)]/40' : ''
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-5">
          <div className="min-w-0 space-y-2">
            <div className="flex flex-wrap items-center gap-2.5">
              <span
                className={`atelier-chip !py-1 !text-[0.65rem] ${
                  live
                    ? '!border-emerald-500/25 !bg-emerald-500/10 !text-emerald-800 dark:!text-emerald-200'
                    : ''
                }`}
              >
                <Radio className={`w-3 h-3 ${live ? 'animate-pulse' : ''}`} />
                {live ? 'Live' : 'Paused'}
              </span>
              {lastSync && (
                <span className="text-[0.65rem] text-[var(--atelier-faint)] font-mono">
                  synced {lastSync.toLocaleTimeString()}
                </span>
              )}
              {active?.id && (
                <span className="text-[0.65rem] text-[var(--atelier-faint)] font-mono truncate max-w-[12rem]">
                  {active.id}
                </span>
              )}
            </div>
            <p className="font-headline text-lg sm:text-xl font-bold text-[var(--atelier-ink)] tracking-tight">
              {active?.title ?? (activeRuns.length === 0 ? 'No open runs' : 'Waiting for pack')}
            </p>
            {active && (
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[var(--atelier-muted)]">
                <span className="inline-flex items-center gap-1.5">
                  <ListTodo className="w-3.5 h-3.5 text-[var(--atelier-gold)]" />
                  {remaining.length} in view · {allReady.length} ready
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[var(--atelier-gold)]" />
                  ~{formatDuration(etaSeconds)}
                </span>
                <span>
                  {doneCount}/{totalCount} cleared
                </span>
              </div>
            )}
            {active && totalCount > 0 && (
              <div className="h-1.5 rounded-full bg-[var(--atelier-paper)] border border-[var(--atelier-line)] overflow-hidden max-w-xs mt-1">
                <div
                  className="h-full rounded-full bg-[var(--atelier-gold)] transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <div className="flex p-1 rounded-full border border-[var(--atelier-line)] bg-[var(--atelier-paper)]/40">
              {(
                [
                  { id: 'focus' as const, icon: Focus, label: 'Focus' },
                  { id: 'list' as const, icon: ListTodo, label: 'List' },
                  { id: 'library' as const, icon: Newspaper, label: 'Archive' },
                ] as const
              ).map(({ id, icon: I, label }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setView(id)}
                  className={`px-3.5 py-2 rounded-full text-xs font-bold flex items-center gap-1.5 transition-colors ${
                    view === id
                      ? 'bg-[var(--atelier-ink)] text-[var(--atelier-card)]'
                      : 'text-[var(--atelier-faint)] hover:text-[var(--atelier-ink)]'
                  }`}
                >
                  <I className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{label}</span>
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setLive((v) => !v)}
              className="atelier-btn atelier-btn-ghost h-10 w-10 !px-0"
              title={live ? 'Pause live updates' : 'Resume live updates'}
            >
              <Radio className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => void load({ forceLatest: true })}
              className="atelier-btn atelier-btn-ghost h-10 w-10 !px-0"
              title="Refresh & open latest ready pack"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Premium run picker — each 1h IST scout is its own card; completed runs hidden by default */}
        {packs.length > 0 && (
          <div className="mt-6 pt-6 border-t border-[var(--atelier-line)] space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-[var(--atelier-faint)]">
                Scout runs
                <span className="ml-2 normal-case tracking-normal font-medium text-[var(--atelier-muted)]">
                  {activeRuns.length} open
                  {completedRuns.length > 0 ? ` · ${completedRuns.length} done` : ''}
                </span>
              </p>
              <div className="flex items-center gap-2">
                {completedRuns.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setShowCompletedRuns((v) => !v)}
                    className="text-[0.7rem] font-semibold text-[var(--atelier-faint)] hover:text-[var(--atelier-gold)] transition-colors"
                  >
                    {showCompletedRuns ? 'Hide completed' : 'Show completed'}
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => void load({ forceLatest: true })}
                  className="text-[0.7rem] font-semibold text-[var(--atelier-gold)] hover:opacity-80"
                >
                  Jump to latest
                </button>
              </div>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              {pickerPacks.map((p) => {
                const ready = readyCount(p);
                const total = p.drafts?.length ?? 0;
                const selected = p.id === active?.id;
                const cleared = isPackCleared(p);
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => selectPack(p.id)}
                    className={`text-left rounded-[1.25rem] border px-4 py-3.5 transition-all duration-200 ${
                      selected
                        ? 'border-[var(--atelier-gold)]/45 bg-[var(--atelier-gold-soft)]/35 shadow-[var(--atelier-shadow-sm)]'
                        : cleared
                          ? 'border-[var(--atelier-line)] bg-[var(--atelier-paper)]/30 opacity-70 hover:opacity-100'
                          : 'border-[var(--atelier-line)] bg-[var(--atelier-card)] hover:border-[var(--atelier-gold)]/30 hover:shadow-[var(--atelier-shadow-sm)]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p
                        className={`font-headline text-sm font-bold leading-snug line-clamp-2 ${
                          selected ? 'text-[var(--atelier-ink)]' : 'text-[var(--atelier-ink)]'
                        }`}
                      >
                        {p.title}
                      </p>
                      {selected && (
                        <span className="shrink-0 atelier-chip !py-0.5 !px-2 !text-[0.6rem] !border-[var(--atelier-gold)]/30 !bg-[var(--atelier-gold-soft)] !text-[var(--atelier-gold)]">
                          Active
                        </span>
                      )}
                    </div>
                    <p className="mt-1.5 text-[0.7rem] text-[var(--atelier-faint)] leading-relaxed">
                      {packSubtitle(p)}
                    </p>
                    <div className="mt-2.5 flex items-center gap-2">
                      <div className="flex-1 h-1 rounded-full bg-[var(--atelier-paper)] border border-[var(--atelier-line)] overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            cleared ? 'bg-[var(--atelier-faint)]' : 'bg-[var(--atelier-gold)]'
                          }`}
                          style={{
                            width: `${total ? Math.round(((total - ready) / total) * 100) : 0}%`,
                          }}
                        />
                      </div>
                      <span className="text-[0.65rem] font-mono text-[var(--atelier-faint)] tabular-nums">
                        {cleared ? 'done' : `${ready} left`}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
            {activeRuns.length === 0 && !showCompletedRuns && (
              <p className="text-sm text-[var(--atelier-muted)] leading-relaxed py-2">
                All open runs are cleared. Completed packs stay in the cloud but stay out of your way.
                {completedRuns.length > 0
                  ? ' Use “Show completed” only if you need to restore a draft.'
                  : ' Wait for the next 1h scout (11:00–22:00 IST).'}
              </p>
            )}
          </div>
        )}

        {/* Filters — one quiet row */}
        {view !== 'library' && active && readyCount(active) > 0 && (
          <div className="mt-6 pt-5 border-t border-[var(--atelier-line)] flex flex-wrap gap-2">
            {FILTERS.map((f) => {
              const count = filterDrafts(active.drafts, f.id, mvpIds).length;
              return (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setFilter(f.id)}
                  className={`px-3.5 py-2 rounded-full text-xs font-bold transition-colors ${
                    filter === f.id
                      ? 'bg-[var(--atelier-ink)] text-[var(--atelier-card)]'
                      : 'text-[var(--atelier-faint)] hover:text-[var(--atelier-ink)] hover:bg-[var(--atelier-paper)]'
                  }`}
                >
                  {f.label}
                  <span className="ml-1.5 tabular-nums opacity-60">{count}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Session budgets — collapsed by default */}
        {view !== 'library' && active && (
          <div className="mt-4">
            <button
              type="button"
              onClick={() => setShowMore((v) => !v)}
              className="text-xs font-bold text-[var(--atelier-faint)] hover:text-[var(--atelier-muted)] flex items-center gap-1.5"
            >
              {showMore ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              Session budgets & theme
            </button>
            <AnimatePresence>
              {showMore && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="pt-4 space-y-4">
                    {active.theme && (
                      <p className="text-sm text-[var(--atelier-gold)] font-semibold">{active.theme}</p>
                    )}
                    {active.briefing && (
                      <p className="text-sm text-[var(--atelier-muted)] leading-relaxed max-w-2xl">
                        {active.briefing}
                      </p>
                    )}
                    <div className="grid sm:grid-cols-3 gap-3">
                      {sessions.map((s) => {
                        const inSession = allReady.filter((d) => d.session === (s.id as XSessionId));
                        const sec = sumEstimatedSeconds(inSession);
                        return (
                          <button
                            key={s.id}
                            type="button"
                            onClick={() => setFilter(s.id as FilterId)}
                            className={`text-left rounded-2xl border px-4 py-3.5 transition-colors ${
                              filter === s.id
                                ? 'border-[var(--atelier-gold)]/35 bg-[var(--atelier-gold-soft)]/25'
                                : 'border-[var(--atelier-line)] hover:border-[var(--atelier-gold)]/20'
                            }`}
                          >
                            <p className="text-sm font-bold text-[var(--atelier-ink)]">{s.title}</p>
                            <p className="text-[0.7rem] text-[var(--atelier-faint)] mt-1">
                              {inSession.length} left · {formatDuration(sec)} / {s.maxMinutes}m
                            </p>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Main stage */}
      {!active || (activeRuns.length === 0 && !showCompletedRuns && isPackCleared(active)) ? (
        <div className="atelier-card-lg py-20 sm:py-24 px-8 sm:px-10 flex flex-col items-center gap-5 text-center">
          <Sparkles className="w-10 h-10 text-[var(--atelier-gold)]" />
          <p className="font-headline font-bold text-2xl text-[var(--atelier-ink)]">
            {packs.length === 0 ? 'No scout runs yet' : 'Queue is clear'}
          </p>
          <p className="text-sm text-[var(--atelier-muted)] max-w-md leading-relaxed">
            {packs.length === 0
              ? 'When Grok’s 12-hour scout loop runs on your laptop, new runs appear here as separate cards — pick any one to work.'
              : 'Finished and skipped runs are hidden so you only see open work. Next scout adds a new card without overwriting older ones.'}
          </p>
          {completedRuns.length > 0 && (
            <button
              type="button"
              onClick={() => setShowCompletedRuns(true)}
              className="atelier-btn atelier-btn-ghost text-xs"
            >
              Show {completedRuns.length} completed run{completedRuns.length === 1 ? '' : 's'}
            </button>
          )}
        </div>
      ) : view === 'library' ? (
        <div className="space-y-5">
          <p className="text-sm text-[var(--atelier-muted)]">
            Archive of every draft in this pack (including done/skipped). Switch pack above to compare days.
          </p>
          {sortDraftsForExecution(active.drafts).map((d) => (
            <div
              key={d.id}
              className={`atelier-card px-6 py-5 space-y-3 ${d.status !== 'ready' ? 'opacity-50' : ''}`}
            >
              <div className="flex flex-wrap gap-2 items-center text-xs">
                <span className={`atelier-chip ${kindMeta(d.kind).chip}`}>{d.kind}</span>
                <span className="font-headline font-bold text-base text-[var(--atelier-ink)]">
                  {d.label}
                </span>
                <span className="text-[var(--atelier-faint)]">{d.status}</span>
              </div>
              <pre className="whitespace-pre-wrap text-sm text-[var(--atelier-muted)] max-h-40 overflow-y-auto leading-relaxed">
                {d.body}
              </pre>
              {d.status === 'ready' ? (
                <button
                  type="button"
                  onClick={() => void onStatus(d.id, 'posted')}
                  className="atelier-btn atelier-btn-ghost h-9 text-xs"
                >
                  Mark done
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => void onStatus(d.id, 'ready')}
                  className="atelier-btn atelier-btn-ghost h-9 text-xs"
                >
                  Restore
                </button>
              )}
            </div>
          ))}
        </div>
      ) : remaining.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="atelier-card-lg py-24 px-10 flex flex-col items-center gap-5 text-center"
        >
          <PartyPopper className="w-12 h-12 text-[var(--atelier-gold)]" />
          <p className="font-headline font-bold text-2xl sm:text-3xl text-[var(--atelier-ink)]">
            {filter !== 'all'
              ? 'Filter clear'
              : totalCount > 0
                ? 'All tasks done for this pack'
                : 'Queue clear'}
          </p>
          <p className="text-sm text-[var(--atelier-muted)] max-w-sm leading-relaxed">
            {filter !== 'all'
              ? 'Nothing left in this filter — try “All” or another session.'
              : totalCount > 0
                ? `Pack “${active?.title}” is loaded (${doneCount}/${totalCount} cleared).`
                : 'New tasks appear after the next scout run.'}
          </p>
          <div className="flex flex-wrap justify-center gap-2 pt-2">
            {filter !== 'all' && allReady.length > 0 && (
              <button type="button" onClick={() => setFilter('all')} className="atelier-btn atelier-btn-gold">
                Show {allReady.length} remaining
              </button>
            )}
            {otherReadyPack && (
              <button
                type="button"
                onClick={() => selectPack(otherReadyPack.id)}
                className="atelier-btn atelier-btn-gold"
              >
                Open pack with {readyCount(otherReadyPack)} ready
              </button>
            )}
            <button
              type="button"
              onClick={() => void load({ forceLatest: true })}
              className="atelier-btn atelier-btn-ghost"
            >
              <RefreshCw className="w-4 h-4" /> Refresh latest
            </button>
          </div>
        </motion.div>
      ) : view === 'focus' ? (
        <AnimatePresence mode="wait">
          {current && (
            <FocusCard
              key={current.id}
              draft={current}
              remainingCount={remaining.length}
              etaSeconds={etaSeconds}
              onStatus={onStatus}
            />
          )}
        </AnimatePresence>
      ) : (
        <div className="space-y-5">
          <AnimatePresence mode="popLayout">
            {remaining.map((d, i) => (
              <ListCard key={d.id} draft={d} index={i} total={remaining.length} onStatus={onStatus} />
            ))}
          </AnimatePresence>
        </div>
      )}

      {active && active.signals.length > 0 && view !== 'library' && (
        <details className="atelier-card px-6 py-5 group">
          <summary className="cursor-pointer font-headline font-bold text-sm text-[var(--atelier-muted)] list-none flex items-center gap-2 hover:text-[var(--atelier-ink)]">
            <Newspaper className="w-4 h-4 text-[var(--atelier-gold)]" />
            Context ({active.signals.length})
          </summary>
          <ul className="mt-5 space-y-4 text-sm text-[var(--atelier-muted)] leading-relaxed">
            {active.signals.map((s) => (
              <li key={s.id} className="pl-3 border-l border-[var(--atelier-line)]">
                <span className="text-[var(--atelier-ink)] font-medium">{s.summary}</span>
                {s.whyItMatters ? (
                  <span className="block mt-1 text-[var(--atelier-faint)]">{s.whyItMatters}</span>
                ) : null}
              </li>
            ))}
          </ul>
        </details>
      )}

      <ImportPanel open={importOpen} onToggle={() => setImportOpen((v) => !v)} onImported={onImported} />
    </div>
  );
}
