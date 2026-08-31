-- Notes weekly letter (run once in Supabase SQL editor)
-- Weeks live in payload jsonb so the curator UI can evolve without new columns.
-- Reads are anonymous dwell on the public archive. No email is stored here.

create table if not exists public.newsletter_weeks (
  id text primary key,
  week_of date not null,
  stage text not null default 'draft',
  payload jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists newsletter_weeks_week_of_idx
  on public.newsletter_weeks (week_of desc);

create index if not exists newsletter_weeks_stage_idx
  on public.newsletter_weeks (stage);

alter table public.newsletter_weeks enable row level security;

drop policy if exists "newsletter_weeks_no_public" on public.newsletter_weeks;
create policy "newsletter_weeks_no_public"
  on public.newsletter_weeks
  for all
  to anon, authenticated
  using (false)
  with check (false);

comment on table public.newsletter_weeks is
  'Weekly Notes letters. Written by Grok Bot via ingest. Curated in editorial. Sent via Resend.';

create table if not exists public.newsletter_subscribers (
  email text primary key,
  timezone text not null default 'Asia/Kolkata',
  source text,
  subscribed_at timestamptz not null default now()
);

alter table public.newsletter_subscribers enable row level security;

drop policy if exists "newsletter_subscribers_no_public" on public.newsletter_subscribers;
create policy "newsletter_subscribers_no_public"
  on public.newsletter_subscribers
  for all
  to anon, authenticated
  using (false)
  with check (false);

comment on table public.newsletter_subscribers is
  'Timezone + source for Notes subscribers. Resend remains source of truth for unsubscribes.';

create table if not exists public.newsletter_reads (
  issue_id text not null,
  session_id text not null,
  seconds integer not null default 0,
  last_ping_at timestamptz not null default now(),
  primary key (issue_id, session_id)
);

create index if not exists newsletter_reads_issue_idx
  on public.newsletter_reads (issue_id);

alter table public.newsletter_reads enable row level security;

drop policy if exists "newsletter_reads_no_public" on public.newsletter_reads;
create policy "newsletter_reads_no_public"
  on public.newsletter_reads
  for all
  to anon, authenticated
  using (false)
  with check (false);

comment on table public.newsletter_reads is
  'Anonymous visible-tab seconds on /notes/[slug]. No PII.';
