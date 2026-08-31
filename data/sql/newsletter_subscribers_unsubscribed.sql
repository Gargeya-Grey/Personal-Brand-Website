-- Keep the subscriber row. Flag them so the next send skips them.
-- Run once in the Supabase SQL editor. Does not delete anyone.

alter table public.newsletter_subscribers
  add column if not exists unsubscribed boolean not null default false;

alter table public.newsletter_subscribers
  add column if not exists unsubscribed_at timestamptz;

comment on column public.newsletter_subscribers.unsubscribed is
  'True means keep the row, do not send Notes until they subscribe again.';

update public.newsletter_subscribers
  set unsubscribed = true,
      unsubscribed_at = coalesce(unsubscribed_at, now())
  where source like 'unsubscribe%'
    and unsubscribed = false;
