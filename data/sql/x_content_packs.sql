-- X To-Do packs (run once in Supabase SQL editor)
-- Rich fields live in payload jsonb so we can evolve UX without new migrations.
-- Indexed columns support fast "today's pack" lookups and dashboards later.

create table if not exists public.x_content_packs (
  id text primary key,
  date date not null,
  title text not null default '',
  theme text,
  planned_minutes integer,
  -- Full pack: drafts (with priority/session/why/timing), signals, sessions, mvpDraftIds, etc.
  payload jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists x_content_packs_date_idx
  on public.x_content_packs (date desc);

create index if not exists x_content_packs_updated_idx
  on public.x_content_packs (updated_at desc);

-- Optional: query remaining ready counts without parsing whole UI client-side later
-- (generated from payload — Postgres 12+)
-- alter table ... add column ready_count int generated always as (...) — skipped for portability

alter table public.x_content_packs enable row level security;

drop policy if exists "x_content_packs_no_public" on public.x_content_packs;
create policy "x_content_packs_no_public"
  on public.x_content_packs
  for all
  to anon, authenticated
  using (false)
  with check (false);

comment on table public.x_content_packs is
  'Daily X growth to-do packs for editorial X To-Do. Written by local scout via service role / ingest API.';
