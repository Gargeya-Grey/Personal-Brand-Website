/**
 * X Lab growth analytics — pure functions over warehouse rows.
 * Standards: medians, rates, small-n guards, association not causation.
 * Growth focus: reach vs conversion, reply archetypes, hour/length, Pareto.
 */

export type LabPostRow = {
  tweet_id: string;
  created_at: string;
  created_at_ist_hour: number;
  created_at_ist_dow: number;
  text: string;
  content_class: string;
  is_reply: boolean;
  like_count: number;
  reply_count: number;
  repost_count: number;
  quote_count: number;
  bookmark_count: number;
  impression_count: number | null;
  engagement_sum: number;
  engagement_rate: number | null;
  char_count: number;
  linked_pack_id?: string | null;
  linked_draft_id?: string | null;
};

export type AccountSnapshotRow = {
  captured_at: string;
  followers_count: number;
  following_count: number;
  tweet_count: number;
  listed_count: number;
};

export type ReplyArchetype =
  | 'additive_take'
  | 'question'
  | 'agreement_only'
  | 'story_or_scene'
  | 'off_topic'
  | 'other';

export const MIN_N_RANK = 5;
export const MIN_IMP_FOR_ER = 15; // tiny-imp ER is noise
export const DOW_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const VENN_RE =
  /\b(ai|llm|model|agent|learn|learning|student|teach|tutor|practice|process|assess|cognition|psych|think|tool|build|builder|open.?source|weights|prompt|judg(?:e|ment)|education|school|code|product|founder)\b/i;

const AGREEMENT_RE =
  /^(yeah|yep|true|exactly|this|agree|absolutely|well said|couldn't have|spot on|so true|correct|facts)/i;

export function median(nums: number[]): number | null {
  if (!nums.length) return null;
  const a = [...nums].sort((x, y) => x - y);
  const mid = Math.floor(a.length / 2);
  return a.length % 2 ? a[mid] : (a[mid - 1] + a[mid]) / 2;
}

export function mean(nums: number[]): number | null {
  if (!nums.length) return null;
  return nums.reduce((s, n) => s + n, 0) / nums.length;
}

export function percentile(nums: number[], p: number): number | null {
  if (!nums.length) return null;
  const a = [...nums].sort((x, y) => x - y);
  const idx = Math.min(a.length - 1, Math.max(0, Math.ceil((p / 100) * a.length) - 1));
  return a[idx];
}

export function filterPostsByRange(
  posts: LabPostRow[],
  range: '7d' | '30d' | '90d' | 'all',
  now = new Date()
): LabPostRow[] {
  if (range === 'all') return posts;
  const days = range === '7d' ? 7 : range === '30d' ? 30 : 90;
  const cutoff = now.getTime() - days * 86400000;
  return posts.filter((p) => new Date(p.created_at).getTime() >= cutoff);
}

/** Strip leading @handles for body analysis */
export function bodyWithoutHandles(text: string): string {
  return String(text || '')
    .replace(/^(@\w+\s*)+/g, '')
    .trim();
}

export function classifyReplyArchetype(p: LabPostRow): ReplyArchetype {
  if (p.content_class !== 'reply' && !p.is_reply) return 'other';
  const body = bodyWithoutHandles(p.text);
  const lower = body.toLowerCase();
  if (!body) return 'other';
  if (body.includes('?') && body.length < 220) return 'question';
  if (
    AGREEMENT_RE.test(body) &&
    body.length < 120 &&
    !/\b(but|however|except|still|though)\b/i.test(body)
  ) {
    return 'agreement_only';
  }
  if (
    /\b(I |I'm |I've |when I |last |used to |my )\b/i.test(body) &&
    body.length > 100
  ) {
    return 'story_or_scene';
  }
  if (!VENN_RE.test(body) && body.length < 200) return 'off_topic';
  if (VENN_RE.test(body) || body.length >= 100) return 'additive_take';
  return 'other';
}

export function textFeatures(p: LabPostRow) {
  const body = bodyWithoutHandles(p.text);
  const paras = body.split(/\n\s*\n/).filter(Boolean).length || (body ? 1 : 0);
  return {
    body_chars: body.length,
    word_count: body.split(/\s+/).filter(Boolean).length,
    has_question: body.includes('?'),
    paragraph_count: paras,
    has_venn: VENN_RE.test(body),
    is_micro: body.length > 0 && body.length <= 80,
    is_long: body.length >= 220,
    archetype: classifyReplyArchetype(p),
  };
}

/** Reliable ER only when impressions clear a floor */
export function reliableER(p: LabPostRow): number | null {
  if (
    p.impression_count != null &&
    p.impression_count >= MIN_IMP_FOR_ER &&
    p.engagement_rate != null &&
    Number.isFinite(p.engagement_rate)
  ) {
    return p.engagement_rate;
  }
  return null;
}

export function engagementScore(p: LabPostRow): number {
  const er = reliableER(p);
  if (er != null) return er;
  const imp = p.impression_count ?? 0;
  return Math.log1p(p.engagement_sum) * Math.log1p(imp);
}

/** Growth dual-axis: reach power vs conversion power */
export function reachScore(p: LabPostRow): number {
  return Math.log1p(p.impression_count ?? 0) * Math.log1p(1 + p.engagement_sum);
}

export function conversionScore(p: LabPostRow): number {
  const er = reliableER(p);
  if (er != null) return er * Math.log1p(p.impression_count ?? 0);
  return p.engagement_sum / Math.max(10, p.impression_count ?? 10);
}

export function isDeadPost(p: LabPostRow): boolean {
  return p.engagement_sum === 0 && (p.impression_count ?? 0) < 80;
}

export function isWinner(p: LabPostRow, p75Eng: number, p75Imp: number): boolean {
  return (
    p.engagement_sum >= Math.max(2, p75Eng) ||
    (p.impression_count ?? 0) >= Math.max(100, p75Imp)
  );
}

export function buildKpis(
  posts: LabPostRow[],
  snapshots: AccountSnapshotRow[]
): {
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
} {
  const sortedSnaps = [...snapshots].sort(
    (a, b) => new Date(a.captured_at).getTime() - new Date(b.captured_at).getTime()
  );
  const latest = sortedSnaps[sortedSnaps.length - 1] ?? null;
  const prev = sortedSnaps.length >= 2 ? sortedSnaps[sortedSnaps.length - 2] : null;
  const followersNow = latest?.followers_count ?? null;
  const followersDeltaLast =
    latest && prev ? latest.followers_count - prev.followers_count : null;

  const now = Date.now();
  const findNear = (msAgo: number) => {
    if (!latest) return null;
    const target = now - msAgo;
    let best: AccountSnapshotRow | null = null;
    let bestDist = Infinity;
    for (const s of sortedSnaps) {
      const t = new Date(s.captured_at).getTime();
      const dist = Math.abs(t - target);
      if (dist < bestDist) {
        bestDist = dist;
        best = s;
      }
    }
    if (best && bestDist <= 2 * 86400000) return best;
    return sortedSnaps[0] ?? null;
  };

  const s7 = findNear(7 * 86400000);
  const s30 = findNear(30 * 86400000);
  const followersDelta7d =
    latest && s7 ? latest.followers_count - s7.followers_count : null;
  const followersDelta30d =
    latest && s30 ? latest.followers_count - s30.followers_count : null;

  const withImp = posts.filter((p) => p.impression_count != null && p.impression_count > 0);
  const engArr = posts.map((p) => p.engagement_sum);
  const impArr = withImp.map((p) => p.impression_count as number);
  const p75E = percentile(engArr, 75) ?? 0;
  const p75I = percentile(impArr, 75) ?? 0;
  const deadN = posts.filter(isDeadPost).length;
  const winN = posts.filter((p) => isWinner(p, p75E, p75I)).length;
  const totalImpressions = withImp.reduce((s, p) => s + (p.impression_count || 0), 0);
  const totalEngagement = posts.reduce((s, p) => s + p.engagement_sum, 0);
  const replies = posts.filter((p) => p.content_class === 'reply' || p.is_reply).length;
  const originals = posts.filter((p) => p.content_class === 'original').length;

  return {
    followersNow,
    followersDeltaLast,
    followersDelta7d,
    followersDelta30d,
    postsN: posts.length,
    replyShare: posts.length ? replies / posts.length : 0,
    originalShare: posts.length ? originals / posts.length : 0,
    medianLikes: median(posts.map((p) => p.like_count)),
    medianEngagementSum: median(engArr),
    medianEngagementRate: median(
      posts.map((p) => reliableER(p)).filter((x): x is number => x != null)
    ),
    medianImpressions: median(impArr),
    p75Engagement: percentile(engArr, 75),
    p90Engagement: percentile(engArr, 90),
    deadRate: posts.length ? deadN / posts.length : 0,
    winnerRate: posts.length ? winN / posts.length : 0,
    impressionCoverage: posts.length ? withImp.length / posts.length : 0,
    linkedToPackN: posts.filter((p) => p.linked_pack_id).length,
    totalImpressions,
    totalEngagement,
    overallER: totalImpressions > 0 ? totalEngagement / totalImpressions : null,
  };
}

function groupStats<T extends string>(
  posts: LabPostRow[],
  keyFn: (p: LabPostRow) => T
) {
  const groups = new Map<T, LabPostRow[]>();
  for (const p of posts) {
    const k = keyFn(p);
    if (!groups.has(k)) groups.set(k, []);
    groups.get(k)!.push(p);
  }
  return [...groups.entries()]
    .map(([key, rows]) => {
      const eng = rows.map((r) => r.engagement_sum);
      const imp = rows
        .map((r) => r.impression_count)
        .filter((x): x is number => x != null && x > 0);
      const ers = rows.map((r) => reliableER(r)).filter((x): x is number => x != null);
      const dead = rows.filter(isDeadPost).length;
      return {
        key: String(key),
        n: rows.length,
        median_likes: median(rows.map((r) => r.like_count)),
        median_engagement_sum: median(eng),
        median_impressions: median(imp),
        median_engagement_rate: median(ers),
        mean_engagement_sum: mean(eng),
        total_impressions: imp.reduce((s, n) => s + n, 0),
        total_engagement: eng.reduce((s, n) => s + n, 0),
        dead_rate: rows.length ? dead / rows.length : 0,
        share: posts.length ? rows.length / posts.length : 0,
        reliable: rows.length >= MIN_N_RANK,
      };
    })
    .sort((a, b) => (b.median_engagement_sum ?? 0) - (a.median_engagement_sum ?? 0));
}

export function byContentClass(posts: LabPostRow[]) {
  return groupStats(posts, (p) => p.content_class || 'original').map((r) => ({
    content_class: r.key,
    ...r,
  }));
}

export function byReplyArchetype(posts: LabPostRow[]) {
  const replies = posts.filter((p) => p.content_class === 'reply' || p.is_reply);
  return groupStats(replies, (p) => classifyReplyArchetype(p)).map((r) => ({
    archetype: r.key,
    ...r,
  }));
}

export function hourOfDayIst(posts: LabPostRow[]) {
  return Array.from({ length: 24 }, (_, hour) => {
    const rows = posts.filter((p) => p.created_at_ist_hour === hour);
    const eng = rows.map((r) => r.engagement_sum);
    const imp = rows
      .map((r) => r.impression_count)
      .filter((x): x is number => x != null && x > 0);
    return {
      hour,
      n: rows.length,
      median_likes: median(rows.map((r) => r.like_count)),
      median_engagement_sum: median(eng),
      median_impressions: median(imp),
      median_engagement_rate: median(
        rows.map((r) => reliableER(r)).filter((x): x is number => x != null)
      ),
      total_impressions: imp.reduce((s, n) => s + n, 0),
      reliable: rows.length >= MIN_N_RANK,
    };
  });
}

export function dayOfWeekIst(posts: LabPostRow[]) {
  return Array.from({ length: 7 }, (_, dow) => {
    const rows = posts.filter((p) => p.created_at_ist_dow === dow);
    return {
      dow,
      label: DOW_LABELS[dow],
      n: rows.length,
      median_likes: median(rows.map((r) => r.like_count)),
      median_engagement_sum: median(rows.map((r) => r.engagement_sum)),
      median_impressions: median(
        rows
          .map((r) => r.impression_count)
          .filter((x): x is number => x != null && x > 0)
      ),
      median_engagement_rate: median(
        rows.map((r) => reliableER(r)).filter((x): x is number => x != null)
      ),
      reliable: rows.length >= MIN_N_RANK,
    };
  });
}

export function heatmapIst(posts: LabPostRow[]) {
  const cells: {
    hour: number;
    dow: number;
    n: number;
    median_engagement_sum: number | null;
    median_impressions: number | null;
    reliable: boolean;
  }[] = [];
  for (let dow = 0; dow < 7; dow++) {
    for (let hour = 0; hour < 24; hour++) {
      const rows = posts.filter(
        (p) => p.created_at_ist_hour === hour && p.created_at_ist_dow === dow
      );
      cells.push({
        hour,
        dow,
        n: rows.length,
        median_engagement_sum: median(rows.map((r) => r.engagement_sum)),
        median_impressions: median(
          rows
            .map((r) => r.impression_count)
            .filter((x): x is number => x != null && x > 0)
        ),
        reliable: rows.length >= 3,
      });
    }
  }
  return cells;
}

export function lengthBuckets(posts: LabPostRow[]) {
  const defs = [
    { id: 'micro', label: '≤80 chars', min: 0, max: 80 },
    { id: 'short', label: '81–160', min: 81, max: 160 },
    { id: 'medium', label: '161–280', min: 161, max: 280 },
    { id: 'long', label: '281+', min: 281, max: 1e9 },
  ];
  return defs.map((d) => {
    const rows = posts.filter((p) => {
      const c = bodyWithoutHandles(p.text).length || p.char_count;
      return c >= d.min && c <= d.max;
    });
    return {
      id: d.id,
      label: d.label,
      n: rows.length,
      median_likes: median(rows.map((r) => r.like_count)),
      median_engagement_sum: median(rows.map((r) => r.engagement_sum)),
      median_impressions: median(
        rows
          .map((r) => r.impression_count)
          .filter((x): x is number => x != null && x > 0)
      ),
      median_engagement_rate: median(
        rows.map((r) => reliableER(r)).filter((x): x is number => x != null)
      ),
      dead_rate: rows.length
        ? rows.filter(isDeadPost).length / rows.length
        : 0,
      reliable: rows.length >= MIN_N_RANK,
    };
  });
}

export function funnelMetrics(posts: LabPostRow[]) {
  const withImp = posts.filter((p) => (p.impression_count ?? 0) > 0);
  const withEng = posts.filter((p) => p.engagement_sum > 0);
  const withReplyBack = posts.filter((p) => p.reply_count > 0);
  const withRepost = posts.filter((p) => p.repost_count > 0);
  return {
    n: posts.length,
    with_impressions: withImp.length,
    with_any_engagement: withEng.length,
    with_reply_back: withReplyBack.length,
    with_repost: withRepost.length,
    imp_to_eng_rate: withImp.length
      ? withEng.filter((p) => (p.impression_count ?? 0) > 0).length / withImp.length
      : null,
    eng_to_reply_rate: withEng.length ? withReplyBack.length / withEng.length : null,
  };
}

/** Pareto: top share of impressions / engagement */
export function pareto(posts: LabPostRow[]) {
  const byImp = [...posts]
    .filter((p) => (p.impression_count ?? 0) > 0)
    .sort((a, b) => (b.impression_count ?? 0) - (a.impression_count ?? 0));
  const byEng = [...posts].sort((a, b) => b.engagement_sum - a.engagement_sum);
  const totalImp = byImp.reduce((s, p) => s + (p.impression_count || 0), 0);
  const totalEng = byEng.reduce((s, p) => s + p.engagement_sum, 0);
  const top10n = Math.max(1, Math.ceil(posts.length * 0.1));
  const top10Imp = byImp
    .slice(0, top10n)
    .reduce((s, p) => s + (p.impression_count || 0), 0);
  const top10Eng = byEng.slice(0, top10n).reduce((s, p) => s + p.engagement_sum, 0);
  return {
    top10_share_impressions: totalImp ? top10Imp / totalImp : null,
    top10_share_engagement: totalEng ? top10Eng / totalEng : null,
    top10_n: top10n,
  };
}

export function scatterPoints(posts: LabPostRow[], limit = 100) {
  return [...posts]
    .filter((p) => (p.impression_count ?? 0) > 0)
    .sort((a, b) => (b.impression_count ?? 0) - (a.impression_count ?? 0))
    .slice(0, limit)
    .map((p) => ({
      tweet_id: p.tweet_id,
      x_impressions: p.impression_count ?? 0,
      y_engagement: p.engagement_sum,
      er: reliableER(p),
      content_class: p.content_class,
      archetype: classifyReplyArchetype(p),
      hour_ist: p.created_at_ist_hour,
      text_preview: bodyWithoutHandles(p.text).slice(0, 100),
      is_dead: isDeadPost(p),
    }));
}

function mapPostCard(p: LabPostRow) {
  const feat = textFeatures(p);
  return {
    tweet_id: p.tweet_id,
    created_at: p.created_at,
    content_class: p.content_class,
    archetype: feat.archetype,
    like_count: p.like_count,
    reply_count: p.reply_count,
    repost_count: p.repost_count,
    bookmark_count: p.bookmark_count,
    impression_count: p.impression_count,
    engagement_sum: p.engagement_sum,
    engagement_rate: reliableER(p),
    reach_score: reachScore(p),
    conversion_score: conversionScore(p),
    hour_ist: p.created_at_ist_hour,
    body_chars: feat.body_chars,
    has_venn: feat.has_venn,
    text_preview: bodyWithoutHandles(p.text).slice(0, 160),
    linked_pack_id: p.linked_pack_id ?? null,
  };
}

export function leaderboards(posts: LabPostRow[], limit = 12) {
  const reach = [...posts]
    .sort((a, b) => reachScore(b) - reachScore(a))
    .slice(0, limit)
    .map(mapPostCard);
  const conversion = [...posts]
    .filter((p) => reliableER(p) != null || p.engagement_sum > 0)
    .sort((a, b) => conversionScore(b) - conversionScore(a))
    .slice(0, limit)
    .map(mapPostCard);
  const repliesOnly = posts.filter((p) => p.content_class === 'reply' || p.is_reply);
  const bestReplies = [...repliesOnly]
    .sort((a, b) => conversionScore(b) - conversionScore(a) || b.engagement_sum - a.engagement_sum)
    .slice(0, limit)
    .map(mapPostCard);
  const worstReplies = [...repliesOnly]
    .filter((p) => isDeadPost(p) || p.engagement_sum === 0)
    .slice(0, limit)
    .map(mapPostCard);
  const originals = posts.filter((p) => p.content_class === 'original');
  const bestOriginals = [...originals]
    .sort((a, b) => conversionScore(b) - conversionScore(a))
    .slice(0, limit)
    .map(mapPostCard);
  return { reach, conversion, bestReplies, worstReplies, bestOriginals };
}

export function growthPlaybook(
  posts: LabPostRow[],
  kpis: ReturnType<typeof buildKpis>,
  byClass: ReturnType<typeof byContentClass>,
  archetypes: ReturnType<typeof byReplyArchetype>,
  hours: ReturnType<typeof hourOfDayIst>,
  lengths: ReturnType<typeof lengthBuckets>,
  funnel: ReturnType<typeof funnelMetrics>,
  par: ReturnType<typeof pareto>
): { severity: 'critical' | 'high' | 'medium' | 'info'; title: string; detail: string }[] {
  const out: {
    severity: 'critical' | 'high' | 'medium' | 'info';
    title: string;
    detail: string;
  }[] = [];

  out.push({
    severity: 'info',
    title: `Sample n=${kpis.postsN}`,
    detail: `Impression coverage ${(kpis.impressionCoverage * 100).toFixed(0)}%. Overall eng/imp ${
      kpis.overallER != null ? (kpis.overallER * 100).toFixed(3) + '%' : '—'
    }. Dead post rate ${(kpis.deadRate * 100).toFixed(0)}%. Associations only.`,
  });

  if (kpis.replyShare >= 0.75) {
    out.push({
      severity: 'critical',
      title: 'Reply-heavy feed',
      detail: `${(kpis.replyShare * 100).toFixed(0)}% of warehouse posts are replies vs ${(
        kpis.originalShare * 100
      ).toFixed(0)}% originals. Growth compounds on originals + selective high-signal replies — not reply spam.`,
    });
  }

  const orig = byClass.find((c) => c.content_class === 'original');
  const rep = byClass.find((c) => c.content_class === 'reply');
  if (orig && rep && orig.n >= 3 && rep.n >= 5) {
    const oER = orig.median_engagement_rate ?? 0;
    const rER = rep.median_engagement_rate ?? 0;
    if (oER > rER * 2 || (orig.median_engagement_sum ?? 0) > (rep.median_engagement_sum ?? 0)) {
      out.push({
        severity: 'high',
        title: 'Originals convert harder than replies',
        detail: `Originals: med eng ${orig.median_engagement_sum?.toFixed(1) ?? '—'}, med ER ${
          oER ? (oER * 100).toFixed(1) + '%' : '—'
        }, n=${orig.n}. Replies: med eng ${rep.median_engagement_sum?.toFixed(1) ?? '—'}, med ER ${
          rER ? (rER * 100).toFixed(1) + '%' : '—'
        }, n=${rep.n}, dead ${(rep.dead_rate * 100).toFixed(0)}%. Double down on owned posts.`,
      });
    }
  }

  const reliableArch = archetypes.filter((a) => a.reliable || a.n >= 3);
  if (reliableArch.length) {
    const sorted = [...reliableArch].sort(
      (a, b) => (b.median_engagement_sum ?? 0) - (a.median_engagement_sum ?? 0)
    );
    const best = sorted[0];
    const worst = [...reliableArch].sort((a, b) => b.dead_rate - a.dead_rate)[0];
    out.push({
      severity: 'high',
      title: 'Reply archetype signal',
      detail: `Best med eng so far: ${best.archetype} (n=${best.n}, med eng ${
        best.median_engagement_sum?.toFixed(1) ?? '—'
      }). Highest dead rate: ${worst.archetype} (${(worst.dead_rate * 100).toFixed(
        0
      )}% dead, n=${worst.n}). Kill agreement-only and off-topic replies.`,
    });
  }

  const off = archetypes.find((a) => a.archetype === 'off_topic');
  if (off && off.n >= 5) {
    out.push({
      severity: 'critical',
      title: 'Off-topic replies burn sample',
      detail: `${off.n} replies look off-Venn (no AI/learn/build signal). Med eng ${
        off.median_engagement_sum?.toFixed(1) ?? '—'
      }, dead ${(off.dead_rate * 100).toFixed(0)}%. Scout should only touch Venn heat.`,
    });
  }

  if (funnel.imp_to_eng_rate != null) {
    out.push({
      severity: funnel.imp_to_eng_rate < 0.35 ? 'high' : 'medium',
      title: 'Impression → engagement funnel',
      detail: `${(funnel.imp_to_eng_rate * 100).toFixed(
        0
      )}% of posts with impressions get any engagement. ${funnel.with_reply_back} posts earned a reply-back. Weak hooks = free impressions wasted.`,
    });
  }

  if (par.top10_share_impressions != null && par.top10_share_impressions > 0.5) {
    out.push({
      severity: 'medium',
      title: 'Reach is concentrated (Pareto)',
      detail: `Top ~10% of posts (${par.top10_n}) capture ${(
        par.top10_share_impressions * 100
      ).toFixed(0)}% of impressions and ${(
        (par.top10_share_engagement ?? 0) * 100
      ).toFixed(0)}% of engagement. Study those outliers; stop averaging them with dead replies.`,
    });
  }

  const reliableHours = hours.filter((h) => h.n >= 3);
  if (reliableHours.length) {
    const byEng = [...reliableHours].sort(
      (a, b) => (b.median_engagement_sum ?? 0) - (a.median_engagement_sum ?? 0)
    );
    const byImp = [...reliableHours].sort(
      (a, b) => (b.median_impressions ?? 0) - (a.median_impressions ?? 0)
    );
    out.push({
      severity: 'medium',
      title: 'Timing (IST) exploratory',
      detail: `Highest med eng hour: ${String(byEng[0].hour).padStart(2, '0')}:00 (n=${
        byEng[0].n
      }). Highest med impressions: ${String(byImp[0].hour).padStart(2, '0')}:00 (n=${
        byImp[0].n
      }). Scout window 11–22 IST still preferred for fresh reply heat.`,
    });
  }

  const goodLen = lengths
    .filter((l) => l.reliable)
    .sort((a, b) => (b.median_engagement_rate ?? 0) - (a.median_engagement_rate ?? 0))[0];
  if (goodLen) {
    out.push({
      severity: 'info',
      title: 'Length bucket',
      detail: `${goodLen.label} leads med ER among reliable buckets (n=${goodLen.n}, dead ${(
        goodLen.dead_rate * 100
      ).toFixed(0)}%). Micro agreement replies usually underperform additive takes.`,
    });
  }

  out.push({
    severity: 'high',
    title: 'Growth experiment stack (next 7 days)',
    detail:
      '1) Cap low-value replies: only additive Venn takes on climbing posts. 2) Ship 1 strong original/day with a clear opinion. 3) Log which parent accounts give imp>500. 4) Refresh X Lab daily to track ER, not vanity likes alone.',
  });

  return out;
}

export function ruleBasedInsights(
  posts: LabPostRow[],
  kpis: ReturnType<typeof buildKpis>,
  byClass: ReturnType<typeof byContentClass>,
  hours: ReturnType<typeof hourOfDayIst>
): string[] {
  const arch = byReplyArchetype(posts);
  const lengths = lengthBuckets(posts);
  const funnel = funnelMetrics(posts);
  const par = pareto(posts);
  return growthPlaybook(posts, kpis, byClass, arch, hours, lengths, funnel, par).map(
    (p) => `${p.title}: ${p.detail}`
  );
}

export type SectionNote = {
  /** Short title under the chart */
  headline: string;
  /** How to read this chart (method) */
  howToRead: string;
  /** Diagnosis bullets from the actual numbers */
  bullets: string[];
  /** What to do next */
  action?: string;
};

function fmtN(n: number | null | undefined, d = 1): string {
  if (n == null || !Number.isFinite(n)) return '—';
  return d === 0 ? String(Math.round(n)) : n.toFixed(d);
}

function fmtPct(n: number | null | undefined, d = 1): string {
  if (n == null || !Number.isFinite(n)) return '—';
  return `${(n * 100).toFixed(d)}%`;
}

/** Per-visualization text diagnostics (expandable in UI). */
export function buildSectionNotes(input: {
  kpis: ReturnType<typeof buildKpis>;
  contentClasses: ReturnType<typeof byContentClass>;
  replyArchetypes: ReturnType<typeof byReplyArchetype>;
  hours: ReturnType<typeof hourOfDayIst>;
  days: ReturnType<typeof dayOfWeekIst>;
  lengths: ReturnType<typeof lengthBuckets>;
  funnel: ReturnType<typeof funnelMetrics>;
  pareto: ReturnType<typeof pareto>;
  boards: ReturnType<typeof leaderboards>;
  scatter: ReturnType<typeof scatterPoints>;
  snapshots: AccountSnapshotRow[];
  range: string;
}): Record<string, SectionNote> {
  const {
    kpis,
    contentClasses,
    replyArchetypes,
    hours,
    days,
    lengths,
    funnel,
    pareto: par,
    boards,
    scatter,
    snapshots,
    range,
  } = input;

  const orig = contentClasses.find((c) => c.content_class === 'original');
  const rep = contentClasses.find((c) => c.content_class === 'reply');
  const bestArch = [...replyArchetypes].sort(
    (a, b) => (b.median_engagement_sum ?? 0) - (a.median_engagement_sum ?? 0)
  )[0];
  const worstDeadArch = [...replyArchetypes].sort((a, b) => b.dead_rate - a.dead_rate)[0];
  const hoursWithN = hours.filter((h) => h.n > 0);
  const bestHourEng = [...hoursWithN].sort(
    (a, b) => (b.median_engagement_sum ?? 0) - (a.median_engagement_sum ?? 0)
  )[0];
  const bestHourImp = [...hoursWithN].sort(
    (a, b) => (b.median_impressions ?? 0) - (a.median_impressions ?? 0)
  )[0];
  const bestDay = [...days]
    .filter((d) => d.n > 0)
    .sort((a, b) => (b.median_engagement_sum ?? 0) - (a.median_engagement_sum ?? 0))[0];
  const bestLen = [...lengths]
    .filter((l) => l.n > 0)
    .sort(
      (a, b) =>
        (b.median_engagement_rate ?? b.median_engagement_sum ?? 0) -
        (a.median_engagement_rate ?? a.median_engagement_sum ?? 0)
    )[0];
  const deadScatter = scatter.filter((p) => p.is_dead).length;
  const highReachLowEng = scatter.filter(
    (p) => p.x_impressions >= 500 && p.y_engagement <= 2
  ).length;
  const highER = scatter.filter((p) => (p.er ?? 0) >= 0.1 && p.x_impressions >= MIN_IMP_FOR_ER);

  const notes: Record<string, SectionNote> = {
    kpis: {
      headline: `North-star strip · range ${range}`,
      howToRead:
        'Followers come from account snapshots on Refresh (not per-post attribution). Medians resist outliers better than means. Dead rate = zero engagement and low impressions. ER only trusted when impressions clear a floor.',
      bullets: [
        `n=${kpis.postsN} posts · ${(kpis.replyShare * 100).toFixed(0)}% replies · ${(kpis.originalShare * 100).toFixed(0)}% originals.`,
        `Median engagement ${fmtN(kpis.medianEngagementSum)} · median impressions ${fmtN(kpis.medianImpressions, 0)} · median ER ${fmtPct(kpis.medianEngagementRate, 2)}.`,
        `Dead rate ${fmtPct(kpis.deadRate, 0)} · winner rate ${fmtPct(kpis.winnerRate, 0)} · overall eng/imp ${fmtPct(kpis.overallER, 3)}.`,
        kpis.followersNow != null
          ? `Followers now ${kpis.followersNow} (Δ last snap ${kpis.followersDeltaLast ?? '—'}, Δ7d ${kpis.followersDelta7d ?? 'needs more snaps'}).`
          : 'No follower snapshot yet. Run Refresh after Connect X.',
      ],
      action:
        kpis.replyShare >= 0.75
          ? 'Diagnosis: reply-heavy sample. Bias the next week toward more originals and fewer low-signal replies.'
          : 'Keep balancing originals with selective high-signal replies.',
    },
    playbook: {
      headline: 'Automated growth diagnosis',
      howToRead:
        'Severity cards are rule-based reads of the same warehouse. Critical/high items are highest leverage. They are associations in this sample, not proven causes.',
      bullets: [
        'Scan critical and high first. Those are the choke points (mix, dead replies, funnel leaks).',
        'Use info cards as context (sample size, coverage) before over-interpreting tiny buckets.',
        'Playbook updates every time you change the date range or Refresh.',
      ],
      action: 'Turn the top 1-2 critical/high cards into a written weekly experiment.',
    },
    funnel: {
      headline: 'Impression to engagement funnel',
      howToRead:
        'Left to right: how many posts exist → got impressions → got any engagement → earned a reply-back. Rates under each step are vs the previous step.',
      bullets: [
        `${funnel.n} posts → ${funnel.with_impressions} with impressions → ${funnel.with_any_engagement} with any engagement → ${funnel.with_reply_back} with reply-back.`,
        `Imp→eng rate ${fmtPct(funnel.imp_to_eng_rate, 0)}. Eng→reply-back ${fmtPct(funnel.eng_to_reply_rate, 0)}.`,
        funnel.imp_to_eng_rate != null && funnel.imp_to_eng_rate < 0.35
          ? 'Leak is early: many impressions produce zero interaction. Hooks and reply quality are the issue, not only audience size.'
          : 'Imp→eng is moderate or better in this sample. Still inspect dead replies separately.',
      ],
      action:
        'For growth: improve the first line of replies/originals so impressions do not die at zero eng.',
    },
    contentClass: {
      headline: 'Original vs reply performance',
      howToRead:
        'Bars use median engagement sum. Dead rate is the share of posts with no engagement and low impressions. Dim bars = sample too small (n < 5).',
      bullets: [
        orig
          ? `Originals n=${orig.n}: med eng ${fmtN(orig.median_engagement_sum)} · med ER ${fmtPct(orig.median_engagement_rate, 2)} · dead ${fmtPct(orig.dead_rate, 0)}.`
          : 'No originals in this range.',
        rep
          ? `Replies n=${rep.n}: med eng ${fmtN(rep.median_engagement_sum)} · med ER ${fmtPct(rep.median_engagement_rate, 2)} · dead ${fmtPct(rep.dead_rate, 0)}.`
          : 'No replies in this range.',
        orig && rep
          ? (orig.median_engagement_sum ?? 0) > (rep.median_engagement_sum ?? 0)
            ? 'In this sample originals lead on median engagement. Volume in replies is not buying median performance.'
            : 'Replies lead or match originals on median eng in this slice. Check if that is a few viral outliers.'
          : 'Need both classes to compare fairly.',
      ],
      action:
        'Ship more originals like your top conversion posts; restrict replies to additive Venn takes on climbing threads.',
    },
    scatter: {
      headline: 'Reach × conversion map',
      howToRead:
        'X = impressions (log scale), Y = engagement sum. Gold = original, dark = reply. Small grey = dead. Bottom-right = high reach low conversion. Top-left = high conversion on smaller reach.',
      bullets: [
        `${scatter.length} plotted posts · ${deadScatter} marked dead · ${highReachLowEng} with imp≥500 and eng≤2 (reach without conversion).`,
        `${highER.length} posts with ER≥10% and enough impressions (conversion plays).`,
        'A reply with huge impressions but tiny eng is a brand-mismatch or low-signal take on a big account. Do not copy that shape for growth quality.',
      ],
      action:
        'Click outliers and reverse-engineer the text. Prefer conversion plays for brand; use reach plays only when the take is on-brand.',
    },
    followers: {
      headline: 'Follower trajectory from snapshots',
      howToRead:
        'Each bar is one Refresh snapshot of followers_count. You cannot get historical followers from a single API call. Curve quality = Refresh cadence.',
      bullets: [
        `${snapshots.length} snapshot(s) stored.`,
        snapshots.length < 3
          ? 'Too few points to read trend. Refresh daily for a week before trusting slope.'
          : `Latest ${snapshots[snapshots.length - 1]?.followers_count ?? '—'} vs first ${snapshots[0]?.followers_count ?? '—'}.`,
        'Never attribute a one-day follower move to a single reply without more snapshots and external context.',
      ],
      action: 'Refresh once daily at a fixed time to build a clean series.',
    },
    lengths: {
      headline: 'Length buckets (body after @handles)',
      howToRead:
        'Micro ≤80, short 81-160, medium 161-280, long 281+. Bars favor median ER when present, else median eng. High dead rate in a bucket means that length is failing often.',
      bullets: lengths.map(
        (l) =>
          `${l.label}: n=${l.n}, med eng ${fmtN(l.median_engagement_sum)}, med ER ${fmtPct(l.median_engagement_rate, 2)}, dead ${fmtPct(l.dead_rate, 0)}${l.reliable ? '' : ' (low n)'}`
      ),
      action: bestLen
        ? `Lean into ${bestLen.label} when writing replies/originals this week (best signal in sample).`
        : 'Need more posts to prefer a length.',
    },
    replyArchetypes: {
      headline: 'Reply archetype diagnosis',
      howToRead:
        'Heuristic classes from text: additive_take, question, agreement_only, story_or_scene, off_topic, other. Red-tinted bars call out toxic patterns (off-topic / agreement-only) when dead rates are high.',
      bullets: [
        bestArch
          ? `Best med eng archetype: ${bestArch.archetype} (n=${bestArch.n}, med eng ${fmtN(bestArch.median_engagement_sum)}, dead ${fmtPct(bestArch.dead_rate, 0)}).`
          : 'No reply archetypes yet.',
        worstDeadArch
          ? `Highest dead rate: ${worstDeadArch.archetype} (n=${worstDeadArch.n}, dead ${fmtPct(worstDeadArch.dead_rate, 0)}).`
          : '',
        'Off-topic and empty agreement burn time and make medians look worse than your real craft.',
      ].filter(Boolean),
      action:
        'Only ship additive_take (and occasional sharp question) on Venn threads. Ban off-topic and pure agreement.',
    },
    bestReplies: {
      headline: 'Best replies (conversion-weighted)',
      howToRead:
        'Sorted by conversion score (ER weighted by log impressions when ER is reliable). These are patterns to clone in structure, not to copy word-for-word.',
      bullets: [
        boards.bestReplies[0]
          ? `Top reply: ${boards.bestReplies[0].engagement_sum} eng · ${fmtN(boards.bestReplies[0].impression_count, 0)} imp · ER ${fmtPct(boards.bestReplies[0].engagement_rate, 2)} · ${boards.bestReplies[0].archetype || boards.bestReplies[0].content_class}.`
          : 'No replies ranked yet.',
        `Showing ${boards.bestReplies.length} rows. Read previews for additive opinions, not empty praise.`,
      ],
      action: 'Write a one-line checklist from the top 3: opener, take, length.',
    },
    worstReplies: {
      headline: 'Weak / dead replies',
      howToRead:
        'Zero engagement or dead definition. These are anti-patterns: off-Venn, low effort, or wrong room.',
      bullets: [
        `${boards.worstReplies.length} weak replies listed.`,
        boards.worstReplies[0]
          ? `Example: “${(boards.worstReplies[0].text_preview || '').slice(0, 80)}…”`
          : 'No dead replies in this filter (good).',
        'If a reply needs the parent account to carry it and still gets 0 eng, skip that room next time.',
      ],
      action: 'Add these shapes to a personal blocklist in the scout playbook.',
    },
    hours: {
      headline: 'Hour of day (IST)',
      howToRead:
        'Median engagement by hour in Asia/Kolkata. Dim = n < 5. High volume hours with low med eng mean you are spraying, not converting.',
      bullets: [
        bestHourEng
          ? `Best med eng hour: ${String(bestHourEng.hour).padStart(2, '0')}:00 (n=${bestHourEng.n}, med eng ${fmtN(bestHourEng.median_engagement_sum)}, med imp ${fmtN(bestHourEng.median_impressions, 0)}).`
          : 'No hourly data.',
        bestHourImp
          ? `Best med impressions hour: ${String(bestHourImp.hour).padStart(2, '0')}:00 (n=${bestHourImp.n}).`
          : '',
        'Scout window 11-22 IST is for fresh reply heat. Originals can sit outside that if conversion is strong.',
      ].filter(Boolean),
      action: bestHourEng
        ? `Test concentrating high-effort replies around ${String(bestHourEng.hour).padStart(2, '0')}:00 IST for one week.`
        : 'Collect more timed posts.',
    },
    days: {
      headline: 'Day of week (IST)',
      howToRead: 'Median engagement by weekday. Use with hour heatmap; day alone is coarse.',
      bullets: [
        bestDay
          ? `Strongest day in sample: ${bestDay.label} (n=${bestDay.n}, med eng ${fmtN(bestDay.median_engagement_sum)}).`
          : 'No day data.',
        'Weekend vs weekday differences need more weeks of Refresh before you rewrite the calendar.',
      ],
      action: 'Do not overfit one strong day until n is stable across multiple weeks.',
    },
    heatmap: {
      headline: 'Hour × day heatmap (IST)',
      howToRead:
        'Each cell is median engagement or median impressions for that hour and weekday. Toggle metric above the chart. Dim cells = very small n. Empty = no posts.',
      bullets: [
        'Look for bands (same hour across days) more than single bright cells.',
        'A bright impressions cell with dull engagement means you got distribution without a take that lands.',
        'Align scout slots (11-22 IST) with cells that show both volume and engagement, not volume alone.',
      ],
      action: 'Pick 2-3 hour blocks for deliberate posting/replying and ignore vanity hours.',
    },
    reachBoard: {
      headline: 'Reach leaders',
      howToRead:
        'Score ≈ log(impressions) × log(1+engagement). Favors posts that got distribution. High reach + low eng is still a warning.',
      bullets: [
        boards.reach[0]
          ? `#1 reach: ${fmtN(boards.reach[0].impression_count, 0)} imp · ${boards.reach[0].engagement_sum} eng · ${boards.reach[0].content_class}.`
          : 'Empty.',
        'Use this list to study which parent rooms open distribution, not as a quality ranking alone.',
      ],
      action: 'Note parent account types on the top 5 reach posts for scout targeting.',
    },
    conversionBoard: {
      headline: 'Conversion leaders',
      howToRead:
        'ER-weighted when impressions are sufficient. These are the posts that turn attention into interaction most efficiently.',
      bullets: [
        boards.conversion[0]
          ? `#1 conversion: ER ${fmtPct(boards.conversion[0].engagement_rate, 2)} · ${boards.conversion[0].engagement_sum} eng · ${fmtN(boards.conversion[0].impression_count, 0)} imp.`
          : 'Empty.',
        'Prefer cloning conversion structure for brand growth; reach without ER does not teach judgment.',
      ],
      action: 'Save the top 5 conversion texts as style anchors (structure only).',
    },
    bestOriginals: {
      headline: 'Best originals',
      howToRead: 'Owned posts only, conversion-sorted. This is your brand asset ranking.',
      bullets: [
        boards.bestOriginals.length
          ? `${boards.bestOriginals.length} originals ranked. Top eng ${boards.bestOriginals[0]?.engagement_sum ?? '—'}, ER ${fmtPct(boards.bestOriginals[0]?.engagement_rate, 2)}.`
          : 'No originals in range. That is a growth problem if replies dominate.',
        'Originals that teach process/judgment tend to hold ER better than vague takes in small samples.',
      ],
      action: 'Cadence: at least one original per day in the winning shape.',
    },
  };

  return notes;
}

export function buildSummaryPayload(
  posts: LabPostRow[],
  snapshots: AccountSnapshotRow[],
  range: '7d' | '30d' | '90d' | 'all'
) {
  const filtered = filterPostsByRange(posts, range);
  const kpis = buildKpis(filtered, snapshots);
  const contentClasses = byContentClass(filtered);
  const replyArchetypes = byReplyArchetype(filtered);
  const hours = hourOfDayIst(filtered);
  const days = dayOfWeekIst(filtered);
  const heat = heatmapIst(filtered);
  const lengths = lengthBuckets(filtered);
  const funnel = funnelMetrics(filtered);
  const par = pareto(filtered);
  const boards = leaderboards(filtered, 15);
  const scatter = scatterPoints(filtered, 120);
  const playbook = growthPlaybook(
    filtered,
    kpis,
    contentClasses,
    replyArchetypes,
    hours,
    lengths,
    funnel,
    par
  );
  const sectionNotes = buildSectionNotes({
    kpis,
    contentClasses,
    replyArchetypes,
    hours,
    days,
    lengths,
    funnel,
    pareto: par,
    boards,
    scatter,
    snapshots,
    range,
  });

  return {
    range,
    principles: [
      'Medians preferred over means for skewed engagement.',
      'ER only trusted when impressions ≥ ' + MIN_IMP_FOR_ER + '.',
      'Buckets with small n are marked unreliable.',
      'Reach ≠ conversion: track both axes.',
      'Associations only, not causal follower attribution.',
    ],
    kpis,
    contentClasses,
    replyArchetypes,
    hours,
    days,
    heatmap: heat,
    lengths,
    funnel,
    pareto: par,
    leaderboards: boards,
    scatter,
    playbook,
    sectionNotes,
    insights: playbook.map((p) => `[${p.severity}] ${p.title}: ${p.detail}`),
    topPosts: boards.conversion,
    followerSeries: snapshots
      .slice()
      .sort((a, b) => new Date(a.captured_at).getTime() - new Date(b.captured_at).getTime())
      .map((s) => ({
        t: s.captured_at,
        followers: s.followers_count,
        following: s.following_count,
        tweets: s.tweet_count,
      })),
  };
}
