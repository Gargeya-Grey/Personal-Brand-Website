/**
 * Pure analytics over X Lab warehouse rows.
 * Standards: medians, rates, small-n guards, association not causation.
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

export const MIN_N_RANK = 5;
export const DOW_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

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

export function engagementScore(p: LabPostRow): number {
  if (p.engagement_rate != null && Number.isFinite(p.engagement_rate)) {
    return p.engagement_rate;
  }
  // Proxy when impressions missing: log-scale engagement sum
  return Math.log1p(p.engagement_sum);
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
  medianLikes: number | null;
  medianEngagementSum: number | null;
  medianEngagementRate: number | null;
  impressionCoverage: number;
  linkedToPackN: number;
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
    // Only use if within 2 days of the target window
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
  return {
    followersNow,
    followersDeltaLast,
    followersDelta7d,
    followersDelta30d,
    postsN: posts.length,
    medianLikes: median(posts.map((p) => p.like_count)),
    medianEngagementSum: median(posts.map((p) => p.engagement_sum)),
    medianEngagementRate: median(
      posts.map((p) => p.engagement_rate).filter((x): x is number => x != null)
    ),
    impressionCoverage: posts.length ? withImp.length / posts.length : 0,
    linkedToPackN: posts.filter((p) => p.linked_pack_id).length,
  };
}

export function byContentClass(posts: LabPostRow[]) {
  const groups = new Map<string, LabPostRow[]>();
  for (const p of posts) {
    const k = p.content_class || 'original';
    if (!groups.has(k)) groups.set(k, []);
    groups.get(k)!.push(p);
  }
  return [...groups.entries()]
    .map(([content_class, rows]) => ({
      content_class,
      n: rows.length,
      median_likes: median(rows.map((r) => r.like_count)),
      median_engagement_sum: median(rows.map((r) => r.engagement_sum)),
      median_engagement_rate: median(
        rows.map((r) => r.engagement_rate).filter((x): x is number => x != null)
      ),
      median_impressions: median(
        rows
          .map((r) => r.impression_count)
          .filter((x): x is number => x != null && x > 0)
      ),
      reliable: rows.length >= MIN_N_RANK,
    }))
    .sort((a, b) => b.n - a.n);
}

export function hourOfDayIst(posts: LabPostRow[]) {
  return Array.from({ length: 24 }, (_, hour) => {
    const rows = posts.filter((p) => p.created_at_ist_hour === hour);
    return {
      hour,
      n: rows.length,
      median_likes: median(rows.map((r) => r.like_count)),
      median_engagement_sum: median(rows.map((r) => r.engagement_sum)),
      median_engagement_rate: median(
        rows.map((r) => r.engagement_rate).filter((x): x is number => x != null)
      ),
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
      median_engagement_rate: median(
        rows.map((r) => r.engagement_rate).filter((x): x is number => x != null)
      ),
      reliable: rows.length >= MIN_N_RANK,
    };
  });
}

/** hour × dow cell medians for heatmap (engagement_sum proxy). */
export function heatmapIst(posts: LabPostRow[]) {
  const cells: {
    hour: number;
    dow: number;
    n: number;
    median_engagement_sum: number | null;
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
    const rows = posts.filter((p) => p.char_count >= d.min && p.char_count <= d.max);
    return {
      id: d.id,
      label: d.label,
      n: rows.length,
      median_likes: median(rows.map((r) => r.like_count)),
      median_engagement_sum: median(rows.map((r) => r.engagement_sum)),
      reliable: rows.length >= MIN_N_RANK,
    };
  });
}

export function topPosts(posts: LabPostRow[], limit = 15) {
  return [...posts]
    .sort((a, b) => engagementScore(b) - engagementScore(a) || b.like_count - a.like_count)
    .slice(0, limit)
    .map((p) => ({
      tweet_id: p.tweet_id,
      created_at: p.created_at,
      content_class: p.content_class,
      like_count: p.like_count,
      reply_count: p.reply_count,
      repost_count: p.repost_count,
      impression_count: p.impression_count,
      engagement_sum: p.engagement_sum,
      engagement_rate: p.engagement_rate,
      score: engagementScore(p),
      text_preview: p.text.slice(0, 140),
      linked_pack_id: p.linked_pack_id ?? null,
    }));
}

export function ruleBasedInsights(
  posts: LabPostRow[],
  kpis: ReturnType<typeof buildKpis>,
  byClass: ReturnType<typeof byContentClass>,
  hours: ReturnType<typeof hourOfDayIst>
): string[] {
  const out: string[] = [];
  out.push(
    `Sample: n=${kpis.postsN} posts in range. Impression coverage ${(
      kpis.impressionCoverage * 100
    ).toFixed(0)}%. Rankings use medians; buckets with n<${MIN_N_RANK} are marked unreliable.`
  );

  if (kpis.followersNow != null) {
    const d7 = kpis.followersDelta7d;
    out.push(
      d7 == null
        ? `Followers now: ${kpis.followersNow}. Need more snapshots for 7d delta.`
        : `Followers now: ${kpis.followersNow} (Δ7d ${d7 >= 0 ? '+' : ''}${d7}). Snapshot-based, not attributed to single posts.`
    );
  }

  const reliableClass = byClass.filter((c) => c.reliable);
  if (reliableClass.length >= 2) {
    const sorted = [...reliableClass].sort(
      (a, b) => (b.median_engagement_sum ?? 0) - (a.median_engagement_sum ?? 0)
    );
    out.push(
      `Among content types with enough sample, highest median engagement sum: ${sorted[0].content_class} (n=${sorted[0].n}). Association only — not causal.`
    );
  } else {
    out.push('Content-type comparison needs more posts per class before ranking.');
  }

  const reliableHours = hours.filter((h) => h.reliable);
  if (reliableHours.length) {
    const best = [...reliableHours].sort(
      (a, b) => (b.median_engagement_sum ?? 0) - (a.median_engagement_sum ?? 0)
    )[0];
    out.push(
      `Strongest hour bucket so far (IST, exploratory): ${String(best.hour).padStart(2, '0')}:00 (n=${best.n}, median eng sum ${best.median_engagement_sum?.toFixed(1) ?? '—'}).`
    );
  } else {
    out.push('Hour-of-day heatmap is underpowered (most cells n<5). Keep posting + Refresh.');
  }

  if (kpis.linkedToPackN > 0) {
    out.push(
      `${kpis.linkedToPackN} posts linked to X To-Do packs — useful to compare scout drafts vs organic posts later.`
    );
  }

  return out;
}

export function buildSummaryPayload(
  posts: LabPostRow[],
  snapshots: AccountSnapshotRow[],
  range: '7d' | '30d' | '90d' | 'all'
) {
  const filtered = filterPostsByRange(posts, range);
  const kpis = buildKpis(filtered, snapshots);
  const contentClasses = byContentClass(filtered);
  const hours = hourOfDayIst(filtered);
  const days = dayOfWeekIst(filtered);
  const heat = heatmapIst(filtered);
  const lengths = lengthBuckets(filtered);
  const leaders = topPosts(filtered, 20);
  const insights = ruleBasedInsights(filtered, kpis, contentClasses, hours);

  return {
    range,
    principles: [
      'Medians preferred over means for skewed engagement.',
      'Buckets with small n are marked unreliable.',
      'Labels describe association, not causation.',
      'Follower deltas come from account snapshots on Refresh — not per-post attribution.',
    ],
    kpis,
    contentClasses,
    hours,
    days,
    heatmap: heat,
    lengths,
    topPosts: leaders,
    insights,
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
