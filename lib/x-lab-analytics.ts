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

  return {
    range,
    principles: [
      'Medians preferred over means for skewed engagement.',
      'ER only trusted when impressions ≥ ' + MIN_IMP_FOR_ER + '.',
      'Buckets with small n are marked unreliable.',
      'Reach ≠ conversion: track both axes.',
      'Associations only — not causal follower attribution.',
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
