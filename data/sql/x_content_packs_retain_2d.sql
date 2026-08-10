-- =============================================================================
-- X To-Do — keep only last 2 calendar days (Supabase SQL Editor)
-- Table: public.x_content_packs ONLY (blog / auth / storage untouched)
--
-- WHEN TO RUN
--   • Anytime the dashboard feels crowded
--   • After long scout stretches if auto-prune has not run yet
--   • Optional weekly hygiene (auto-prune on the app also deletes older rows)
--
-- Retention rule: pack.date >= (today in Asia/Kolkata minus 1 day)
--   i.e. today + yesterday only (2 days max).
--
-- WARNING: DELETE is permanent for older packs. Cannot undo.
-- =============================================================================

-- 1) Preview what will be removed
select
  id,
  date,
  title,
  updated_at,
  jsonb_array_length(coalesce(payload->'drafts', '[]'::jsonb)) as draft_count
from public.x_content_packs
where date < ((timezone('Asia/Kolkata', now()))::date - 1)
order by date desc, updated_at desc;

select count(*) as packs_to_delete
from public.x_content_packs
where date < ((timezone('Asia/Kolkata', now()))::date - 1);

-- 2) Delete older than 2-day window
delete from public.x_content_packs
where date < ((timezone('Asia/Kolkata', now()))::date - 1);

-- 3) Confirm what remains
select count(*) as packs_after from public.x_content_packs;

select id, date, title, updated_at
from public.x_content_packs
order by date desc, updated_at desc;
