-- =============================================================================
-- X To-Do — wipe packs (Supabase SQL Editor)
-- Table: public.x_content_packs ONLY (blog / auth / storage untouched)
--
-- WHEN TO RUN
--   • Fresh start before a new scout era (e.g. reply-first 10:1 packs)
--   • Every ~7–8 days to clear the dashboard of finished runs
--
-- AFTER YOU RUN THIS
--   On the laptop (repo root), refill with one new pack:
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
-- OPTIONAL (comment out the DELETE above if you use this instead):
-- Keep only packs from the last 7 days
-- =============================================================================
-- delete from public.x_content_packs
-- where coalesce(date::timestamptz, updated_at) < (now() - interval '7 days');
