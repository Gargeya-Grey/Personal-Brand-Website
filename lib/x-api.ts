import 'server-only';
import { createHash, randomBytes } from 'crypto';

const X_AUTH_URL = 'https://twitter.com/i/oauth2/authorize';
const X_TOKEN_URL = 'https://api.twitter.com/2/oauth2/token';
const X_API = 'https://api.twitter.com/2';

/** Scopes for owned-read analytics (user context). */
export const X_OAUTH_SCOPES = ['tweet.read', 'users.read', 'offline.access'].join(' ');

export function xOAuthConfigured(): boolean {
  return !!(
    process.env.X_CLIENT_ID &&
    process.env.X_CLIENT_SECRET &&
    (process.env.X_OAUTH_REDIRECT_URI || process.env.APP_URL)
  );
}

export function xOAuthRedirectUri(): string {
  if (process.env.X_OAUTH_REDIRECT_URI) return process.env.X_OAUTH_REDIRECT_URI;
  const base = (process.env.APP_URL || 'http://localhost:3000').replace(/\/$/, '');
  return `${base}/api/x-lab/oauth/callback`;
}

export function generatePkcePair(): { verifier: string; challenge: string } {
  const verifier = randomBytes(32).toString('base64url');
  const challenge = createHash('sha256').update(verifier).digest('base64url');
  return { verifier, challenge };
}

export function buildAuthorizeUrl(opts: {
  state: string;
  codeChallenge: string;
}): string {
  const clientId = process.env.X_CLIENT_ID!;
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: clientId,
    redirect_uri: xOAuthRedirectUri(),
    scope: X_OAUTH_SCOPES,
    state: opts.state,
    code_challenge: opts.codeChallenge,
    code_challenge_method: 'S256',
  });
  return `${X_AUTH_URL}?${params.toString()}`;
}

function basicAuthHeader(): string {
  const id = process.env.X_CLIENT_ID || '';
  const secret = process.env.X_CLIENT_SECRET || '';
  return `Basic ${Buffer.from(`${id}:${secret}`).toString('base64')}`;
}

export type XTokenResponse = {
  access_token: string;
  refresh_token?: string;
  expires_in?: number;
  scope?: string;
  token_type?: string;
};

export async function exchangeCodeForTokens(opts: {
  code: string;
  codeVerifier: string;
}): Promise<XTokenResponse> {
  const body = new URLSearchParams({
    code: opts.code,
    grant_type: 'authorization_code',
    client_id: process.env.X_CLIENT_ID!,
    redirect_uri: xOAuthRedirectUri(),
    code_verifier: opts.codeVerifier,
  });
  const res = await fetch(X_TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: basicAuthHeader(),
    },
    body: body.toString(),
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`X token exchange failed (${res.status}): ${text.slice(0, 300)}`);
  return JSON.parse(text) as XTokenResponse;
}

export async function refreshAccessToken(refreshToken: string): Promise<XTokenResponse> {
  const body = new URLSearchParams({
    grant_type: 'refresh_token',
    refresh_token: refreshToken,
    client_id: process.env.X_CLIENT_ID!,
  });
  const res = await fetch(X_TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: basicAuthHeader(),
    },
    body: body.toString(),
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`X token refresh failed (${res.status}): ${text.slice(0, 300)}`);
  return JSON.parse(text) as XTokenResponse;
}

async function xGet<T>(path: string, accessToken: string, params?: Record<string, string>): Promise<T> {
  const url = new URL(`${X_API}${path}`);
  if (params) {
    for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  }
  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: 'no-store',
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`X API ${path} failed (${res.status}): ${text.slice(0, 400)}`);
  return JSON.parse(text) as T;
}

export type XUserMe = {
  data: {
    id: string;
    name: string;
    username: string;
    public_metrics?: {
      followers_count?: number;
      following_count?: number;
      tweet_count?: number;
      listed_count?: number;
    };
  };
};

export async function fetchMe(accessToken: string): Promise<XUserMe> {
  return xGet<XUserMe>('/users/me', accessToken, {
    'user.fields': 'public_metrics,username,name',
  });
}

export type XTweet = {
  id: string;
  text: string;
  created_at?: string;
  lang?: string;
  conversation_id?: string;
  in_reply_to_user_id?: string;
  referenced_tweets?: { type: string; id: string }[];
  public_metrics?: {
    retweet_count?: number;
    reply_count?: number;
    like_count?: number;
    quote_count?: number;
    bookmark_count?: number;
    impression_count?: number;
  };
  non_public_metrics?: Record<string, number>;
  organic_metrics?: Record<string, number>;
};

export type XTimelinePage = {
  data?: XTweet[];
  meta?: { next_token?: string; result_count?: number };
};

export async function fetchUserTimeline(
  accessToken: string,
  userId: string,
  opts?: { maxResults?: number; paginationToken?: string }
): Promise<XTimelinePage> {
  const params: Record<string, string> = {
    max_results: String(opts?.maxResults ?? 50),
    'tweet.fields':
      'created_at,public_metrics,non_public_metrics,organic_metrics,conversation_id,in_reply_to_user_id,referenced_tweets,lang',
    exclude: 'retweets',
  };
  if (opts?.paginationToken) params.pagination_token = opts.paginationToken;
  return xGet<XTimelinePage>(`/users/${userId}/tweets`, accessToken, params);
}

export function classifyTweet(t: XTweet): {
  is_reply: boolean;
  is_quote: boolean;
  is_retweet: boolean;
  content_class: 'original' | 'reply' | 'quote' | 'repost';
} {
  const refs = t.referenced_tweets || [];
  const is_retweet = refs.some((r) => r.type === 'retweeted');
  const is_quote = refs.some((r) => r.type === 'quoted');
  const is_reply = !!t.in_reply_to_user_id || refs.some((r) => r.type === 'replied_to');
  let content_class: 'original' | 'reply' | 'quote' | 'repost' = 'original';
  if (is_retweet) content_class = 'repost';
  else if (is_reply) content_class = 'reply';
  else if (is_quote) content_class = 'quote';
  return { is_reply, is_quote, is_retweet, content_class };
}

/** Asia/Kolkata hour 0–23 and DOW 0=Sun … 6=Sat for a UTC ISO string. */
export function istHourAndDow(iso: string): { hour: number; dow: number } {
  const d = new Date(iso);
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Kolkata',
    hour: 'numeric',
    hour12: false,
    weekday: 'short',
  }).formatToParts(d);
  let hour = parseInt(parts.find((p) => p.type === 'hour')?.value || '0', 10);
  if (hour === 24) hour = 0;
  const wd = parts.find((p) => p.type === 'weekday')?.value || 'Sun';
  const map: Record<string, number> = {
    Sun: 0,
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
  };
  return { hour, dow: map[wd] ?? 0 };
}

export function metricsFromTweet(t: XTweet) {
  const pm = t.public_metrics || {};
  const like_count = pm.like_count ?? 0;
  const reply_count = pm.reply_count ?? 0;
  const repost_count = pm.retweet_count ?? 0;
  const quote_count = pm.quote_count ?? 0;
  const bookmark_count = pm.bookmark_count ?? 0;
  const impression_count =
    typeof pm.impression_count === 'number' ? pm.impression_count : null;
  const engagement_sum = like_count + reply_count + repost_count + quote_count + bookmark_count;
  const engagement_rate =
    impression_count && impression_count > 0 ? engagement_sum / impression_count : null;
  return {
    like_count,
    reply_count,
    repost_count,
    quote_count,
    bookmark_count,
    impression_count,
    engagement_sum,
    engagement_rate,
    public_metrics: pm,
    non_public_metrics: t.non_public_metrics ?? null,
    organic_metrics: t.organic_metrics ?? null,
  };
}
