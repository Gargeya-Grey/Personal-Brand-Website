'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Activity,
  AlertTriangle,
  BarChart3,
  ChevronDown,
  Crosshair,
  Filter,
  Flame,
  Loader2,
  MessageSquare,
  RefreshCw,
  Link2,
  Sparkles,
  Target,
  TrendingUp,
  Zap,
} from 'lucide-react';

type Range = '7d' | '30d' | '90d' | 'all';
type TabId = 'overview' | 'replies' | 'timing' | 'posts' | 'analyst';
type ClassFilter = 'all' | 'reply' | 'original' | 'quote';

type PlaybookItem = {
  severity: 'critical' | 'high' | 'medium' | 'info';
  title: string;
  detail: string;
};

type SectionNote = {
  headline: string;
  howToRead: string;
  bullets: string[];
  action?: string;
};

type PostCard = {
  tweet_id: string;
  created_at: string;
  content_class: string;
  archetype?: string;
  like_count: number;
  reply_count: number;
  repost_count: number;
  impression_count: number | null;
  engagement_sum: number;
  engagement_rate: number | null;
  reach_score?: number;
  conversion_score?: number;
  hour_ist?: number;
  body_chars?: number;
  has_venn?: boolean;
  text_preview: string;
  linked_pack_id: string | null;
};

type ScatterPt = {
  tweet_id: string;
  x_impressions: number;
  y_engagement: number;
  er: number | null;
  content_class: string;
  archetype: string;
  hour_ist: number;
  text_preview: string;
  is_dead: boolean;
};

type SummaryResponse = {
  connection?: {
    connected: boolean;
    username: string | null;
    encryptionOk: boolean;
    supabaseOk: boolean;
  };
  config?: { xOAuthConfigured: boolean; encryptionConfigured: boolean };
  lastRefresh?: {
    started_at?: string;
    finished_at?: string;
    status?: string;
    posts_upserted?: number;
    error?: string;
  } | null;
  summary?: {
    range: string;
    principles: string[];
    kpis: {
      followersNow: number | null;
      followersDeltaLast: number | null;
      followersDelta7d: number | null;
      followersDelta30d: number | null;
      postsN: number;
      replyShare: number;
      originalShare: number;
      medianLikes: number | null;
      medianEngagementSum: number | null;
      medianEngagementRate: number | null;
      medianImpressions: number | null;
      p75Engagement: number | null;
      p90Engagement: number | null;
      deadRate: number;
      winnerRate: number;
      impressionCoverage: number;
      linkedToPackN: number;
      totalImpressions: number;
      totalEngagement: number;
      overallER: number | null;
    };
    contentClasses: {
      content_class: string;
      n: number;
      median_likes: number | null;
      median_engagement_sum: number | null;
      median_impressions: number | null;
      median_engagement_rate: number | null;
      dead_rate: number;
      share: number;
      reliable: boolean;
    }[];
    replyArchetypes: {
      archetype: string;
      n: number;
      median_engagement_sum: number | null;
      median_impressions: number | null;
      median_engagement_rate: number | null;
      dead_rate: number;
      reliable: boolean;
    }[];
    hours: {
      hour: number;
      n: number;
      median_engagement_sum: number | null;
      median_impressions: number | null;
      median_engagement_rate: number | null;
      total_impressions: number;
      reliable: boolean;
    }[];
    days: {
      dow: number;
      label: string;
      n: number;
      median_engagement_sum: number | null;
      median_impressions: number | null;
      reliable: boolean;
    }[];
    heatmap: {
      hour: number;
      dow: number;
      n: number;
      median_engagement_sum: number | null;
      median_impressions: number | null;
      reliable: boolean;
    }[];
    lengths: {
      id: string;
      label: string;
      n: number;
      median_likes: number | null;
      median_engagement_sum: number | null;
      median_impressions: number | null;
      median_engagement_rate: number | null;
      dead_rate: number;
      reliable: boolean;
    }[];
    funnel: {
      n: number;
      with_impressions: number;
      with_any_engagement: number;
      with_reply_back: number;
      with_repost: number;
      imp_to_eng_rate: number | null;
      eng_to_reply_rate: number | null;
    };
    pareto: {
      top10_share_impressions: number | null;
      top10_share_engagement: number | null;
      top10_n: number;
    };
    leaderboards: {
      reach: PostCard[];
      conversion: PostCard[];
      bestReplies: PostCard[];
      worstReplies: PostCard[];
      bestOriginals: PostCard[];
    };
    scatter: ScatterPt[];
    playbook: PlaybookItem[];
    sectionNotes?: Record<string, SectionNote>;
    followerSeries: { t: string; followers: number }[];
  } | null;
  error?: string | null;
};

/** Collapsible plain-language diagnosis under every visualization */
function AnalysisDetails({
  note,
  defaultOpen = false,
  id,
}: {
  note?: SectionNote | null;
  defaultOpen?: boolean;
  id?: string;
}) {
  if (!note) return null;
  return (
    <details
      id={id}
      className="group mt-3 rounded-xl border border-[var(--atelier-line)] bg-[var(--atelier-paper)]/35 open:bg-[var(--atelier-paper)]/55"
      open={defaultOpen || undefined}
    >
      <summary className="cursor-pointer list-none flex items-center justify-between gap-2 px-3.5 py-2.5 text-xs font-bold text-[var(--atelier-ink)] select-none">
        <span className="inline-flex items-center gap-2 min-w-0">
          <MessageSquare className="w-3.5 h-3.5 text-[var(--atelier-gold)] shrink-0" />
          <span className="truncate">Read analysis · {note.headline}</span>
        </span>
        <ChevronDown className="w-4 h-4 text-[var(--atelier-faint)] shrink-0 transition-transform group-open:rotate-180" />
      </summary>
      <div className="px-3.5 pb-3.5 pt-0 space-y-3 border-t border-[var(--atelier-line)]/60">
        <div className="pt-3">
          <p className="text-[0.65rem] font-bold uppercase tracking-wider text-[var(--atelier-faint)] mb-1">
            How to read this
          </p>
          <p className="text-xs text-[var(--atelier-muted)] leading-relaxed">{note.howToRead}</p>
        </div>
        {note.bullets?.length ? (
          <div>
            <p className="text-[0.65rem] font-bold uppercase tracking-wider text-[var(--atelier-faint)] mb-1.5">
              Diagnosis from your data
            </p>
            <ul className="space-y-1.5">
              {note.bullets.map((b, i) => (
                <li
                  key={i}
                  className="text-xs text-[var(--atelier-ink)] leading-relaxed pl-3 border-l-2 border-[var(--atelier-gold)]/50"
                >
                  {b}
                </li>
              ))}
            </ul>
          </div>
        ) : null}
        {note.action ? (
          <div className="rounded-lg border border-[var(--atelier-gold)]/30 bg-[var(--atelier-gold-soft)]/30 px-3 py-2">
            <p className="text-[0.65rem] font-bold uppercase tracking-wider text-[var(--atelier-faint)] mb-0.5">
              What to do
            </p>
            <p className="text-xs font-medium text-[var(--atelier-ink)] leading-relaxed">
              {note.action}
            </p>
          </div>
        ) : null}
      </div>
    </details>
  );
}

function fmt(n: number | null | undefined, digits = 0) {
  if (n == null || !Number.isFinite(n)) return '—';
  return n.toLocaleString(undefined, {
    maximumFractionDigits: digits,
    minimumFractionDigits: digits,
  });
}

function fmtDelta(n: number | null | undefined) {
  if (n == null || !Number.isFinite(n)) return '—';
  return `${n > 0 ? '+' : ''}${n.toLocaleString()}`;
}

function pct(n: number | null | undefined, digits = 1) {
  if (n == null || !Number.isFinite(n)) return '—';
  return `${(n * 100).toFixed(digits)}%`;
}

function severityStyles(s: PlaybookItem['severity']) {
  switch (s) {
    case 'critical':
      return 'border-red-500/40 bg-red-500/10 text-red-900 dark:text-red-100';
    case 'high':
      return 'border-amber-500/40 bg-amber-500/10 text-amber-950 dark:text-amber-50';
    case 'medium':
      return 'border-[var(--atelier-gold)]/35 bg-[var(--atelier-gold-soft)]/40';
    default:
      return 'border-[var(--atelier-line)] bg-[var(--atelier-paper)]/40';
  }
}

function BarRow({
  label,
  value,
  max,
  hint,
  dimmed,
  accent,
}: {
  label: string;
  value: number;
  max: number;
  hint?: string;
  dimmed?: boolean;
  accent?: string;
}) {
  const w = max > 0 ? Math.max(2, Math.round((value / max) * 100)) : 0;
  return (
    <div className={`space-y-1 ${dimmed ? 'opacity-45' : ''}`}>
      <div className="flex justify-between gap-2 text-xs">
        <span className="font-medium text-[var(--atelier-ink)]">{label}</span>
        <span className="text-[var(--atelier-muted)] tabular-nums shrink-0">
          {hint ?? fmt(value, value < 10 && value % 1 ? 1 : 0)}
        </span>
      </div>
      <div className="h-2 rounded-full bg-[var(--atelier-line)]/60 overflow-hidden">
        <div
          className="h-full rounded-full transition-all"
          style={{
            width: `${w}%`,
            background: accent || 'var(--atelier-gold)',
            opacity: 0.85,
          }}
        />
      </div>
    </div>
  );
}

function FunnelStep({
  label,
  n,
  total,
  rate,
}: {
  label: string;
  n: number;
  total: number;
  rate?: number | null;
}) {
  const w = total > 0 ? Math.max(8, Math.round((n / total) * 100)) : 0;
  return (
    <div className="flex-1 min-w-[5rem] space-y-1.5">
      <div
        className="mx-auto rounded-lg bg-[var(--atelier-gold)]/75 flex items-end justify-center text-[0.65rem] font-bold text-[var(--atelier-ink)] pb-1"
        style={{ width: `${w}%`, minWidth: '2.5rem', height: '3.5rem' }}
      >
        {n}
      </div>
      <p className="text-center text-[0.65rem] font-semibold text-[var(--atelier-ink)]">{label}</p>
      {rate != null && (
        <p className="text-center text-[0.6rem] text-[var(--atelier-faint)]">{pct(rate, 0)} of prev</p>
      )}
    </div>
  );
}

function ScatterPlot({
  points,
  selectedId,
  onSelect,
}: {
  points: ScatterPt[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
}) {
  const W = 520;
  const H = 280;
  const pad = { l: 44, r: 12, t: 12, b: 36 };
  const xs = points.map((p) => p.x_impressions);
  const ys = points.map((p) => p.y_engagement);
  const maxX = Math.max(1, ...xs);
  const maxY = Math.max(1, ...ys);
  // log scale for impressions (heavy skew)
  const xScale = (v: number) =>
    pad.l + ((Math.log1p(v) / Math.log1p(maxX)) * (W - pad.l - pad.r));
  const yScale = (v: number) =>
    H - pad.b - (v / maxY) * (H - pad.t - pad.b);

  return (
    <div className="space-y-2">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full h-auto max-h-[320px] rounded-xl border border-[var(--atelier-line)] bg-[var(--atelier-paper)]/30"
        role="img"
        aria-label="Impressions vs engagement scatter"
      >
        {/* axes */}
        <line
          x1={pad.l}
          y1={H - pad.b}
          x2={W - pad.r}
          y2={H - pad.b}
          stroke="currentColor"
          className="text-[var(--atelier-line)]"
        />
        <line
          x1={pad.l}
          y1={pad.t}
          x2={pad.l}
          y2={H - pad.b}
          stroke="currentColor"
          className="text-[var(--atelier-line)]"
        />
        <text x={W / 2} y={H - 8} textAnchor="middle" className="fill-[var(--atelier-faint)]" fontSize="10">
          Impressions (log scale)
        </text>
        <text
          x={14}
          y={H / 2}
          textAnchor="middle"
          transform={`rotate(-90 14 ${H / 2})`}
          className="fill-[var(--atelier-faint)]"
          fontSize="10"
        >
          Engagement sum
        </text>
        {points.map((p) => {
          const cx = xScale(p.x_impressions);
          const cy = yScale(p.y_engagement);
          const isSel = selectedId === p.tweet_id;
          const isOrig = p.content_class === 'original';
          return (
            <circle
              key={p.tweet_id}
              cx={cx}
              cy={cy}
              r={isSel ? 7 : p.is_dead ? 3 : 5}
              fill={
                isOrig
                  ? 'var(--atelier-gold)'
                  : p.is_dead
                    ? 'var(--atelier-faint)'
                    : 'color-mix(in srgb, var(--atelier-ink) 55%, transparent)'
              }
              opacity={isSel ? 1 : 0.75}
              stroke={isSel ? 'var(--atelier-ink)' : 'transparent'}
              strokeWidth={isSel ? 2 : 0}
              className="cursor-pointer"
              onClick={() => onSelect(isSel ? null : p.tweet_id)}
            >
              <title>
                {`${p.content_class} · imp ${p.x_impressions} · eng ${p.y_engagement} · ${p.text_preview}`}
              </title>
            </circle>
          );
        })}
      </svg>
      <div className="flex flex-wrap gap-3 text-[0.65rem] text-[var(--atelier-muted)]">
        <span className="inline-flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[var(--atelier-gold)]" /> Original
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[var(--atelier-ink)]/50" /> Reply / other
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[var(--atelier-faint)]" /> Dead (0 eng, low imp)
        </span>
        <span>Click a point to pin it below.</span>
      </div>
    </div>
  );
}

function PostTable({
  title,
  posts,
  empty,
}: {
  title: string;
  posts: PostCard[];
  empty?: string;
}) {
  return (
    <div className="atelier-card p-4 sm:p-5 space-y-3">
      <h3 className="font-headline text-base font-bold">{title}</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs sm:text-sm">
          <thead>
            <tr className="text-[var(--atelier-faint)] border-b border-[var(--atelier-line)]">
              <th className="py-2 pr-2 font-semibold">Post</th>
              <th className="py-2 pr-2 font-semibold">Type</th>
              <th className="py-2 pr-2 font-semibold tabular-nums">Imp</th>
              <th className="py-2 pr-2 font-semibold tabular-nums">Eng</th>
              <th className="py-2 font-semibold tabular-nums">ER</th>
            </tr>
          </thead>
          <tbody>
            {posts.map((p) => (
              <tr
                key={p.tweet_id}
                className="border-b border-[var(--atelier-line)]/50 align-top hover:bg-[var(--atelier-paper)]/40"
              >
                <td className="py-2.5 pr-2 max-w-[14rem] sm:max-w-[18rem]">
                  <a
                    href={`https://x.com/i/status/${p.tweet_id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[var(--atelier-ink)] hover:text-[var(--atelier-gold)] line-clamp-2"
                  >
                    {p.text_preview || '—'}
                  </a>
                </td>
                <td className="py-2.5 pr-2 text-[var(--atelier-muted)] whitespace-nowrap">
                  {p.content_class}
                  {p.archetype && p.archetype !== 'other' ? (
                    <span className="block text-[0.65rem] opacity-80">{p.archetype}</span>
                  ) : null}
                </td>
                <td className="py-2.5 pr-2 tabular-nums">{fmt(p.impression_count)}</td>
                <td className="py-2.5 pr-2 tabular-nums">{p.engagement_sum}</td>
                <td className="py-2.5 tabular-nums">{pct(p.engagement_rate, 2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {!posts.length && (
          <p className="text-sm text-[var(--atelier-muted)] py-4">{empty || 'No rows.'}</p>
        )}
      </div>
    </div>
  );
}

export function XLabClient() {
  const [range, setRange] = useState<Range>('all');
  const [tab, setTab] = useState<TabId>('overview');
  const [classFilter, setClassFilter] = useState<ClassFilter>('all');
  const [data, setData] = useState<SummaryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedScatter, setSelectedScatter] = useState<string | null>(null);
  const [chatQ, setChatQ] = useState('');
  const [chatA, setChatA] = useState<string | null>(null);
  const [chatBusy, setChatBusy] = useState(false);
  const [provider, setProvider] = useState<'meta' | 'openrouter'>('meta');
  const [heatMetric, setHeatMetric] = useState<'eng' | 'imp'>('eng');

  const load = useCallback(async (r: Range) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/x-lab/summary?range=${r}`, {
        credentials: 'include',
        cache: 'no-store',
      });
      const json = (await res.json()) as SummaryResponse & { error?: string };
      if (!res.ok) throw new Error(json.error || 'Failed to load summary');
      setData(json);
      if (json.error) setError(json.error);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Load failed');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load(range);
  }, [load, range]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const sp = new URLSearchParams(window.location.search);
    const xe = sp.get('x_error');
    if (xe) setError(decodeURIComponent(xe));
  }, []);

  const onRefresh = async (force = false) => {
    setRefreshing(true);
    setError(null);
    try {
      const res = await fetch('/api/x-lab/refresh', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ force, maxPages: 4 }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || json.message || 'Refresh failed');
      await load(range);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Refresh failed');
    } finally {
      setRefreshing(false);
    }
  };

  const onChat = async () => {
    if (!chatQ.trim()) return;
    setChatBusy(true);
    setChatA(null);
    try {
      const res = await fetch('/api/x-lab/chat', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: chatQ, range, provider }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Chat failed');
      setChatA(json.answer);
    } catch (e) {
      setChatA(e instanceof Error ? e.message : 'Chat failed');
    } finally {
      setChatBusy(false);
    }
  };

  const summary = data?.summary;
  const kpis = summary?.kpis;
  const notes = summary?.sectionNotes || {};
  const connected = !!data?.connection?.connected;
  const oauthReady = !!data?.config?.xOAuthConfigured;

  const scatterFiltered = useMemo(() => {
    const pts = summary?.scatter || [];
    if (classFilter === 'all') return pts;
    return pts.filter((p) => p.content_class === classFilter);
  }, [summary, classFilter]);

  const selectedPt = useMemo(
    () => scatterFiltered.find((p) => p.tweet_id === selectedScatter) || null,
    [scatterFiltered, selectedScatter]
  );

  const series = summary?.followerSeries || [];
  const seriesMin = series.length ? Math.min(...series.map((s) => s.followers)) : 0;
  const seriesMax = series.length ? Math.max(...series.map((s) => s.followers)) : 1;

  const heatMax = useMemo(() => {
    if (!summary?.heatmap?.length) return 1;
    return Math.max(
      1,
      ...summary.heatmap.map((c) =>
        heatMetric === 'imp' ? c.median_impressions ?? 0 : c.median_engagement_sum ?? 0
      )
    );
  }, [summary, heatMetric]);

  const tabs: { id: TabId; label: string; icon: typeof BarChart3 }[] = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'replies', label: 'Reply lab', icon: MessageSquare },
    { id: 'timing', label: 'Timing', icon: Activity },
    { id: 'posts', label: 'Posts', icon: Flame },
    { id: 'analyst', label: 'AI Analyst', icon: Sparkles },
  ];

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Header controls */}
      <div className="atelier-card p-4 sm:p-5 flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div className="space-y-1 min-w-0">
          <p className="text-[0.65rem] font-bold uppercase tracking-[0.24em] text-[var(--atelier-gold)]">
            Growth cockpit
          </p>
          <p className="text-sm text-[var(--atelier-muted)] leading-relaxed max-w-2xl">
            Reach vs conversion, reply archetypes, funnel, Pareto, IST heat. Built to squeeze every
            credit from a Refresh. Medians + small-n honesty — not vanity dashboards.
          </p>
          <p className="text-xs text-[var(--atelier-faint)]">
            {connected
              ? `Connected @${data?.connection?.username || '…'}`
              : oauthReady
                ? 'X not connected'
                : 'X OAuth env incomplete'}
            {data?.lastRefresh?.started_at
              ? ` · Last refresh ${new Date(data.lastRefresh.started_at).toLocaleString()} (${data.lastRefresh.posts_upserted ?? '—'} posts)`
              : ''}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <div className="inline-flex p-1 rounded-full border border-[var(--atelier-line)] bg-[var(--atelier-paper)]/50">
            {(['7d', '30d', '90d', 'all'] as Range[]).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRange(r)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold ${
                  range === r
                    ? 'bg-[var(--atelier-ink)] text-[var(--atelier-card)]'
                    : 'text-[var(--atelier-faint)] hover:text-[var(--atelier-ink)]'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
          {!connected ? (
            <a href="/api/x-lab/oauth/start" className="atelier-btn atelier-btn-gold h-10 text-xs">
              <Link2 className="w-3.5 h-3.5" /> Connect X
            </a>
          ) : (
            <button
              type="button"
              disabled={refreshing}
              onClick={() => void onRefresh(false)}
              className="atelier-btn atelier-btn-primary h-10 text-xs disabled:opacity-40"
            >
              {refreshing ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <RefreshCw className="w-3.5 h-3.5" />
              )}
              Refresh (max value)
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="atelier-card border border-amber-500/30 bg-amber-500/5 px-4 py-3 flex gap-2 text-sm text-amber-900 dark:text-amber-100">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <p>{error}</p>
        </div>
      )}

      {/* Tabs */}
      <div
        className="inline-flex flex-wrap p-1 rounded-2xl border border-[var(--atelier-line)] bg-[var(--atelier-paper)]/50 gap-0.5"
        role="tablist"
      >
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={tab === t.id}
            onClick={() => setTab(t.id)}
            className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-colors ${
              tab === t.id
                ? 'bg-[var(--atelier-ink)] text-[var(--atelier-card)]'
                : 'text-[var(--atelier-faint)] hover:text-[var(--atelier-ink)]'
            }`}
          >
            <t.icon className="w-3.5 h-3.5" />
            {t.label}
          </button>
        ))}
      </div>

      {loading && !summary ? (
        <div className="atelier-card-lg py-20 flex flex-col items-center gap-3 text-[var(--atelier-muted)]">
          <Loader2 className="w-6 h-6 animate-spin text-[var(--atelier-gold)]" />
          <p className="text-sm">Loading warehouse…</p>
        </div>
      ) : (
        <>
          {/* KPI strip always visible */}
          <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-3">
            {[
              {
                label: 'Followers',
                value: fmt(kpis?.followersNow),
                sub: `Δ snap ${fmtDelta(kpis?.followersDeltaLast)}`,
                icon: TrendingUp,
              },
              {
                label: 'Posts',
                value: fmt(kpis?.postsN),
                sub: `${pct(kpis?.replyShare, 0)} replies`,
                icon: BarChart3,
              },
              {
                label: 'Med impressions',
                value: fmt(kpis?.medianImpressions),
                sub: `total ${fmt(kpis?.totalImpressions)}`,
                icon: Target,
              },
              {
                label: 'Med eng / ER',
                value: `${fmt(kpis?.medianEngagementSum, 1)} / ${pct(kpis?.medianEngagementRate, 2)}`,
                sub: `overall ER ${pct(kpis?.overallER, 3)}`,
                icon: Zap,
              },
              {
                label: 'Dead rate',
                value: pct(kpis?.deadRate, 0),
                sub: `winners ${pct(kpis?.winnerRate, 0)}`,
                icon: Crosshair,
              },
              {
                label: 'Pareto top 10%',
                value: pct(summary?.pareto?.top10_share_impressions, 0),
                sub: `of impressions · eng ${pct(summary?.pareto?.top10_share_engagement, 0)}`,
                icon: Flame,
              },
            ].map((k) => (
              <div key={k.label} className="atelier-card p-3.5 sm:p-4 space-y-1.5">
                <div className="flex items-center gap-1.5 text-[var(--atelier-faint)]">
                  <k.icon className="w-3.5 h-3.5" />
                  <span className="text-[0.6rem] font-bold uppercase tracking-wider">{k.label}</span>
                </div>
                <p className="font-headline text-xl sm:text-2xl font-extrabold text-[var(--atelier-ink)] tabular-nums leading-tight">
                  {k.value}
                </p>
                <p className="text-[0.65rem] text-[var(--atelier-muted)] leading-snug">{k.sub}</p>
              </div>
            ))}
          </div>
          <AnalysisDetails note={notes.kpis} defaultOpen={false} />

          {tab === 'overview' && (
            <div className="space-y-5">
              {/* Playbook */}
              <div className="space-y-3">
                <h2 className="font-headline text-lg font-bold flex items-center gap-2">
                  <Flame className="w-4 h-4 text-[var(--atelier-gold)]" />
                  Growth playbook (from your warehouse)
                </h2>
                <div className="grid md:grid-cols-2 gap-3">
                  {(summary?.playbook || []).map((item, i) => (
                    <div
                      key={i}
                      className={`rounded-2xl border px-4 py-3 space-y-1 ${severityStyles(item.severity)}`}
                    >
                      <p className="text-[0.65rem] font-bold uppercase tracking-wider opacity-80">
                        {item.severity}
                      </p>
                      <p className="font-headline font-bold text-sm">{item.title}</p>
                      <p className="text-xs leading-relaxed opacity-90">{item.detail}</p>
                    </div>
                  ))}
                </div>
                <AnalysisDetails note={notes.playbook} />
              </div>

              <div className="grid lg:grid-cols-2 gap-4">
                {/* Funnel */}
                <div className="atelier-card p-5 space-y-4">
                  <h2 className="font-headline text-lg font-bold">Engagement funnel</h2>
                  <div className="flex items-end justify-between gap-2 pt-2">
                    <FunnelStep label="Posts" n={summary?.funnel?.n ?? 0} total={summary?.funnel?.n ?? 1} />
                    <FunnelStep
                      label="Have imp"
                      n={summary?.funnel?.with_impressions ?? 0}
                      total={summary?.funnel?.n ?? 1}
                    />
                    <FunnelStep
                      label="Any eng"
                      n={summary?.funnel?.with_any_engagement ?? 0}
                      total={summary?.funnel?.with_impressions ?? 1}
                      rate={summary?.funnel?.imp_to_eng_rate}
                    />
                    <FunnelStep
                      label="Reply-back"
                      n={summary?.funnel?.with_reply_back ?? 0}
                      total={summary?.funnel?.with_any_engagement ?? 1}
                      rate={summary?.funnel?.eng_to_reply_rate}
                    />
                  </div>
                  <AnalysisDetails note={notes.funnel} />
                </div>

                {/* Class comparison */}
                <div className="atelier-card p-5 space-y-4">
                  <h2 className="font-headline text-lg font-bold">Original vs reply</h2>
                  <div className="space-y-3">
                    {(summary?.contentClasses || []).map((c) => (
                      <div key={c.content_class} className="space-y-2">
                        <BarRow
                          label={`${c.content_class} · n=${c.n} (${pct(c.share, 0)})`}
                          value={c.median_engagement_sum ?? 0}
                          max={Math.max(
                            1,
                            ...(summary?.contentClasses || []).map(
                              (x) => x.median_engagement_sum ?? 0
                            )
                          )}
                          hint={`med eng ${fmt(c.median_engagement_sum, 1)} · ER ${pct(
                            c.median_engagement_rate,
                            2
                          )} · dead ${pct(c.dead_rate, 0)}`}
                          dimmed={!c.reliable}
                        />
                      </div>
                    ))}
                  </div>
                  <AnalysisDetails note={notes.contentClass} />
                </div>

                {/* Scatter */}
                <div className="atelier-card p-5 space-y-3 lg:col-span-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h2 className="font-headline text-lg font-bold">
                      Reach × conversion map
                    </h2>
                    <div className="inline-flex items-center gap-1 p-1 rounded-full border border-[var(--atelier-line)]">
                      <Filter className="w-3 h-3 ml-2 text-[var(--atelier-faint)]" />
                      {(['all', 'reply', 'original'] as ClassFilter[]).map((f) => (
                        <button
                          key={f}
                          type="button"
                          onClick={() => setClassFilter(f)}
                          className={`px-2.5 py-1 rounded-full text-[0.65rem] font-bold ${
                            classFilter === f
                              ? 'bg-[var(--atelier-ink)] text-[var(--atelier-card)]'
                              : 'text-[var(--atelier-faint)]'
                          }`}
                        >
                          {f}
                        </button>
                      ))}
                    </div>
                  </div>
                  <ScatterPlot
                    points={scatterFiltered}
                    selectedId={selectedScatter}
                    onSelect={setSelectedScatter}
                  />
                  {selectedPt && (
                    <div className="rounded-xl border border-[var(--atelier-line)] p-3 text-sm space-y-1">
                      <p className="font-semibold text-[var(--atelier-ink)]">
                        Pinned · {selectedPt.content_class} · {selectedPt.archetype}
                      </p>
                      <p className="text-[var(--atelier-muted)]">{selectedPt.text_preview}</p>
                      <p className="text-xs text-[var(--atelier-faint)] tabular-nums">
                        imp {fmt(selectedPt.x_impressions)} · eng {selectedPt.y_engagement} · ER{' '}
                        {pct(selectedPt.er, 2)} · hour IST {selectedPt.hour_ist}
                      </p>
                      <a
                        href={`https://x.com/i/status/${selectedPt.tweet_id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-bold text-[var(--atelier-gold)]"
                      >
                        Open on X
                      </a>
                    </div>
                  )}
                  <AnalysisDetails note={notes.scatter} />
                </div>

                {/* Followers */}
                <div className="atelier-card p-5 space-y-3">
                  <h2 className="font-headline text-lg font-bold">Follower snapshots</h2>
                  {!series.length ? (
                    <p className="text-sm text-[var(--atelier-muted)]">
                      Need more Refresh runs to draw a curve.
                    </p>
                  ) : (
                    <div className="flex items-end gap-0.5 h-32">
                      {series.map((s, i) => {
                        const span = Math.max(1, seriesMax - seriesMin);
                        const h = 10 + ((s.followers - seriesMin) / span) * 90;
                        return (
                          <div
                            key={`${s.t}-${i}`}
                            title={`${new Date(s.t).toLocaleString()}: ${s.followers}`}
                            className="flex-1 min-w-[4px] rounded-t bg-[var(--atelier-gold)]/75"
                            style={{ height: `${h}%` }}
                          />
                        );
                      })}
                    </div>
                  )}
                  <AnalysisDetails note={notes.followers} />
                </div>

                {/* Length */}
                <div className="atelier-card p-5 space-y-3">
                  <h2 className="font-headline text-lg font-bold">Length buckets</h2>
                  {(summary?.lengths || []).map((b) => (
                    <BarRow
                      key={b.id}
                      label={`${b.label} · n=${b.n}`}
                      value={b.median_engagement_rate ?? b.median_engagement_sum ?? 0}
                      max={Math.max(
                        0.001,
                        ...(summary?.lengths || []).map(
                          (x) => x.median_engagement_rate ?? x.median_engagement_sum ?? 0
                        )
                      )}
                      hint={`ER ${pct(b.median_engagement_rate, 2)} · dead ${pct(b.dead_rate, 0)}`}
                      dimmed={!b.reliable}
                    />
                  ))}
                  <AnalysisDetails note={notes.lengths} />
                </div>
              </div>
            </div>
          )}

          {tab === 'replies' && (
            <div className="space-y-5">
              <div className="atelier-card p-5 space-y-4">
                <h2 className="font-headline text-lg font-bold">Reply archetypes</h2>
                <p className="text-xs text-[var(--atelier-muted)]">
                  Classified from text: additive take, question, agreement-only, story, off-topic.
                  Kill high dead-rate archetypes.
                </p>
                <div className="space-y-3">
                  {(summary?.replyArchetypes || []).map((a) => (
                    <BarRow
                      key={a.archetype}
                      label={`${a.archetype} · n=${a.n}`}
                      value={a.median_engagement_sum ?? 0}
                      max={Math.max(
                        1,
                        ...(summary?.replyArchetypes || []).map(
                          (x) => x.median_engagement_sum ?? 0
                        )
                      )}
                      hint={`med eng ${fmt(a.median_engagement_sum, 1)} · imp ${fmt(
                        a.median_impressions
                      )} · dead ${pct(a.dead_rate, 0)}`}
                      dimmed={!a.reliable}
                      accent={
                        a.archetype === 'off_topic' || a.archetype === 'agreement_only'
                          ? 'rgb(239 68 68)'
                          : undefined
                      }
                    />
                  ))}
                  {!summary?.replyArchetypes?.length && (
                    <p className="text-sm text-[var(--atelier-muted)]">No replies in range.</p>
                  )}
                </div>
                <AnalysisDetails note={notes.replyArchetypes} defaultOpen />
              </div>
              <div className="grid lg:grid-cols-2 gap-4">
                <div>
                  <PostTable
                    title="Best replies (conversion-weighted)"
                    posts={summary?.leaderboards?.bestReplies || []}
                  />
                  <div className="px-1">
                    <AnalysisDetails note={notes.bestReplies} />
                  </div>
                </div>
                <div>
                  <PostTable
                    title="Dead / weak replies (stop these patterns)"
                    posts={summary?.leaderboards?.worstReplies || []}
                  />
                  <div className="px-1">
                    <AnalysisDetails note={notes.worstReplies} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {tab === 'timing' && (
            <div className="space-y-5">
              <div className="grid lg:grid-cols-2 gap-4">
                <div className="atelier-card p-5 space-y-3">
                  <h2 className="font-headline text-lg font-bold">Hour of day (IST)</h2>
                  <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                    {(summary?.hours || [])
                      .filter((h) => h.n > 0)
                      .sort(
                        (a, b) =>
                          (b.median_engagement_sum ?? 0) - (a.median_engagement_sum ?? 0)
                      )
                      .map((h) => (
                        <BarRow
                          key={h.hour}
                          label={`${String(h.hour).padStart(2, '0')}:00 · n=${h.n}`}
                          value={h.median_engagement_sum ?? 0}
                          max={Math.max(
                            1,
                            ...(summary?.hours || []).map((x) => x.median_engagement_sum ?? 0)
                          )}
                          hint={`eng ${fmt(h.median_engagement_sum, 1)} · med imp ${fmt(
                            h.median_impressions
                          )}`}
                          dimmed={!h.reliable}
                        />
                      ))}
                  </div>
                  <AnalysisDetails note={notes.hours} />
                </div>
                <div className="atelier-card p-5 space-y-3">
                  <h2 className="font-headline text-lg font-bold">Day of week (IST)</h2>
                  {(summary?.days || []).map((d) => (
                    <BarRow
                      key={d.dow}
                      label={`${d.label} · n=${d.n}`}
                      value={d.median_engagement_sum ?? 0}
                      max={Math.max(
                        1,
                        ...(summary?.days || []).map((x) => x.median_engagement_sum ?? 0)
                      )}
                      hint={`eng ${fmt(d.median_engagement_sum, 1)} · imp ${fmt(
                        d.median_impressions
                      )}`}
                      dimmed={!d.reliable}
                    />
                  ))}
                  <AnalysisDetails note={notes.days} />
                </div>
              </div>

              <div className="atelier-card p-5 space-y-3 overflow-x-auto">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h2 className="font-headline text-lg font-bold">Heatmap · hour × day (IST)</h2>
                  <div className="inline-flex p-1 rounded-full border border-[var(--atelier-line)]">
                    {(
                      [
                        ['eng', 'Engagement'],
                        ['imp', 'Impressions'],
                      ] as const
                    ).map(([id, label]) => (
                      <button
                        key={id}
                        type="button"
                        onClick={() => setHeatMetric(id)}
                        className={`px-3 py-1 rounded-full text-[0.65rem] font-bold ${
                          heatMetric === id
                            ? 'bg-[var(--atelier-ink)] text-[var(--atelier-card)]'
                            : 'text-[var(--atelier-faint)]'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="min-w-[640px]">
                  <div
                    className="grid gap-0.5"
                    style={{ gridTemplateColumns: `2.5rem repeat(24, minmax(0, 1fr))` }}
                  >
                    <div />
                    {Array.from({ length: 24 }, (_, h) => (
                      <div
                        key={h}
                        className="text-[0.55rem] text-center text-[var(--atelier-faint)]"
                      >
                        {h}
                      </div>
                    ))}
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((label, dow) => (
                      <div key={label} className="contents">
                        <div className="text-[0.65rem] text-[var(--atelier-muted)] flex items-center">
                          {label}
                        </div>
                        {Array.from({ length: 24 }, (_, hour) => {
                          const cell = summary?.heatmap?.find(
                            (c) => c.dow === dow && c.hour === hour
                          );
                          const v =
                            heatMetric === 'imp'
                              ? cell?.median_impressions ?? 0
                              : cell?.median_engagement_sum ?? 0;
                          const n = cell?.n ?? 0;
                          const intensity = heatMax > 0 ? v / heatMax : 0;
                          return (
                            <div
                              key={`${dow}-${hour}`}
                              title={`${label} ${hour}:00 · n=${n} · ${heatMetric} ${v}`}
                              className="aspect-square rounded-sm border border-[var(--atelier-line)]/40"
                              style={{
                                background:
                                  n === 0
                                    ? 'transparent'
                                    : `color-mix(in srgb, var(--atelier-gold) ${Math.round(
                                        12 + intensity * 88
                                      )}%, transparent)`,
                                opacity: cell?.reliable === false ? 0.4 : 1,
                              }}
                            />
                          );
                        })}
                      </div>
                    ))}
                  </div>
                </div>
                <AnalysisDetails note={notes.heatmap} />
              </div>
            </div>
          )}

          {tab === 'posts' && (
            <div className="grid lg:grid-cols-2 gap-4">
              <div>
                <PostTable
                  title="Reach leaders (log-imp × eng)"
                  posts={summary?.leaderboards?.reach || []}
                />
                <div className="px-1">
                  <AnalysisDetails note={notes.reachBoard} />
                </div>
              </div>
              <div>
                <PostTable
                  title="Conversion leaders (ER-weighted)"
                  posts={summary?.leaderboards?.conversion || []}
                />
                <div className="px-1">
                  <AnalysisDetails note={notes.conversionBoard} />
                </div>
              </div>
              <div>
                <PostTable
                  title="Best originals"
                  posts={summary?.leaderboards?.bestOriginals || []}
                />
                <div className="px-1">
                  <AnalysisDetails note={notes.bestOriginals} />
                </div>
              </div>
              <div>
                <PostTable
                  title="Best replies"
                  posts={summary?.leaderboards?.bestReplies || []}
                />
                <div className="px-1">
                  <AnalysisDetails note={notes.bestReplies} />
                </div>
              </div>
            </div>
          )}

          {tab === 'analyst' && (
            <div className="atelier-card p-5 sm:p-6 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-[var(--atelier-gold)]" />
                  <h2 className="font-headline text-lg font-bold">AI growth analyst</h2>
                </div>
                <div className="inline-flex p-1 rounded-full border border-[var(--atelier-line)]">
                  {(['meta', 'openrouter'] as const).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setProvider(p)}
                      className={`px-3 py-1 rounded-full text-[0.65rem] font-bold uppercase ${
                        provider === p
                          ? 'bg-[var(--atelier-ink)] text-[var(--atelier-card)]'
                          : 'text-[var(--atelier-faint)]'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
              <p className="text-xs text-[var(--atelier-muted)]">
                Reads playbook, archetypes, funnel, Pareto, and leaderboards for the selected range.
                Ask for experiments, not slogans.
              </p>
              <div className="flex flex-wrap gap-2">
                {[
                  'What reply patterns should I kill this week?',
                  'Compare originals vs replies for growth.',
                  'Which IST hours should I prioritize for replies vs originals?',
                  'Design 3 experiments from the dead-rate and archetype data.',
                ].map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => setChatQ(q)}
                    className="text-[0.65rem] px-2.5 py-1.5 rounded-full border border-[var(--atelier-line)] text-[var(--atelier-muted)] hover:text-[var(--atelier-ink)] hover:border-[var(--atelier-gold)]/40"
                  >
                    {q}
                  </button>
                ))}
              </div>
              <textarea
                value={chatQ}
                onChange={(e) => setChatQ(e.target.value)}
                rows={3}
                placeholder="Ask about your warehouse…"
                className="atelier-input !rounded-2xl text-sm min-h-[5rem]"
              />
              <button
                type="button"
                disabled={chatBusy || !chatQ.trim() || !summary}
                onClick={() => void onChat()}
                className="atelier-btn atelier-btn-gold h-10 text-xs disabled:opacity-40"
              >
                {chatBusy ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5" />
                )}
                Ask analyst
              </button>
              {chatA && (
                <div className="rounded-2xl border border-[var(--atelier-line)] bg-[var(--atelier-paper)]/40 p-4 text-sm text-[var(--atelier-ink)] whitespace-pre-wrap leading-relaxed">
                  {chatA}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default XLabClient;
