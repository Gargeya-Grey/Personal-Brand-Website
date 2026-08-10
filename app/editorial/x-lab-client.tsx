'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Activity,
  BarChart3,
  Loader2,
  MessageSquare,
  RefreshCw,
  Link2,
  AlertTriangle,
  Sparkles,
  TrendingUp,
} from 'lucide-react';

type Range = '7d' | '30d' | '90d' | 'all';

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
      medianLikes: number | null;
      medianEngagementSum: number | null;
      medianEngagementRate: number | null;
      impressionCoverage: number;
      linkedToPackN: number;
    };
    contentClasses: {
      content_class: string;
      n: number;
      median_likes: number | null;
      median_engagement_sum: number | null;
      median_engagement_rate: number | null;
      reliable: boolean;
    }[];
    hours: {
      hour: number;
      n: number;
      median_engagement_sum: number | null;
      reliable: boolean;
    }[];
    days: {
      dow: number;
      label: string;
      n: number;
      median_engagement_sum: number | null;
      reliable: boolean;
    }[];
    heatmap: {
      hour: number;
      dow: number;
      n: number;
      median_engagement_sum: number | null;
      reliable: boolean;
    }[];
    lengths: {
      id: string;
      label: string;
      n: number;
      median_likes: number | null;
      median_engagement_sum: number | null;
      reliable: boolean;
    }[];
    topPosts: {
      tweet_id: string;
      created_at: string;
      content_class: string;
      like_count: number;
      reply_count: number;
      repost_count: number;
      impression_count: number | null;
      engagement_sum: number;
      engagement_rate: number | null;
      text_preview: string;
      linked_pack_id: string | null;
    }[];
    insights: string[];
    followerSeries: { t: string; followers: number }[];
  } | null;
  error?: string | null;
};

function fmt(n: number | null | undefined, digits = 0) {
  if (n == null || !Number.isFinite(n)) return '—';
  return n.toLocaleString(undefined, {
    maximumFractionDigits: digits,
    minimumFractionDigits: digits,
  });
}

function fmtDelta(n: number | null | undefined) {
  if (n == null || !Number.isFinite(n)) return '—';
  const sign = n > 0 ? '+' : '';
  return `${sign}${n.toLocaleString()}`;
}

function pct(n: number | null | undefined) {
  if (n == null || !Number.isFinite(n)) return '—';
  return `${(n * 100).toFixed(2)}%`;
}

function BarRow({
  label,
  value,
  max,
  hint,
  dimmed,
}: {
  label: string;
  value: number;
  max: number;
  hint?: string;
  dimmed?: boolean;
}) {
  const w = max > 0 ? Math.max(2, Math.round((value / max) * 100)) : 0;
  return (
    <div className={`space-y-1 ${dimmed ? 'opacity-50' : ''}`}>
      <div className="flex justify-between gap-2 text-xs">
        <span className="font-medium text-[var(--atelier-ink)]">{label}</span>
        <span className="text-[var(--atelier-muted)] tabular-nums">
          {hint ?? fmt(value, value < 10 ? 1 : 0)}
        </span>
      </div>
      <div className="h-2 rounded-full bg-[var(--atelier-line)]/60 overflow-hidden">
        <div
          className="h-full rounded-full bg-[var(--atelier-gold)]/80"
          style={{ width: `${w}%` }}
        />
      </div>
    </div>
  );
}

export function XLabClient() {
  const [range, setRange] = useState<Range>('30d');
  const [data, setData] = useState<SummaryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [chatQ, setChatQ] = useState('');
  const [chatA, setChatA] = useState<string | null>(null);
  const [chatBusy, setChatBusy] = useState(false);
  const [provider, setProvider] = useState<'meta' | 'openrouter'>('meta');

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
        body: JSON.stringify({ force, maxPages: 2 }),
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
  const connected = !!data?.connection?.connected;
  const oauthReady = !!data?.config?.xOAuthConfigured;

  const hourMax = useMemo(() => {
    if (!summary?.hours?.length) return 1;
    return Math.max(1, ...summary.hours.map((h) => h.median_engagement_sum ?? 0));
  }, [summary]);

  const heatMax = useMemo(() => {
    if (!summary?.heatmap?.length) return 1;
    return Math.max(
      1,
      ...summary.heatmap.map((c) => c.median_engagement_sum ?? 0)
    );
  }, [summary]);

  const series = summary?.followerSeries || [];
  const seriesMin = series.length
    ? Math.min(...series.map((s) => s.followers))
    : 0;
  const seriesMax = series.length
    ? Math.max(...series.map((s) => s.followers))
    : 1;

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Controls */}
      <div className="atelier-card p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1 min-w-0">
          <p className="text-[0.65rem] font-bold uppercase tracking-[0.24em] text-[var(--atelier-gold)]">
            Growth analytics
          </p>
          <p className="text-sm text-[var(--atelier-muted)] leading-relaxed max-w-xl">
            Warehouse metrics for @GargeyaS. Snapshot followers on Refresh. Medians and
            small-n guards — associations, not magic causes.
          </p>
          <p className="text-xs text-[var(--atelier-faint)]">
            {connected
              ? `Connected as @${data?.connection?.username || '…'}`
              : oauthReady
                ? 'X not connected yet'
                : 'Set X_CLIENT_ID / X_CLIENT_SECRET / X_TOKEN_ENCRYPTION_KEY on the host'}
            {data?.lastRefresh?.started_at
              ? ` · Last refresh ${new Date(data.lastRefresh.started_at).toLocaleString()}`
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
              Refresh data
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

      {loading && !summary ? (
        <div className="atelier-card-lg py-20 flex flex-col items-center gap-3 text-[var(--atelier-muted)]">
          <Loader2 className="w-6 h-6 animate-spin text-[var(--atelier-gold)]" />
          <p className="text-sm">Loading warehouse…</p>
        </div>
      ) : (
        <>
          {/* KPIs */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {[
              {
                label: 'Followers',
                value: fmt(kpis?.followersNow ?? null),
                sub: `Δ last snap ${fmtDelta(kpis?.followersDeltaLast)}`,
                icon: TrendingUp,
              },
              {
                label: 'Δ 7d (snapshots)',
                value: fmtDelta(kpis?.followersDelta7d),
                sub: `Δ 30d ${fmtDelta(kpis?.followersDelta30d)}`,
                icon: Activity,
              },
              {
                label: 'Posts in range',
                value: fmt(kpis?.postsN ?? 0),
                sub: `Median likes ${fmt(kpis?.medianLikes)}`,
                icon: BarChart3,
              },
              {
                label: 'Median eng. rate',
                value: pct(kpis?.medianEngagementRate),
                sub: `Imp. coverage ${pct(kpis?.impressionCoverage)} · pack-linked ${fmt(kpis?.linkedToPackN)}`,
                icon: Sparkles,
              },
            ].map((k) => (
              <div key={k.label} className="atelier-card p-4 sm:p-5 space-y-2">
                <div className="flex items-center gap-2 text-[var(--atelier-faint)]">
                  <k.icon className="w-3.5 h-3.5" />
                  <span className="text-[0.65rem] font-bold uppercase tracking-wider">
                    {k.label}
                  </span>
                </div>
                <p className="font-headline text-2xl sm:text-3xl font-extrabold text-[var(--atelier-ink)] tabular-nums">
                  {k.value}
                </p>
                <p className="text-xs text-[var(--atelier-muted)]">{k.sub}</p>
              </div>
            ))}
          </div>

          {/* Insights */}
          {summary?.insights?.length ? (
            <div className="atelier-card p-5 sm:p-6 space-y-3">
              <h2 className="font-headline text-lg font-bold text-[var(--atelier-ink)]">
                Rule-based read
              </h2>
              <ul className="space-y-2">
                {summary.insights.map((line, i) => (
                  <li
                    key={i}
                    className="text-sm text-[var(--atelier-muted)] leading-relaxed pl-3 border-l-2 border-[var(--atelier-gold)]/40"
                  >
                    {line}
                  </li>
                ))}
              </ul>
              <p className="text-[0.7rem] text-[var(--atelier-faint)] pt-1">
                {summary.principles?.join(' · ')}
              </p>
            </div>
          ) : null}

          <div className="grid lg:grid-cols-2 gap-4 sm:gap-6">
            {/* Follower series */}
            <div className="atelier-card p-5 sm:p-6 space-y-4">
              <h2 className="font-headline text-lg font-bold">Follower trajectory</h2>
              {!series.length ? (
                <p className="text-sm text-[var(--atelier-muted)]">
                  No snapshots yet. Connect X and press Refresh.
                </p>
              ) : (
                <div className="flex items-end gap-0.5 h-36">
                  {series.map((s, i) => {
                    const span = Math.max(1, seriesMax - seriesMin);
                    const h = 8 + ((s.followers - seriesMin) / span) * 92;
                    return (
                      <div
                        key={`${s.t}-${i}`}
                        title={`${new Date(s.t).toLocaleString()}: ${s.followers}`}
                        className="flex-1 min-w-[3px] rounded-t bg-[var(--atelier-gold)]/70 hover:bg-[var(--atelier-gold)] transition-colors"
                        style={{ height: `${h}%` }}
                      />
                    );
                  })}
                </div>
              )}
            </div>

            {/* Content class */}
            <div className="atelier-card p-5 sm:p-6 space-y-4">
              <h2 className="font-headline text-lg font-bold">What (content class)</h2>
              <div className="space-y-3">
                {(summary?.contentClasses || []).map((c) => (
                  <BarRow
                    key={c.content_class}
                    label={`${c.content_class} (n=${c.n}${c.reliable ? '' : ', low n'})`}
                    value={c.median_engagement_sum ?? 0}
                    max={Math.max(
                      1,
                      ...(summary?.contentClasses || []).map(
                        (x) => x.median_engagement_sum ?? 0
                      )
                    )}
                    hint={`med eng ${fmt(c.median_engagement_sum, 1)} · likes ${fmt(c.median_likes)}`}
                    dimmed={!c.reliable}
                  />
                ))}
                {!summary?.contentClasses?.length && (
                  <p className="text-sm text-[var(--atelier-muted)]">No posts in warehouse.</p>
                )}
              </div>
            </div>

            {/* Hours IST */}
            <div className="atelier-card p-5 sm:p-6 space-y-4">
              <h2 className="font-headline text-lg font-bold">When (hour IST)</h2>
              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {(summary?.hours || [])
                  .filter((h) => h.n > 0)
                  .map((h) => (
                    <BarRow
                      key={h.hour}
                      label={`${String(h.hour).padStart(2, '0')}:00 · n=${h.n}`}
                      value={h.median_engagement_sum ?? 0}
                      max={hourMax}
                      dimmed={!h.reliable}
                    />
                  ))}
              </div>
            </div>

            {/* DOW */}
            <div className="atelier-card p-5 sm:p-6 space-y-4">
              <h2 className="font-headline text-lg font-bold">When (day IST)</h2>
              <div className="space-y-3">
                {(summary?.days || []).map((d) => (
                  <BarRow
                    key={d.dow}
                    label={`${d.label} · n=${d.n}`}
                    value={d.median_engagement_sum ?? 0}
                    max={Math.max(
                      1,
                      ...(summary?.days || []).map((x) => x.median_engagement_sum ?? 0)
                    )}
                    dimmed={!d.reliable}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Heatmap */}
          <div className="atelier-card p-5 sm:p-6 space-y-4 overflow-x-auto">
            <h2 className="font-headline text-lg font-bold">Heatmap · hour × day (IST)</h2>
            <p className="text-xs text-[var(--atelier-muted)]">
              Cell color = median engagement sum. Dim cells have very small n.
            </p>
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
                      const v = cell?.median_engagement_sum ?? 0;
                      const n = cell?.n ?? 0;
                      const intensity = heatMax > 0 ? v / heatMax : 0;
                      return (
                        <div
                          key={`${dow}-${hour}`}
                          title={`${label} ${hour}:00 · n=${n} · med eng ${v}`}
                          className="aspect-square rounded-sm border border-[var(--atelier-line)]/40"
                          style={{
                            background:
                              n === 0
                                ? 'transparent'
                                : `color-mix(in srgb, var(--atelier-gold) ${Math.round(
                                    15 + intensity * 85
                                  )}%, transparent)`,
                            opacity: cell?.reliable === false ? 0.45 : 1,
                          }}
                        />
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Length + table */}
          <div className="grid lg:grid-cols-3 gap-4 sm:gap-6">
            <div className="atelier-card p-5 sm:p-6 space-y-3">
              <h2 className="font-headline text-lg font-bold">Length buckets</h2>
              {(summary?.lengths || []).map((b) => (
                <BarRow
                  key={b.id}
                  label={`${b.label} · n=${b.n}`}
                  value={b.median_engagement_sum ?? 0}
                  max={Math.max(
                    1,
                    ...(summary?.lengths || []).map((x) => x.median_engagement_sum ?? 0)
                  )}
                  hint={`likes ${fmt(b.median_likes)}`}
                  dimmed={!b.reliable}
                />
              ))}
            </div>

            <div className="atelier-card p-5 sm:p-6 lg:col-span-2 space-y-3">
              <h2 className="font-headline text-lg font-bold">Top posts (exploratory)</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead>
                    <tr className="text-[var(--atelier-faint)] border-b border-[var(--atelier-line)]">
                      <th className="py-2 pr-2 font-semibold">Post</th>
                      <th className="py-2 pr-2 font-semibold">Class</th>
                      <th className="py-2 pr-2 font-semibold tabular-nums">Likes</th>
                      <th className="py-2 pr-2 font-semibold tabular-nums">Eng</th>
                      <th className="py-2 font-semibold tabular-nums">ER</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(summary?.topPosts || []).map((p) => (
                      <tr
                        key={p.tweet_id}
                        className="border-b border-[var(--atelier-line)]/50 align-top"
                      >
                        <td className="py-2.5 pr-2 max-w-[16rem]">
                          <a
                            href={`https://x.com/i/status/${p.tweet_id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[var(--atelier-ink)] hover:text-[var(--atelier-gold)] line-clamp-2"
                          >
                            {p.text_preview}
                          </a>
                        </td>
                        <td className="py-2.5 pr-2 text-[var(--atelier-muted)]">
                          {p.content_class}
                          {p.linked_pack_id ? ' · pack' : ''}
                        </td>
                        <td className="py-2.5 pr-2 tabular-nums">{p.like_count}</td>
                        <td className="py-2.5 pr-2 tabular-nums">{p.engagement_sum}</td>
                        <td className="py-2.5 tabular-nums">{pct(p.engagement_rate)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {!summary?.topPosts?.length && (
                  <p className="text-sm text-[var(--atelier-muted)] py-4">No posts yet.</p>
                )}
              </div>
            </div>
          </div>

          {/* AI Analyst */}
          <div className="atelier-card p-5 sm:p-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-[var(--atelier-gold)]" />
                <h2 className="font-headline text-lg font-bold">AI Analyst</h2>
              </div>
              <div className="inline-flex p-1 rounded-full border border-[var(--atelier-line)]">
                {(['meta', 'openrouter'] as const).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setProvider(p)}
                    className={`px-3 py-1 rounded-full text-[0.65rem] font-bold uppercase tracking-wide ${
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
              Uses the same Meta / OpenRouter stack as blog fill. Answers only from the warehouse
              packet for the selected range.
            </p>
            <textarea
              value={chatQ}
              onChange={(e) => setChatQ(e.target.value)}
              rows={3}
              placeholder="e.g. Which hours IST show the strongest median engagement in this sample? What should I test next week?"
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
        </>
      )}
    </div>
  );
}

export default XLabClient;
