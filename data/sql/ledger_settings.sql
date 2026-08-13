-- =============================================================================
-- Finance Ledger — per-user Notion credentials (Supabase SQL Editor)
-- Encrypted at rest by the app (X_TOKEN_ENCRYPTION_KEY). Service role only.
-- Run once. Safe to re-run (IF NOT EXISTS).
-- =============================================================================

create table if not exists public.ledger_settings (
  email text primary key,
  notion_token_enc text not null,
  database_id_enc text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.ledger_settings enable row level security;

drop policy if exists ledger_settings_deny_all on public.ledger_settings;
create policy ledger_settings_deny_all
  on public.ledger_settings
  for all
  using (false)
  with check (false);

revoke all on public.ledger_settings from anon, authenticated;
grant all on public.ledger_settings to service_role;
