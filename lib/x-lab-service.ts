import 'server-only';
import { supabase, isSupabaseConfigured } from './supabase';
import { decryptSecret, encryptSecret, isTokenEncryptionConfigured } from './x-lab-crypto';
import {
  classifyTweet,
  fetchMe,
  fetchUserTimeline,
  istHourAndDow,
  metricsFromTweet,
  refreshAccessToken,
  type XTweet,
} from './x-api';
import {
  buildSummaryPayload,
  type AccountSnapshotRow,
  type LabPostRow,
} from './x-lab-analytics';
import { getXContentPacks } from './x-content-service';

const OWNER_ROW = 'owner';
const REFRESH_COOLDOWN_MS = 5 * 60 * 1000;

function requireDb() {
  if (!isSupabaseConfigured() || !supabase) {
    throw new Error('Supabase is not configured. X Lab needs Supabase warehouse tables.');
  }
  return supabase;
}

export type StoredOAuth = {
  x_user_id: string;
  username: string;
  access_token: string;
  refresh_token: string | null;
  expires_at: string | null;
  scopes: string | null;
};

export async function getOAuthConnectionStatus(): Promise<{
  connected: boolean;
  username: string | null;
  x_user_id: string | null;
  encryptionOk: boolean;
  supabaseOk: boolean;
}> {
  const encryptionOk = isTokenEncryptionConfigured();
  const supabaseOk = isSupabaseConfigured();
  if (!supabaseOk) {
    return { connected: false, username: null, x_user_id: null, encryptionOk, supabaseOk };
  }
  try {
    const db = requireDb();
    const { data, error } = await db
      .from('x_lab_oauth_tokens')
      .select('username, x_user_id')
      .eq('id', OWNER_ROW)
      .maybeSingle();
    if (error || !data) {
      return { connected: false, username: null, x_user_id: null, encryptionOk, supabaseOk };
    }
    return {
      connected: true,
      username: data.username,
      x_user_id: data.x_user_id,
      encryptionOk,
      supabaseOk,
    };
  } catch {
    return { connected: false, username: null, x_user_id: null, encryptionOk, supabaseOk };
  }
}

export async function saveOAuthTokens(opts: {
  x_user_id: string;
  username: string;
  access_token: string;
  refresh_token?: string | null;
  expires_in?: number | null;
  scopes?: string | null;
}): Promise<void> {
  const db = requireDb();
  const expires_at =
    opts.expires_in && opts.expires_in > 0
      ? new Date(Date.now() + opts.expires_in * 1000).toISOString()
      : null;
  const row = {
    id: OWNER_ROW,
    x_user_id: opts.x_user_id,
    username: opts.username,
    access_token_enc: encryptSecret(opts.access_token),
    refresh_token_enc: opts.refresh_token ? encryptSecret(opts.refresh_token) : null,
    expires_at,
    scopes: opts.scopes ?? null,
    updated_at: new Date().toISOString(),
  };
  const { error } = await db.from('x_lab_oauth_tokens').upsert(row, { onConflict: 'id' });
  if (error) throw new Error(`Failed to save X OAuth tokens: ${error.message}`);
}

async function loadOAuth(): Promise<StoredOAuth | null> {
  const db = requireDb();
  const { data, error } = await db
    .from('x_lab_oauth_tokens')
    .select('*')
    .eq('id', OWNER_ROW)
    .maybeSingle();
  if (error || !data) return null;
  return {
    x_user_id: data.x_user_id,
    username: data.username,
    access_token: decryptSecret(data.access_token_enc),
    refresh_token: data.refresh_token_enc ? decryptSecret(data.refresh_token_enc) : null,
    expires_at: data.expires_at,
    scopes: data.scopes,
  };
}

async function getValidAccessToken(): Promise<StoredOAuth> {
  const oauth = await loadOAuth();
  if (!oauth) throw new Error('X account not connected. Open X Lab and press Connect X.');

  const expiresAt = oauth.expires_at ? new Date(oauth.expires_at).getTime() : 0;
  const needsRefresh = !expiresAt || expiresAt < Date.now() + 60_000;
  if (!needsRefresh) return oauth;
  if (!oauth.refresh_token) return oauth;

  const refreshed = await refreshAccessToken(oauth.refresh_token);
  await saveOAuthTokens({
    x_user_id: oauth.x_user_id,
    username: oauth.username,
    access_token: refreshed.access_token,
    refresh_token: refreshed.refresh_token || oauth.refresh_token,
    expires_in: refreshed.expires_in,
    scopes: refreshed.scope || oauth.scopes,
  });
  return {
    ...oauth,
    access_token: refreshed.access_token,
    refresh_token: refreshed.refresh_token || oauth.refresh_token,
  };
}

function extractTweetIdFromUrl(url: string): string | null {
  const m = String(url || '').match(/(?:twitter\.com|x\.com)\/[^/]+\/status\/(\d+)/i);
  return m ? m[1] : null;
}

/** Map status tweet ids → pack/draft from To-Do (posted drafts). */
async function buildPackLinkMap(): Promise<Map<string, { packId: string; draftId: string }>> {
  const map = new Map<string, { packId: string; draftId: string }>();
  try {
    const packs = await getXContentPacks();
    for (const pack of packs) {
      for (const d of pack.drafts || []) {
        if (d.status !== 'posted') continue;
        // Own original may not have meta; replies have source URL — we also check tip
        const meta = typeof d.meta === 'string' ? d.meta : '';
        const id = extractTweetIdFromUrl(meta);
        // For originals, user may have posted without storing the new status URL yet
        if (id) map.set(id, { packId: pack.id, draftId: d.id });
      }
    }
  } catch {
    // non-fatal
  }
  return map;
}

function tweetToRow(
  t: XTweet,
  links: Map<string, { packId: string; draftId: string }>
): Record<string, unknown> {
  const created = t.created_at || new Date().toISOString();
  const { hour, dow } = istHourAndDow(created);
  const cls = classifyTweet(t);
  const m = metricsFromTweet(t);
  const link = links.get(t.id);
  return {
    tweet_id: t.id,
    created_at: created,
    created_at_ist_hour: hour,
    created_at_ist_dow: dow,
    text: t.text || '',
    lang: t.lang ?? null,
    is_reply: cls.is_reply,
    is_quote: cls.is_quote,
    is_retweet: cls.is_retweet,
    conversation_id: t.conversation_id ?? null,
    in_reply_to_user_id: t.in_reply_to_user_id ?? null,
    content_class: cls.content_class,
    public_metrics: m.public_metrics,
    non_public_metrics: m.non_public_metrics,
    organic_metrics: m.organic_metrics,
    engagement_sum: m.engagement_sum,
    engagement_rate: m.engagement_rate,
    impression_count: m.impression_count,
    like_count: m.like_count,
    reply_count: m.reply_count,
    repost_count: m.repost_count,
    quote_count: m.quote_count,
    bookmark_count: m.bookmark_count,
    char_count: (t.text || '').length,
    linked_pack_id: link?.packId ?? null,
    linked_draft_id: link?.draftId ?? null,
    last_synced_at: new Date().toISOString(),
  };
}

export async function runRefresh(opts?: {
  force?: boolean;
  maxPages?: number;
}): Promise<{
  ok: boolean;
  posts_upserted: number;
  followers: number | null;
  run_id: number | null;
  error?: string;
}> {
  const db = requireDb();
  const force = !!opts?.force;
  // Default 4 pages × 50 = up to 200 posts per paid refresh (maximize value per credit)
  const maxPages = Math.min(8, Math.max(1, opts?.maxPages ?? 4));

  if (!force) {
    const { data: last } = await db
      .from('x_lab_refresh_runs')
      .select('started_at, status')
      .eq('status', 'ok')
      .order('started_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (last?.started_at) {
      const age = Date.now() - new Date(last.started_at).getTime();
      if (age < REFRESH_COOLDOWN_MS) {
        const wait = Math.ceil((REFRESH_COOLDOWN_MS - age) / 1000);
        throw new Error(`Refresh cooldown: wait ~${wait}s (or pass force).`);
      }
    }
  }

  const { data: runIns, error: runErr } = await db
    .from('x_lab_refresh_runs')
    .insert({ status: 'running' })
    .select('id')
    .single();
  if (runErr) throw new Error(`Could not start refresh run: ${runErr.message}`);
  const runId = runIns.id as number;
  let apiCalls = 0;
  let postsUpserted = 0;
  let followers: number | null = null;

  try {
    const oauth = await getValidAccessToken();
    apiCalls += 1;
    const me = await fetchMe(oauth.access_token);
    const userId = me.data.id;
    const username = me.data.username;
    // Keep username fresh
    if (username && username !== oauth.username) {
      await db
        .from('x_lab_oauth_tokens')
        .update({ username, x_user_id: userId, updated_at: new Date().toISOString() })
        .eq('id', OWNER_ROW);
    }

    const pm = me.data.public_metrics || {};
    followers = pm.followers_count ?? 0;
    await db.from('x_lab_account_snapshots').insert({
      followers_count: pm.followers_count ?? 0,
      following_count: pm.following_count ?? 0,
      tweet_count: pm.tweet_count ?? 0,
      listed_count: pm.listed_count ?? 0,
      raw: me.data,
    });

    const links = await buildPackLinkMap();
    let next: string | undefined;
    for (let page = 0; page < maxPages; page++) {
      apiCalls += 1;
      const tl = await fetchUserTimeline(oauth.access_token, userId, {
        maxResults: 50,
        paginationToken: next,
      });
      const tweets = tl.data || [];
      if (!tweets.length) break;

      const rows = tweets.map((t) => tweetToRow(t, links));
      // Preserve first_seen_at: upsert without overwriting if we select conflict
      const { error: upErr } = await db.from('x_lab_posts').upsert(rows, { onConflict: 'tweet_id' });
      if (upErr) throw new Error(`Post upsert failed: ${upErr.message}`);
      postsUpserted += rows.length;

      const snapRows = tweets.map((t) => {
        const m = metricsFromTweet(t);
        return {
          tweet_id: t.id,
          like_count: m.like_count,
          reply_count: m.reply_count,
          repost_count: m.repost_count,
          quote_count: m.quote_count,
          bookmark_count: m.bookmark_count,
          impression_count: m.impression_count,
          engagement_sum: m.engagement_sum,
          engagement_rate: m.engagement_rate,
        };
      });
      await db.from('x_lab_post_metric_snapshots').insert(snapRows);

      next = tl.meta?.next_token;
      if (!next) break;
    }

    await db
      .from('x_lab_refresh_runs')
      .update({
        status: 'ok',
        finished_at: new Date().toISOString(),
        posts_upserted: postsUpserted,
        api_calls_estimate: apiCalls,
        meta: { username, userId },
      })
      .eq('id', runId);

    return { ok: true, posts_upserted: postsUpserted, followers, run_id: runId };
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    await db
      .from('x_lab_refresh_runs')
      .update({
        status: 'error',
        finished_at: new Date().toISOString(),
        posts_upserted: postsUpserted,
        api_calls_estimate: apiCalls,
        error: message.slice(0, 1000),
      })
      .eq('id', runId);
    return { ok: false, posts_upserted: postsUpserted, followers, run_id: runId, error: message };
  }
}

export async function listPosts(opts?: {
  range?: '7d' | '30d' | '90d' | 'all';
  content_class?: string;
  limit?: number;
}): Promise<LabPostRow[]> {
  const db = requireDb();
  const limit = Math.min(500, Math.max(1, opts?.limit ?? 200));
  let q = db.from('x_lab_posts').select('*').order('created_at', { ascending: false }).limit(limit);
  if (opts?.content_class && opts.content_class !== 'all') {
    q = q.eq('content_class', opts.content_class);
  }
  if (opts?.range && opts.range !== 'all') {
    const days = opts.range === '7d' ? 7 : opts.range === '30d' ? 30 : 90;
    const cutoff = new Date(Date.now() - days * 86400000).toISOString();
    q = q.gte('created_at', cutoff);
  }
  const { data, error } = await q;
  if (error) throw new Error(error.message);
  return (data || []).map(mapPostRow);
}

function mapPostRow(r: Record<string, unknown>): LabPostRow {
  return {
    tweet_id: String(r.tweet_id),
    created_at: String(r.created_at),
    created_at_ist_hour: Number(r.created_at_ist_hour) || 0,
    created_at_ist_dow: Number(r.created_at_ist_dow) || 0,
    text: String(r.text || ''),
    content_class: String(r.content_class || 'original'),
    is_reply: !!r.is_reply,
    like_count: Number(r.like_count) || 0,
    reply_count: Number(r.reply_count) || 0,
    repost_count: Number(r.repost_count) || 0,
    quote_count: Number(r.quote_count) || 0,
    bookmark_count: Number(r.bookmark_count) || 0,
    impression_count:
      r.impression_count == null ? null : Number(r.impression_count),
    engagement_sum: Number(r.engagement_sum) || 0,
    engagement_rate:
      r.engagement_rate == null ? null : Number(r.engagement_rate),
    char_count: Number(r.char_count) || 0,
    linked_pack_id: (r.linked_pack_id as string) || null,
    linked_draft_id: (r.linked_draft_id as string) || null,
  };
}

export async function listSnapshots(limit = 200): Promise<AccountSnapshotRow[]> {
  const db = requireDb();
  const { data, error } = await db
    .from('x_lab_account_snapshots')
    .select('captured_at, followers_count, following_count, tweet_count, listed_count')
    .order('captured_at', { ascending: true })
    .limit(limit);
  if (error) throw new Error(error.message);
  return (data || []) as AccountSnapshotRow[];
}

export async function getLastRefreshRun() {
  const db = requireDb();
  const { data } = await db
    .from('x_lab_refresh_runs')
    .select('*')
    .order('started_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  return data;
}

export async function getLabSummary(range: '7d' | '30d' | '90d' | 'all' = '30d') {
  const connection = await getOAuthConnectionStatus();
  if (!connection.supabaseOk) {
    return {
      connection,
      lastRefresh: null,
      summary: null,
      error: 'Supabase not configured',
    };
  }

  let lastRefresh = null;
  let posts: LabPostRow[] = [];
  let snapshots: AccountSnapshotRow[] = [];
  try {
    lastRefresh = await getLastRefreshRun();
    posts = await listPosts({ range: 'all', limit: 500 });
    snapshots = await listSnapshots(365);
  } catch (e) {
    return {
      connection,
      lastRefresh: null,
      summary: null,
      error: e instanceof Error ? e.message : String(e),
    };
  }

  return {
    connection,
    lastRefresh,
    summary: buildSummaryPayload(posts, snapshots, range),
    error: null as string | null,
  };
}

export function buildChatDataPacket(
  summary: ReturnType<typeof buildSummaryPayload>,
  posts: LabPostRow[]
) {
  return {
    legend: {
      engagement_sum: 'likes+replies+reposts+quotes+bookmarks',
      engagement_rate: 'engagement_sum / impressions when impressions ≥ 15',
      reach_vs_conversion:
        'High impressions with low ER = reach play; high ER on modest imp = conversion play',
      reply_archetypes:
        'additive_take | question | agreement_only | story_or_scene | off_topic | other',
      ist: 'Asia/Kolkata local time for hour/dow slices',
      caution: 'Associations only. Small-n buckets may be unreliable.',
    },
    kpis: summary.kpis,
    principles: summary.principles,
    playbook: summary.playbook,
    contentClasses: summary.contentClasses,
    replyArchetypes: summary.replyArchetypes,
    funnel: summary.funnel,
    pareto: summary.pareto,
    hours: summary.hours.filter((h) => h.n > 0),
    days: summary.days,
    lengths: summary.lengths,
    leaderboards: {
      reach: summary.leaderboards.reach.slice(0, 8),
      conversion: summary.leaderboards.conversion.slice(0, 8),
      bestReplies: summary.leaderboards.bestReplies.slice(0, 8),
      worstReplies: summary.leaderboards.worstReplies.slice(0, 6),
      bestOriginals: summary.leaderboards.bestOriginals.slice(0, 6),
    },
    followerSeries: summary.followerSeries.slice(-60),
    sampleSize: posts.length,
  };
}
