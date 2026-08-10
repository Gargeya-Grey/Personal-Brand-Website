-- =============================================================================
-- X To-Do — wipe packs (Supabase SQL Editor)
-- Table: public.x_content_packs ONLY (blog / auth / storage untouched)
--
-- Prefer day-to-day: data/sql/x_content_packs_retain_2d.sql (keeps 2 days).
-- Use THIS file only for a full clean slate.
--
-- AFTER A FULL WIPE
--   On the laptop (repo root), refill with one new pack for the current IST slot:
--     node scripts/merge-x-pack.mjs data/x-pack-today.json
--   Requires APP_URL + X_SCOUT_SECRET in .env.local
--
-- WARNING: The DELETE below removes ALL X To-Do packs. Cannot undo.
-- =============================================================================

-- 1) Preview what you are about to remove
select count(*) as packs_before from public.x_content_packs;

select
  id,
  date,
  title,
  planned_minutes,
  updated_at,
  jsonb_array_length(coalesce(payload->'drafts', '[]'::jsonb)) as draft_count
from public.x_content_packs
order by updated_at desc;

-- 2) FULL WIPE — empty the X To-Do dashboard
delete from public.x_content_packs;

-- 3) Confirm empty
select count(*) as packs_after from public.x_content_packs;
-- Expect: packs_after = 0

-- =============================================================================
-- OPTIONAL: keep only last 2 days (same as x_content_packs_retain_2d.sql)
-- Comment out the FULL WIPE DELETE above if you use this instead.
-- =============================================================================
-- delete from public.x_content_packs
-- where date < ((timezone('Asia/Kolkata', now()))::date - 1);
