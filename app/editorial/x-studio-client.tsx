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
  resolveMvpIds,
  sortDraftsForExecution,
  sumEstimatedSeconds,
  DEFAULT_SESSIONS,
} from '@/lib/x-content-model';

const POLL_MS = 20_000;

type ViewMode = 'focus' | 'list' | 'library';
type FilterId = 'all' | 'mvp' | 'sprint' | 'core' | 'bonus' | 'replies' | 'originals' | 'p1';

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
  { id: 'mvp', label: 'MVP' },
  { id: 'sprint', label: 'Sprint' },
  { id: 'core', label: 'Core' },
  { id: 'bonus', label: 'Bonus' },
  { id: 'replies', label: 'Replies' },
  { id: 'originals', label: 'Originals' },
  { id: 'p1', label: 'P1–2' },
  { id: 'all', label: 'All' },
];

function charHint(text: string) {
  const count = text.length;
  if (count <= 280) return { count, tone: 'text-emerald-600 dark:text-emerald-400' };
  if (count <= 4000) return { count, tone: 'text-[var(--atelier-faint)]' };
  return { count, tone: 'text-amber-600 dark:text-amber-400' };
}

function filterDrafts(drafts: XDraftItem[], filter: FilterId, mvpIds: Set<string>): XDraftItem[] {
  let list = drafts.filter((d) => d.status === 'ready');
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
    if (draft.meta?.startsWith('http')) {
      window.open(draft.meta, '_blank', 'noopener,noreferrer');
    } else {
      window.open('https://x.com/compose/post', '_blank', 'noopener,noreferrer');
    }
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
      {draft.meta?.startsWith('http') && (
        <a
          href={draft.meta}
          target="_blank"
          rel="noopener noreferrer"
          className={`atelier-btn atelier-btn-ghost ${h}`}
        >
          Source <ExternalLink className="w-3.5 h-3.5" />
        </a>
      )}
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
  const meta = KIND_META[draft.kind];
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
  const meta = KIND_META[draft.kind];
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
  const [filter, setFilter] = useState<FilterId>('mvp');
  const [importOpen, setImportOpen] = useState(false);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [live, setLive] = useState(true);
  const [pulse, setPulse] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const knownUpdated = useRef<string | null>(null);
  const focusDraftRef = useRef<XDraftItem | null>(null);
  const onStatusRef = useRef<(id: string, s: XDraftStatus) => Promise<void>>(async () => {});

  const applyPacks = useCallback((data: XContentPack[]) => {
    const sorted = [...data].sort((a, b) => b.date.localeCompare(a.date));
    setPacks(sorted);
    setSelectedId((prev) => {
      if (prev && sorted.some((p) => p.id === prev)) return prev;
      return sorted[0]?.id ?? null;
    });
    setLastSync(new Date());
    const latest = sorted[0];
    if (latest && knownUpdated.current && knownUpdated.current !== latest.updatedAt) {
      setPulse(true);
      setTimeout(() => setPulse(false), 2400);
    }
    if (latest) knownUpdated.current = latest.updatedAt;
  }, []);

  const load = useCallback(
    async (opts?: { silent?: boolean }) => {
      if (!opts?.silent) {
        setLoading(true);
        setError(null);
      }
      try {
        const res = await fetch('/api/x-content', {
          cache: 'no-store',
          credentials: 'include',
        });
        if (!res.ok) throw new Error((await res.json()).error || 'Failed to load');
        applyPacks((await res.json()) as XContentPack[]);
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
    void load();
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

  const focusPack = useMemo(() => {
    if (!packs.length) return null;
    const today = new Date().toISOString().slice(0, 10);
    return packs.find((p) => p.date === today) ?? packs[0];
  }, [packs]);

  const active = useMemo(() => {
    if (view === 'library') return packs.find((p) => p.id === selectedId) ?? focusPack;
    return focusPack ?? packs.find((p) => p.id === selectedId) ?? null;
  }, [view, packs, selectedId, focusPack]);

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
  focusDraftRef.current = current;

  const onStatus = useCallback(
    async (draftId: string, status: XDraftStatus) => {
      if (!active) return;
      try {
        const res = await fetch('/api/x-content', {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ packId: active.id, draftId, status }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          alert(data.error || 'Update failed');
          return;
        }
        const updated = data as XContentPack;
        setPacks((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
      } catch {
        alert('Update failed — check your connection and try again.');
      }
    },
    [active]
  );
  onStatusRef.current = onStatus;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable) return;
      if (view === 'library') return;
      const d = focusDraftRef.current;
      if (!d) return;
      const k = e.key.toLowerCase();
      if (k === 'c') {
        e.preventDefault();
        void navigator.clipboard.writeText(d.body);
        if (d.meta?.startsWith('http')) window.open(d.meta, '_blank', 'noopener,noreferrer');
        else window.open('https://x.com/compose/post', '_blank', 'noopener,noreferrer');
      } else if (k === 'd') {
        e.preventDefault();
        void onStatusRef.current(d.id, 'posted');
      } else if (k === 's') {
        e.preventDefault();
        void onStatusRef.current(d.id, 'skipped');
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [view]);

  const onImported = (saved: XContentPack) => {
    setPacks((prev) => {
      const rest = prev.filter((p) => p.id !== saved.id);
      return [saved, ...rest].sort((a, b) => b.date.localeCompare(a.date));
    });
    setSelectedId(saved.id);
    setView('focus');
    setFilter('mvp');
  };

  const sessions = active?.sessions?.length ? active.sessions : DEFAULT_SESSIONS;

  if (loading) {
    return (
      <div className="atelier-card-lg py-28 flex flex-col items-center gap-5 text-[var(--atelier-muted)]">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--atelier-gold)]" />
        <p className="text-sm">Loading queue…</p>
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
    <div className="space-y-8 sm:space-y-10 max-w-4xl mx-auto">
      {/* Slim status bar — not a second hero */}
      <div
        className={`atelier-card px-6 py-5 sm:px-8 sm:py-6 transition-shadow duration-500 ${
          pulse ? 'ring-2 ring-[var(--atelier-gold)]/40' : ''
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
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
                  {lastSync.toLocaleTimeString()}
                </span>
              )}
              {active?.date && (
                <span className="text-[0.65rem] text-[var(--atelier-faint)] font-mono">
                  {active.date}
                </span>
              )}
            </div>
            <p className="font-headline text-lg sm:text-xl font-bold text-[var(--atelier-ink)] tracking-tight truncate">
              {active?.title ?? 'Waiting for pack'}
            </p>
            {active && (
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[var(--atelier-muted)]">
                <span className="inline-flex items-center gap-1.5">
                  <ListTodo className="w-3.5 h-3.5 text-[var(--atelier-gold)]" />
                  {remaining.length} in view
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[var(--atelier-gold)]" />
                  ~{formatDuration(etaSeconds)}
                </span>
                <span>
                  {doneCount}/{totalCount} done
                </span>
              </div>
            )}
            {active && (
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
                  { id: 'library' as const, icon: Newspaper, label: 'All' },
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
              onClick={() => void load()}
              className="atelier-btn atelier-btn-ghost h-10 w-10 !px-0"
              title="Refresh"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Filters — one quiet row */}
        {view !== 'library' && active && (
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
      {!active ? (
        <div className="atelier-card-lg py-24 px-10 flex flex-col items-center gap-5 text-center">
          <Sparkles className="w-10 h-10 text-[var(--atelier-gold)]" />
          <p className="font-headline font-bold text-2xl text-[var(--atelier-ink)]">No pack yet</p>
          <p className="text-sm text-[var(--atelier-muted)] max-w-sm leading-relaxed">
            Daily scout fills this automatically when Grok is running.
          </p>
        </div>
      ) : view === 'library' ? (
        <div className="space-y-5">
          {packs.length > 1 && (
            <select
              value={active.id}
              onChange={(e) => setSelectedId(e.target.value)}
              className="atelier-input !rounded-full !py-2.5 !px-5 !w-auto text-sm"
            >
              {packs.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.date} — {p.title.slice(0, 48)}
                </option>
              ))}
            </select>
          )}
          {sortDraftsForExecution(active.drafts).map((d) => (
            <div
              key={d.id}
              className={`atelier-card px-6 py-5 space-y-3 ${d.status !== 'ready' ? 'opacity-50' : ''}`}
            >
              <div className="flex flex-wrap gap-2 items-center text-xs">
                <span className={`atelier-chip ${KIND_META[d.kind].chip}`}>{d.kind}</span>
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
            {filter === 'all' || filter === 'mvp' ? 'Queue clear' : 'Filter clear'}
          </p>
          <p className="text-sm text-[var(--atelier-muted)] max-w-sm leading-relaxed">
            {filter !== 'all'
              ? 'Nothing left here — switch filter or stop and protect your time.'
              : 'New tasks appear after the next scout run.'}
          </p>
          {filter !== 'all' && allReady.length > 0 && (
            <button type="button" onClick={() => setFilter('all')} className="atelier-btn atelier-btn-gold mt-2">
              Show {allReady.length} remaining
            </button>
          )}
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
