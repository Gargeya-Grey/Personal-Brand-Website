'use client';

import './x-lab.css';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode, RefObject } from 'react';
import { ChevronDown, Link2, Loader2, RefreshCw } from 'lucide-react';

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

/* ── Formatting ─────────────────────────────────────────────────────────────── */

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

function deltaDirection(n: number | null | undefined): 'up' | 'down' | undefined {
  if (n == null || !Number.isFinite(n) || n === 0) return undefined;
  return n > 0 ? 'up' : 'down';
}

function pct(n: number | null | undefined, digits = 1) {
  if (n == null || !Number.isFinite(n)) return '—';
  return `${(n * 100).toFixed(digits)}%`;
}

const compactFormat = new Intl.NumberFormat('en', {
  notation: 'compact',
  maximumFractionDigits: 1,
});

function compact(n: number) {
  return Number.isFinite(n) ? compactFormat.format(n) : '—';
}

/** Local calendar date as YYYY-MM-DD, or a dash when the value is not a date. */
function fmtDate(value: string | null | undefined) {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${month}-${day}`;
}

function fmtDateTime(value: string | null | undefined) {
  if (!value) return '—';
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? '—' : d.toLocaleString();
}

/** A tidy axis step (1, 2, 5 times a power of ten) for roughly `raw` per tick. */
function niceStep(raw: number) {
  if (!Number.isFinite(raw) || raw <= 0) return 1;
  const power = 10 ** Math.floor(Math.log10(raw));
  const lead = raw / power;
  const step = lead <= 1 ? 1 : lead <= 2 ? 2 : lead <= 5 ? 5 : 10;
  return step * power;
}

function capitalize(word: string) {
  return word ? word.charAt(0).toUpperCase() + word.slice(1) : word;
}

const SEVERITY_TONE: Record<PlaybookItem['severity'], 'warn' | 'live' | 'draft' | undefined> = {
  critical: 'warn',
  high: 'live',
  medium: 'draft',
  info: undefined,
};

/** Width of an element, kept in state, so SVG charts draw at true pixel size. */
function useElementWidth<T extends HTMLElement>(): [RefObject<T | null>, number] {
  const ref = useRef<T | null>(null);
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(() => {
      setWidth(Math.round(el.getBoundingClientRect().width));
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return [ref, width];
}

/* ── Pieces ─────────────────────────────────────────────────────────────────── */

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
    <details id={id} className="xl-details" open={defaultOpen || undefined}>
      <summary>
        <span className="xl-details-title">
          <b>Read analysis</b>
          {note.headline}
        </span>
        <ChevronDown className="xl-chev w-4 h-4" aria-hidden="true" />
      </summary>
      <div className="xl-details-body">
        <div>
          <span className="atelier-label">How to read this</span>
          <p>{note.howToRead}</p>
        </div>
        {note.bullets?.length ? (
          <div>
            <span className="atelier-label">Diagnosis from your data</span>
            <ul className="xl-points">
              {note.bullets.map((b, i) => (
                <li key={i}>{b}</li>
              ))}
            </ul>
          </div>
        ) : null}
        {note.action ? (
          <div>
            <span className="atelier-label">What to do</span>
            <p className="xl-action">{note.action}</p>
          </div>
        ) : null}
      </div>
    </details>
  );
}

/** One measure as a label, a mono hint and a hairline bar. `highlight` marks the leading value. */
function BarRow({
  label,
  value,
  max,
  hint,
  faded,
  tone,
  highlight,
}: {
  label: string;
  value: number;
  max: number;
  hint?: string;
  faded?: boolean;
  tone?: 'clay';
  highlight?: boolean;
}) {
  const ratio = max > 0 && Number.isFinite(value) ? value / max : 0;
  const width = value > 0 && ratio > 0 ? Math.min(100, Math.max(2, Math.round(ratio * 100))) : 0;
  const fillTone = tone ?? (highlight && value > 0 && value >= max ? 'lead' : undefined);
  return (
    <li className="xl-bar-item">
      <div className="xl-bar-head">
        <span className="xl-bar-label">{label}</span>
        <span className="xl-bar-hint">{hint ?? fmt(value, value < 10 && value % 1 ? 1 : 0)}</span>
      </div>
      <div className="xl-track" aria-hidden="true">
        <div
          className="xl-fill"
          data-tone={fillTone}
          data-faded={faded ? 'true' : undefined}
          style={{ width: `${width}%` }}
        />
      </div>
    </li>
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
  const [wrapRef, measured] = useElementWidth<HTMLDivElement>();
  const W = measured || 640;
  const H = W < 480 ? 240 : 300;
  const pad = { l: 52, r: 12, t: 12, b: 44 };
  const plotW = Math.max(1, W - pad.l - pad.r);
  const plotH = H - pad.t - pad.b;

  const valid = points.filter(
    (p) => Number.isFinite(p.x_impressions) && Number.isFinite(p.y_engagement)
  );
  const maxX = Math.max(1, ...valid.map((p) => p.x_impressions));
  const maxY = Math.max(1, ...valid.map((p) => p.y_engagement));

  const yStep = niceStep(maxY / 4);
  const yTop = Math.max(yStep, Math.ceil(maxY / yStep) * yStep);
  const yTicks = Array.from({ length: Math.round(yTop / yStep) + 1 }, (_, i) => i * yStep);

  // log scale for impressions (heavy skew)
  const xTicks = [0];
  for (let tick = 10; tick <= maxX; tick *= 10) xTicks.push(tick);
  if (xTicks.length === 1) xTicks.push(maxX);

  const xScale = (v: number) => pad.l + (Math.log1p(v) / Math.log1p(maxX)) * plotW;
  const yScale = (v: number) => pad.t + plotH - (v / yTop) * plotH;

  // The pinned point is drawn last so it sits on top.
  const ordered = [...valid].sort(
    (a, b) => Number(a.tweet_id === selectedId) - Number(b.tweet_id === selectedId)
  );

  return (
    <div>
      <div ref={wrapRef} className="xl-chart-wrap">
        <svg
          className="xl-chart"
          width={W}
          height={H}
          viewBox={`0 0 ${W} ${H}`}
          role="img"
          aria-label="Impressions versus engagement scatter"
        >
          {yTicks.map((v) => (
            <g key={`y-${v}`}>
              <line className="xl-grid" x1={pad.l} x2={W - pad.r} y1={yScale(v)} y2={yScale(v)} />
              <text x={pad.l - 8} y={yScale(v) + 4} textAnchor="end">
                {compact(v)}
              </text>
            </g>
          ))}
          <line className="xl-baseline" x1={pad.l} x2={W - pad.r} y1={H - pad.b} y2={H - pad.b} />
          {xTicks.map((v) => (
            <text key={`x-${v}`} x={xScale(v)} y={H - pad.b + 16} textAnchor="middle">
              {compact(v)}
            </text>
          ))}
          <text x={pad.l + plotW / 2} y={H - 6} textAnchor="middle">
            Impressions (log scale)
          </text>
          <text x={10} y={pad.t + plotH / 2} textAnchor="middle" transform={`rotate(-90 10 ${pad.t + plotH / 2})`}>
            Engagement sum
          </text>
          {ordered.map((p) => {
            const isSel = selectedId === p.tweet_id;
            const kind = p.content_class === 'original' ? 'original' : p.is_dead ? 'dead' : 'reply';
            return (
              <circle
                key={p.tweet_id}
                className="xl-dot"
                data-kind={kind}
                data-selected={isSel ? 'true' : undefined}
                cx={xScale(p.x_impressions)}
                cy={yScale(p.y_engagement)}
                r={isSel ? 7 : p.is_dead ? 3 : 5}
                onClick={() => onSelect(isSel ? null : p.tweet_id)}
              >
                <title>
                  {`${p.content_class} · imp ${p.x_impressions} · eng ${p.y_engagement} · ${p.text_preview}`}
                </title>
              </circle>
            );
          })}
        </svg>
      </div>
      <ul className="xl-legend">
        <li>
          <span className="xl-key" data-kind="original" /> Original
        </li>
        <li>
          <span className="xl-key" data-kind="reply" /> Reply / other
        </li>
        <li>
          <span className="xl-key" data-kind="dead" /> Dead (0 eng, low imp)
        </li>
        <li>
          <span className="xl-key" data-kind="pinned" /> Pinned
        </li>
        <li>Click a point to pin it below.</li>
      </ul>
    </div>
  );
}

function FollowerLine({ series }: { series: { t: string; followers: number }[] }) {
  const [wrapRef, measured] = useElementWidth<HTMLDivElement>();
  const W = measured || 640;
  const H = 180;
  const pad = { l: 56, r: 12, t: 14, b: 32 };
  const plotW = Math.max(1, W - pad.l - pad.r);
  const plotH = H - pad.t - pad.b;

  const pts = series
    .map((s) => ({ raw: s.t, time: new Date(s.t).getTime(), followers: s.followers }))
    .filter((p) => Number.isFinite(p.time) && Number.isFinite(p.followers));
  if (!pts.length) return null;

  const low = Math.min(...pts.map((p) => p.followers));
  const high = Math.max(...pts.map((p) => p.followers));
  const ySpan = Math.max(1, high - low);
  const yLow = low - ySpan * 0.15;
  const yHigh = high + ySpan * 0.15;
  const tFirst = pts[0].time;
  const tLast = pts[pts.length - 1].time;
  const tSpan = tLast - tFirst;

  const xScale = (t: number) => (tSpan > 0 ? pad.l + ((t - tFirst) / tSpan) * plotW : pad.l + plotW / 2);
  const yScale = (v: number) => pad.t + plotH - ((v - yLow) / (yHigh - yLow)) * plotH;

  const path = pts
    .map((p, i) => `${i === 0 ? 'M' : 'L'}${xScale(p.time).toFixed(1)} ${yScale(p.followers).toFixed(1)}`)
    .join(' ');
  const drawAllDots = pts.length <= 48;
  const lastIndex = pts.length - 1;

  return (
    <div ref={wrapRef} className="xl-chart-wrap">
      <svg
        className="xl-chart"
        width={W}
        height={H}
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label="Follower snapshots over time"
      >
        {[high, low].map((v, i) => (
          <g key={`${v}-${i}`}>
            <line className="xl-grid" x1={pad.l} x2={W - pad.r} y1={yScale(v)} y2={yScale(v)} />
            <text x={pad.l - 8} y={yScale(v) + 4} textAnchor="end">
              {fmt(v)}
            </text>
          </g>
        ))}
        <line className="xl-baseline" x1={pad.l} x2={W - pad.r} y1={H - pad.b} y2={H - pad.b} />
        <text x={pad.l} y={H - 10} textAnchor="start">
          {fmtDate(pts[0].raw)}
        </text>
        {pts.length > 1 && (
          <text x={W - pad.r} y={H - 10} textAnchor="end">
            {fmtDate(pts[lastIndex].raw)}
          </text>
        )}
        {pts.length > 1 && <path className="xl-line" d={path} />}
        {pts.map((p, i) => {
          const isLatest = i === lastIndex;
          if (!drawAllDots && !isLatest) return null;
          return (
            <circle
              key={`${p.raw}-${i}`}
              className="xl-pt"
              data-latest={isLatest ? 'true' : undefined}
              cx={xScale(p.time)}
              cy={yScale(p.followers)}
              r={isLatest ? 5 : 3}
            >
              <title>{`${new Date(p.raw).toLocaleString()}: ${p.followers}`}</title>
            </circle>
          );
        })}
      </svg>
    </div>
  );
}

/** A ranked list of posts as a hairline table: mono date, post text, right-aligned mono numbers. */
function PostsSection({
  title,
  aside,
  posts,
  empty,
  note,
}: {
  title: string;
  aside?: string;
  posts: PostCard[];
  empty?: string;
  note?: SectionNote | null;
}) {
  return (
    <section className="atelier-section">
      <div className="atelier-section-head">
        <h2>
          {title}
          {aside ? (
            <>
              {' '}
              <em>{aside}</em>
            </>
          ) : null}
        </h2>
      </div>
      {posts.length ? (
        <div className="xl-scroll">
          <table className="xl-table" aria-label={title}>
            <thead>
              <tr>
                <th scope="col">Date</th>
                <th scope="col">Post</th>
                <th scope="col">Type</th>
                <th scope="col" className="xl-num">
                  Imp
                </th>
                <th scope="col" className="xl-num">
                  Eng
                </th>
                <th scope="col" className="xl-num">
                  ER
                </th>
              </tr>
            </thead>
            <tbody>
              {posts.map((p) => (
                <tr key={p.tweet_id}>
                  <td className="xl-date">{fmtDate(p.created_at)}</td>
                  <td className="xl-post">
                    <a
                      href={`https://x.com/i/status/${p.tweet_id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {p.text_preview || '—'}
                    </a>
                  </td>
                  <td className="xl-type">
                    {p.content_class}
                    {p.archetype && p.archetype !== 'other' ? <small>{p.archetype}</small> : null}
                  </td>
                  <td className="xl-num">{fmt(p.impression_count)}</td>
                  <td className="xl-num">{fmt(p.engagement_sum)}</td>
                  <td className="xl-num">{pct(p.engagement_rate, 2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="xl-empty-line">{empty || 'No rows.'}</p>
      )}
      <AnalysisDetails note={note} />
    </section>
  );
}

/* ── X Lab ──────────────────────────────────────────────────────────────────── */

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
  const [askedQ, setAskedQ] = useState('');
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
    // Fetch-on-mount/range-change: effect syncs with the external X Lab API.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load(range);
  }, [load, range]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const sp = new URLSearchParams(window.location.search);
    const xe = sp.get('x_error');
    // One-shot read of an external value (OAuth redirect query param).
    // eslint-disable-next-line react-hooks/set-state-in-effect
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
    setAskedQ(chatQ);
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

  const heatMax = useMemo(() => {
    if (!summary?.heatmap?.length) return 1;
    return Math.max(
      1,
      ...summary.heatmap.map((c) =>
        heatMetric === 'imp' ? c.median_impressions ?? 0 : c.median_engagement_sum ?? 0
      )
    );
  }, [summary, heatMetric]);

  // The one highlighted cell: the highest value in the grid, if there is any signal at all.
  const heatPeak = useMemo(() => {
    let best: { dow: number; hour: number; value: number } | null = null;
    for (const c of summary?.heatmap || []) {
      const value = heatMetric === 'imp' ? c.median_impressions ?? 0 : c.median_engagement_sum ?? 0;
      if (Number.isFinite(value) && value > 0 && (!best || value > best.value)) {
        best = { dow: c.dow, hour: c.hour, value };
      }
    }
    return best;
  }, [summary, heatMetric]);

  const tabs: { id: TabId; label: string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'replies', label: 'Reply lab' },
    { id: 'timing', label: 'Timing' },
    { id: 'posts', label: 'Posts' },
    { id: 'analyst', label: 'AI analyst' },
  ];

  const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const statusText = connected
    ? `Connected @${data?.connection?.username || '…'}`
    : oauthReady
      ? 'X not connected'
      : 'X OAuth env incomplete';
  const statusTone = connected ? 'live' : error ? 'warn' : undefined;

  const emptyTitle = connected
    ? 'Connected, with no summary yet.'
    : oauthReady
      ? 'X is not connected.'
      : 'Nothing to read yet.';
  const emptyBody = connected
    ? 'Use Refresh to pull in your posts. Medians and charts appear once there is data.'
    : oauthReady
      ? 'Use Connect X to authorize the account. Reach, replies, timing and the analyst appear once posts are in the warehouse.'
      : 'The X OAuth settings are not complete, so there is nothing to connect to yet. Reach, replies, timing and the analyst appear once posts are in the warehouse.';

  const figures: { label: string; value: string; sub: ReactNode }[] = [
    {
      label: 'Followers',
      value: fmt(kpis?.followersNow),
      sub: (
        <>
          <span className="xl-delta" data-dir={deltaDirection(kpis?.followersDeltaLast)}>
            {fmtDelta(kpis?.followersDeltaLast)}
          </span>{' '}
          since last snapshot
        </>
      ),
    },
    {
      label: 'Posts',
      value: fmt(kpis?.postsN),
      sub: `${pct(kpis?.replyShare, 0)} replies`,
    },
    {
      label: 'Median impressions',
      value: fmt(kpis?.medianImpressions),
      sub: `total ${fmt(kpis?.totalImpressions)}`,
    },
    {
      label: 'Median engagement',
      value: fmt(kpis?.medianEngagementSum, 1),
      sub: `ER ${pct(kpis?.medianEngagementRate, 2)} · overall ${pct(kpis?.overallER, 3)}`,
    },
    {
      label: 'Dead rate',
      value: pct(kpis?.deadRate, 0),
      sub: `winners ${pct(kpis?.winnerRate, 0)}`,
    },
    {
      label: 'Top 10% share of impressions',
      value: pct(summary?.pareto?.top10_share_impressions, 0),
      sub: `engagement ${pct(summary?.pareto?.top10_share_engagement, 0)}`,
    },
  ];

  const classMax = Math.max(1, ...(summary?.contentClasses || []).map((x) => x.median_engagement_sum ?? 0));
  const archetypeMax = Math.max(1, ...(summary?.replyArchetypes || []).map((x) => x.median_engagement_sum ?? 0));
  const hourMax = Math.max(1, ...(summary?.hours || []).map((x) => x.median_engagement_sum ?? 0));
  const dayMax = Math.max(1, ...(summary?.days || []).map((x) => x.median_engagement_sum ?? 0));
  const lengthMax = Math.max(
    0.001,
    ...(summary?.lengths || []).map((x) => x.median_engagement_rate ?? x.median_engagement_sum ?? 0)
  );

  const funnel = summary?.funnel;

  return (
    <div className="xl">
      {/* Connection and actions */}
      <section className="atelier-section xl-bar">
        <div className="xl-bar-row">
          <div className="xl-conn">
            <span className="atelier-status" data-tone={statusTone}>
              {statusText}
            </span>
            {data?.lastRefresh?.started_at ? (
              <span className="atelier-mono">
                Last refresh {fmtDateTime(data.lastRefresh.started_at)} ·{' '}
                {data.lastRefresh.posts_upserted ?? '—'} posts
              </span>
            ) : null}
          </div>
          <div className="xl-actions">
            <div className="xl-group" role="group" aria-label="Range">
              {(['7d', '30d', '90d', 'all'] as Range[]).map((r) => (
                <button
                  key={r}
                  type="button"
                  className="atelier-chip"
                  data-mono="true"
                  aria-pressed={range === r}
                  onClick={() => setRange(r)}
                >
                  {r}
                </button>
              ))}
            </div>
            {!connected ? (
              <a href="/api/x-lab/oauth/start" className="atelier-btn atelier-btn-primary">
                <Link2 className="w-3.5 h-3.5" aria-hidden="true" /> Connect X
              </a>
            ) : (
              <button
                type="button"
                disabled={refreshing}
                onClick={() => void onRefresh(false)}
                className="atelier-btn atelier-btn-primary"
              >
                {refreshing ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin motion-reduce:animate-none" aria-hidden="true" />
                ) : (
                  <RefreshCw className="w-3.5 h-3.5" aria-hidden="true" />
                )}
                Refresh
              </button>
            )}
          </div>
        </div>
        <p className="xl-note">
          Reach vs conversion, reply archetypes, funnel, Pareto and IST heat. Built to get the most
          from each Refresh. Medians and small-n honesty, not vanity dashboards.
        </p>
        {error && (
          <div className="atelier-notice" data-tone="warn" role="alert">
            <p style={{ margin: 0 }}>{error}</p>
          </div>
        )}
      </section>

      {loading && !summary ? (
        <section className="atelier-section">
          <div className="atelier-empty" role="status">
            <Loader2 className="w-5 h-5 animate-spin motion-reduce:animate-none" aria-hidden="true" />
            <p>Loading warehouse…</p>
          </div>
        </section>
      ) : !summary ? (
        <section className="atelier-section">
          <div className="atelier-empty">
            <h2 className="atelier-h2">{emptyTitle}</h2>
            <p>{emptyBody}</p>
          </div>
        </section>
      ) : (
        <>
          {/* Headline figures, always visible */}
          <section className="atelier-section">
            <ul className="xl-figures">
              {figures.map((f) => (
                <li key={f.label} className="xl-figure">
                  <span className="xl-figure-value">{f.value}</span>
                  <span className="xl-figure-label">{f.label}</span>
                  <span className="xl-figure-sub">{f.sub}</span>
                </li>
              ))}
            </ul>
            <AnalysisDetails note={notes.kpis} defaultOpen={false} />
          </section>

          <div className="xl-tabbar">
            <div className="atelier-tabs" role="tablist" aria-label="X Lab views">
              {tabs.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  role="tab"
                  className="atelier-tab"
                  aria-selected={tab === t.id}
                  onClick={() => setTab(t.id)}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {tab === 'overview' && (
            <>
              {/* Playbook */}
              <section className="atelier-section">
                <div className="atelier-section-head">
                  <h2>
                    Growth playbook <em>from your warehouse.</em>
                  </h2>
                </div>
                {(summary?.playbook || []).length ? (
                  <ul className="atelier-rows xl-playbook">
                    {(summary?.playbook || []).map((item, i) => (
                      <li key={i} className="atelier-row">
                        <span className="atelier-status" data-tone={SEVERITY_TONE[item.severity]}>
                          {capitalize(item.severity)}
                        </span>
                        <div>
                          <p className="atelier-row-title">{item.title}</p>
                          <p className="atelier-row-note">{item.detail}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="xl-empty-line">No playbook items for this range.</p>
                )}
                <AnalysisDetails note={notes.playbook} />
              </section>

              <section className="atelier-section">
                <div className="xl-pair">
                  {/* Funnel */}
                  <div>
                    <h2 className="atelier-h2">Engagement funnel</h2>
                    <ul className="xl-bars">
                      <BarRow
                        label="Posts"
                        value={funnel?.n ?? 0}
                        max={funnel?.n ?? 1}
                        hint={fmt(funnel?.n ?? 0)}
                      />
                      <BarRow
                        label="Have impressions"
                        value={funnel?.with_impressions ?? 0}
                        max={funnel?.n ?? 1}
                        hint={fmt(funnel?.with_impressions ?? 0)}
                      />
                      <BarRow
                        label="Any engagement"
                        value={funnel?.with_any_engagement ?? 0}
                        max={funnel?.with_impressions ?? 1}
                        hint={`${fmt(funnel?.with_any_engagement ?? 0)} · ${pct(
                          funnel?.imp_to_eng_rate,
                          0
                        )} of prev`}
                      />
                      <BarRow
                        label="Reply-back"
                        value={funnel?.with_reply_back ?? 0}
                        max={funnel?.with_any_engagement ?? 1}
                        hint={`${fmt(funnel?.with_reply_back ?? 0)} · ${pct(
                          funnel?.eng_to_reply_rate,
                          0
                        )} of prev`}
                      />
                    </ul>
                    <AnalysisDetails note={notes.funnel} />
                  </div>

                  {/* Class comparison */}
                  <div>
                    <h2 className="atelier-h2">Original vs reply</h2>
                    <ul className="xl-bars">
                      {(summary?.contentClasses || []).map((c) => (
                        <BarRow
                          key={c.content_class}
                          label={`${c.content_class} · n=${c.n} (${pct(c.share, 0)})`}
                          value={c.median_engagement_sum ?? 0}
                          max={classMax}
                          hint={`med eng ${fmt(c.median_engagement_sum, 1)} · ER ${pct(
                            c.median_engagement_rate,
                            2
                          )} · dead ${pct(c.dead_rate, 0)}`}
                          faded={!c.reliable}
                          highlight
                        />
                      ))}
                    </ul>
                    {!summary?.contentClasses?.length && (
                      <p className="xl-empty-line">No posts in range.</p>
                    )}
                    <AnalysisDetails note={notes.contentClass} />
                  </div>
                </div>
              </section>

              {/* Scatter */}
              <section className="atelier-section">
                <div className="atelier-section-head">
                  <h2>Reach × conversion map</h2>
                  <div className="xl-group" role="group" aria-label="Post type">
                    {(['all', 'reply', 'original'] as ClassFilter[]).map((f) => (
                      <button
                        key={f}
                        type="button"
                        className="atelier-chip"
                        aria-pressed={classFilter === f}
                        onClick={() => setClassFilter(f)}
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
                  <div className="xl-pinned">
                    <span className="atelier-label">
                      Pinned · {selectedPt.content_class} · {selectedPt.archetype}
                    </span>
                    <p className="xl-pinned-text">{selectedPt.text_preview}</p>
                    <p className="atelier-mono">
                      imp {fmt(selectedPt.x_impressions)} · eng {fmt(selectedPt.y_engagement)} · ER{' '}
                      {pct(selectedPt.er, 2)} · hour IST {selectedPt.hour_ist}
                    </p>
                    <p>
                      <a
                        href={`https://x.com/i/status/${selectedPt.tweet_id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="atelier-link"
                      >
                        Open on X
                      </a>
                    </p>
                  </div>
                )}
                <AnalysisDetails note={notes.scatter} />
              </section>

              <section className="atelier-section">
                <div className="xl-pair">
                  {/* Followers */}
                  <div>
                    <h2 className="atelier-h2">Follower snapshots</h2>
                    {!series.length ? (
                      <p className="xl-empty-line">Need more Refresh runs to draw a curve.</p>
                    ) : (
                      <FollowerLine series={series} />
                    )}
                    <AnalysisDetails note={notes.followers} />
                  </div>

                  {/* Length */}
                  <div>
                    <h2 className="atelier-h2">Length buckets</h2>
                    <ul className="xl-bars">
                      {(summary?.lengths || []).map((b) => (
                        <BarRow
                          key={b.id}
                          label={`${b.label} · n=${b.n}`}
                          value={b.median_engagement_rate ?? b.median_engagement_sum ?? 0}
                          max={lengthMax}
                          hint={`ER ${pct(b.median_engagement_rate, 2)} · dead ${pct(b.dead_rate, 0)}`}
                          faded={!b.reliable}
                          highlight
                        />
                      ))}
                    </ul>
                    <AnalysisDetails note={notes.lengths} />
                  </div>
                </div>
              </section>
            </>
          )}

          {tab === 'replies' && (
            <>
              <section className="atelier-section">
                <div className="atelier-section-head">
                  <h2>Reply archetypes</h2>
                </div>
                <p className="xl-lead">
                  Classified from text: additive take, question, agreement-only, story, off-topic.
                  Kill high dead-rate archetypes.
                </p>
                <ul className="xl-bars">
                  {(summary?.replyArchetypes || []).map((a) => (
                    <BarRow
                      key={a.archetype}
                      label={`${a.archetype} · n=${a.n}`}
                      value={a.median_engagement_sum ?? 0}
                      max={archetypeMax}
                      hint={`med eng ${fmt(a.median_engagement_sum, 1)} · imp ${fmt(
                        a.median_impressions
                      )} · dead ${pct(a.dead_rate, 0)}`}
                      faded={!a.reliable}
                      tone={
                        a.archetype === 'off_topic' || a.archetype === 'agreement_only'
                          ? 'clay'
                          : undefined
                      }
                      highlight
                    />
                  ))}
                </ul>
                {!summary?.replyArchetypes?.length && (
                  <p className="xl-empty-line">No replies in range.</p>
                )}
                <AnalysisDetails note={notes.replyArchetypes} defaultOpen />
              </section>
              <PostsSection
                title="Best replies"
                aside="Conversion-weighted."
                posts={summary?.leaderboards?.bestReplies || []}
                note={notes.bestReplies}
              />
              <PostsSection
                title="Dead / weak replies"
                aside="Stop these patterns."
                posts={summary?.leaderboards?.worstReplies || []}
                note={notes.worstReplies}
              />
            </>
          )}

          {tab === 'timing' && (
            <>
              <section className="atelier-section">
                <div className="xl-pair">
                  <div>
                    <h2 className="atelier-h2">Hour of day (IST)</h2>
                    <ul className="xl-bars" data-scroll="true">
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
                            max={hourMax}
                            hint={`eng ${fmt(h.median_engagement_sum, 1)} · med imp ${fmt(
                              h.median_impressions
                            )}`}
                            faded={!h.reliable}
                            highlight
                          />
                        ))}
                    </ul>
                    <AnalysisDetails note={notes.hours} />
                  </div>
                  <div>
                    <h2 className="atelier-h2">Day of week (IST)</h2>
                    <ul className="xl-bars">
                      {(summary?.days || []).map((d) => (
                        <BarRow
                          key={d.dow}
                          label={`${d.label} · n=${d.n}`}
                          value={d.median_engagement_sum ?? 0}
                          max={dayMax}
                          hint={`eng ${fmt(d.median_engagement_sum, 1)} · imp ${fmt(
                            d.median_impressions
                          )}`}
                          faded={!d.reliable}
                          highlight
                        />
                      ))}
                    </ul>
                    <AnalysisDetails note={notes.days} />
                  </div>
                </div>
              </section>

              <section className="atelier-section">
                <div className="atelier-section-head">
                  <h2>
                    Heatmap <em>hour × day (IST).</em>
                  </h2>
                  <div className="xl-group" role="group" aria-label="Heatmap measure">
                    {(
                      [
                        ['eng', 'Engagement'],
                        ['imp', 'Impressions'],
                      ] as const
                    ).map(([id, label]) => (
                      <button
                        key={id}
                        type="button"
                        className="atelier-chip"
                        aria-pressed={heatMetric === id}
                        onClick={() => setHeatMetric(id)}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="xl-scroll">
                  <div className="xl-heat">
                    <div />
                    {Array.from({ length: 24 }, (_, h) => (
                      <div key={h} className="xl-heat-h">
                        {h}
                      </div>
                    ))}
                    {dayLabels.map((label, dow) => (
                      <div key={label} className="contents">
                        <div className="xl-heat-d">{label}</div>
                        {Array.from({ length: 24 }, (_, hour) => {
                          const cell = summary?.heatmap?.find(
                            (c) => c.dow === dow && c.hour === hour
                          );
                          const v =
                            heatMetric === 'imp'
                              ? cell?.median_impressions ?? 0
                              : cell?.median_engagement_sum ?? 0;
                          const n = cell?.n ?? 0;
                          const intensity = heatMax > 0 && Number.isFinite(v) ? v / heatMax : 0;
                          const isPeak = heatPeak?.dow === dow && heatPeak?.hour === hour;
                          return (
                            <div
                              key={`${dow}-${hour}`}
                              title={`${label} ${hour}:00 · n=${n} · ${heatMetric} ${v}`}
                              className="xl-cell"
                              data-peak={isPeak ? 'true' : undefined}
                              style={{
                                background:
                                  isPeak || n === 0
                                    ? undefined
                                    : `color-mix(in srgb, var(--forest) ${Math.round(
                                        8 + intensity * 80
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
                <p className="xl-small">
                  A stronger fill is a higher value.
                  {heatPeak
                    ? ` Papaya marks the peak: ${dayLabels[heatPeak.dow] ?? heatPeak.dow} ${String(
                        heatPeak.hour
                      ).padStart(2, '0')}:00.`
                    : ''}{' '}
                  Faded cells rest on a small sample.
                </p>
                <AnalysisDetails note={notes.heatmap} />
              </section>
            </>
          )}

          {tab === 'posts' && (
            <>
              <PostsSection
                title="Reach leaders"
                aside="log-imp × eng."
                posts={summary?.leaderboards?.reach || []}
                note={notes.reachBoard}
              />
              <PostsSection
                title="Conversion leaders"
                aside="ER-weighted."
                posts={summary?.leaderboards?.conversion || []}
                note={notes.conversionBoard}
              />
              <PostsSection
                title="Best originals"
                posts={summary?.leaderboards?.bestOriginals || []}
                note={notes.bestOriginals}
              />
              <PostsSection
                title="Best replies"
                posts={summary?.leaderboards?.bestReplies || []}
                note={notes.bestReplies}
              />
            </>
          )}

          {tab === 'analyst' && (
            <section className="atelier-section">
              <div className="atelier-section-head">
                <h2>AI growth analyst</h2>
                <div className="xl-group" role="group" aria-label="Model provider">
                  {(['meta', 'openrouter'] as const).map((p) => (
                    <button
                      key={p}
                      type="button"
                      className="atelier-chip"
                      data-mono="true"
                      aria-pressed={provider === p}
                      onClick={() => setProvider(p)}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
              <p className="xl-lead">
                Reads playbook, archetypes, funnel, Pareto, and leaderboards for the selected range.
                Ask for experiments, not slogans.
              </p>
              <ul className="xl-suggest">
                {[
                  'What reply patterns should I kill this week?',
                  'Compare originals vs replies for growth.',
                  'Which IST hours should I prioritize for replies vs originals?',
                  'Design 3 experiments from the dead-rate and archetype data.',
                ].map((q) => (
                  <li key={q}>
                    <button type="button" onClick={() => setChatQ(q)}>
                      {q}
                    </button>
                  </li>
                ))}
              </ul>
              <div className="xl-compose">
                <label className="atelier-label" htmlFor="xl-question">
                  Your question
                </label>
                <textarea
                  id="xl-question"
                  value={chatQ}
                  onChange={(e) => setChatQ(e.target.value)}
                  rows={3}
                  placeholder="Ask about your warehouse…"
                  className="atelier-input"
                  style={{ minHeight: '5.5rem' }}
                />
                <div className="xl-compose-actions">
                  <button
                    type="button"
                    disabled={chatBusy || !chatQ.trim() || !summary}
                    onClick={() => void onChat()}
                    className="atelier-btn atelier-btn-line"
                  >
                    {chatBusy && (
                      <Loader2 className="w-3.5 h-3.5 animate-spin motion-reduce:animate-none" aria-hidden="true" />
                    )}
                    Ask analyst
                  </button>
                </div>
              </div>
              {askedQ && (chatBusy || chatA) && (
                <div className="xl-transcript" aria-live="polite">
                  <div className="xl-turn">
                    <span className="atelier-label">You asked</span>
                    <p className="xl-turn-q">{askedQ}</p>
                  </div>
                  <div className="xl-turn">
                    <span className="atelier-label">Analyst</span>
                    {chatBusy && !chatA ? (
                      <p className="xl-turn-a" style={{ color: 'var(--ink-2)' }}>
                        Reading the warehouse…
                      </p>
                    ) : (
                      <p className="xl-turn-a">{chatA}</p>
                    )}
                  </div>
                </div>
              )}
            </section>
          )}
        </>
      )}
    </div>
  );
}

export default XLabClient;
