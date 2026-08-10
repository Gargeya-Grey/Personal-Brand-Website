-- =============================================================================
-- X Lab — growth analytics warehouse (Supabase SQL Editor)
-- Private editorial metrics for @GargeyaS. Service role only (RLS deny-all).
-- Run once. Safe to re-run (IF NOT EXISTS).
-- =============================================================================

-- OAuth tokens (encrypted ciphertext stored as text)
create table if not exists public.x_lab_oauth_tokens (
  id text primary key default 'owner',
  x_user_id text not null,
  username text not null,
  access_token_enc text not null,
  refresh_token_enc text,
  expires_at timestamptz,
  scopes text,
  updated_at timestamptz not null default now()
);

-- Account-level snapshots (follower trajectory)
create table if not exists public.x_lab_account_snapshots (
  id bigserial primary key,
  captured_at timestamptz not null default now(),
  followers_count integer not null default 0,
  following_count integer not null default 0,
  tweet_count integer not null default 0,
  listed_count integer not null default 0,
  raw jsonb
);

create index if not exists x_lab_account_snapshots_captured_idx
  on public.x_lab_account_snapshots (captured_at desc);

-- Latest metrics per owned post
create table if not exists public.x_lab_posts (
  tweet_id text primary key,
  created_at timestamptz not null,
  created_at_ist_hour smallint not null default 0,
  created_at_ist_dow smallint not null default 0,
  text text not null default '',
  lang text,
  is_reply boolean not null default false,
  is_quote boolean not null default false,
  is_retweet boolean not null default false,
  conversation_id text,
  in_reply_to_user_id text,
  content_class text not null default 'original',
  public_metrics jsonb not null default '{}'::jsonb,
  non_public_metrics jsonb,
  organic_metrics jsonb,
  engagement_sum integer not null default 0,
  engagement_rate double precision,
  impression_count integer,
  like_count integer not null default 0,
  reply_count integer not null default 0,
  repost_count integer not null default 0,
  quote_count integer not null default 0,
  bookmark_count integer not null default 0,
  char_count integer not null default 0,
  linked_pack_id text,
  linked_draft_id text,
  first_seen_at timestamptz not null default now(),
  last_synced_at timestamptz not null default now()
);

create index if not exists x_lab_posts_created_idx
  on public.x_lab_posts (created_at desc);
create index if not exists x_lab_posts_class_idx
  on public.x_lab_posts (content_class);
create index if not exists x_lab_posts_ist_hour_idx
  on public.x_lab_posts (created_at_ist_hour);

-- Metric history per post (aging curves)
create table if not exists public.x_lab_post_metric_snapshots (
  id bigserial primary key,
  tweet_id text not null references public.x_lab_posts (tweet_id) on delete cascade,
  captured_at timestamptz not null default now(),
  like_count integer not null default 0,
  reply_count integer not null default 0,
  repost_count integer not null default 0,
  quote_count integer not null default 0,
  bookmark_count integer not null default 0,
  impression_count integer,
  engagement_sum integer not null default 0,
  engagement_rate double precision
);

create index if not exists x_lab_post_metric_snapshots_tweet_idx
  on public.x_lab_post_metric_snapshots (tweet_id, captured_at desc);

-- Refresh run log
create table if not exists public.x_lab_refresh_runs (
  id bigserial primary key,
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  status text not null default 'running',
  posts_upserted integer not null default 0,
  api_calls_estimate integer not null default 0,
  error text,
  meta jsonb
);

create index if not exists x_lab_refresh_runs_started_idx
  on public.x_lab_refresh_runs (started_at desc);

-- RLS: no public access (service role bypasses)
alter table public.x_lab_oauth_tokens enable row level security;
alter table public.x_lab_account_snapshots enable row level security;
alter table public.x_lab_posts enable row level security;
alter table public.x_lab_post_metric_snapshots enable row level security;
alter table public.x_lab_refresh_runs enable row level security;

drop policy if exists "x_lab_oauth_no_public" on public.x_lab_oauth_tokens;
create policy "x_lab_oauth_no_public" on public.x_lab_oauth_tokens
  for all to anon, authenticated using (false) with check (false);

drop policy if exists "x_lab_snapshots_no_public" on public.x_lab_account_snapshots;
create policy "x_lab_snapshots_no_public" on public.x_lab_account_snapshots
  for all to anon, authenticated using (false) with check (false);

drop policy if exists "x_lab_posts_no_public" on public.x_lab_posts;
create policy "x_lab_posts_no_public" on public.x_lab_posts
  for all to anon, authenticated using (false) with check (false);

drop policy if exists "x_lab_post_snaps_no_public" on public.x_lab_post_metric_snapshots;
create policy "x_lab_post_snaps_no_public" on public.x_lab_post_metric_snapshots
  for all to anon, authenticated using (false) with check (false);

drop policy if exists "x_lab_runs_no_public" on public.x_lab_refresh_runs;
create policy "x_lab_runs_no_public" on public.x_lab_refresh_runs
  for all to anon, authenticated using (false) with check (false);

comment on table public.x_lab_posts is
  'X Lab warehouse: owned posts + latest public metrics for growth analytics.';
