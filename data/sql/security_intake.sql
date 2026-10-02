-- Apply before deploying the security repair branch. No subscriber data is changed.
create table if not exists public.security_budgets (
  key text primary key, used integer not null, expires_at timestamptz not null
);
create table if not exists public.security_requests (
  digest text primary key, expires_at timestamptz not null
);
create table if not exists public.security_used_tokens (
  digest text primary key, expires_at timestamptz not null
);
alter table public.security_budgets enable row level security;
alter table public.security_requests enable row level security;
alter table public.security_used_tokens enable row level security;
revoke all on public.security_budgets, public.security_requests, public.security_used_tokens from public, anon, authenticated;
grant all on public.security_budgets, public.security_requests, public.security_used_tokens to service_role;

create or replace function public.security_consume_token(p_digest text, p_expires_at timestamptz)
returns boolean language plpgsql security invoker set search_path = '' as $$
declare inserted integer;
begin
  if p_digest !~ '^[a-f0-9]{64}$' or p_expires_at <= now() or p_expires_at > now() + interval '1 hour' then return false; end if;
  delete from public.security_used_tokens where expires_at <= now();
  insert into public.security_used_tokens values (p_digest, p_expires_at) on conflict do nothing;
  get diagnostics inserted = row_count;
  return inserted = 1;
end $$;

create or replace function public.security_admit_intake(p_client text, p_email text, p_request text, p_weight integer)
returns text language plpgsql security invoker set search_path = '' as $$
declare
  epoch bigint := extract(epoch from now())::bigint;
  keys text[];
  limits integer[] := array[20,100,5,6];
  costs integer[] := array[p_weight,p_weight,1,1];
  windows integer[] := array[3600,86400,900,86400];
  used_now integer;
  i integer;
begin
  if p_client !~ '^[a-f0-9]{64}$' or p_email !~ '^[a-f0-9]{64}$' or p_request !~ '^[a-f0-9]{64}$' or p_weight not between 1 and 8 then
    raise exception 'Invalid intake reservation';
  end if;
  -- Serializes the four budgets and idempotency admission across all app instances.
  perform pg_catalog.pg_advisory_xact_lock(703003);
  delete from public.security_budgets where expires_at <= now();
  delete from public.security_requests where expires_at <= now();
  if exists(select 1 from public.security_requests where digest = p_request) then return 'duplicate'; end if;
  keys := array['global-hour:' || epoch/3600, 'global-day:' || epoch/86400,
    'client:' || p_client || ':' || epoch/900, 'email:' || p_email || ':' || epoch/86400];
  for i in 1..4 loop
    select used into used_now from public.security_budgets where key = keys[i];
    if coalesce(used_now,0) + costs[i] > limits[i] then return 'denied'; end if;
  end loop;
  for i in 1..4 loop
    insert into public.security_budgets values (keys[i], costs[i], pg_catalog.to_timestamp((epoch/windows[i]+1)*windows[i]))
      on conflict (key) do update set used = public.security_budgets.used + excluded.used;
  end loop;
  insert into public.security_requests values (p_request, now() + interval '1 hour');
  return 'allowed';
end $$;
revoke all on function public.security_consume_token(text,timestamptz), public.security_admit_intake(text,text,text,integer) from public, anon, authenticated;
grant execute on function public.security_consume_token(text,timestamptz), public.security_admit_intake(text,text,text,integer) to service_role;

-- Stale scout snapshots must not overwrite a newer curator decision or send receipt.
create or replace function public.security_ingest_cas(p_table text, p_id text, p_expected jsonb, p_next jsonb)
returns boolean language plpgsql security invoker set search_path = '' as $$
declare changed integer;
begin
  if p_table = 'newsletter_weeks' then
    if p_expected is null then
      insert into public.newsletter_weeks(id,week_of,stage,payload,created_at,updated_at)
        values(p_id,(p_next->>'weekOf')::date,p_next->>'stage',p_next,(p_next->>'createdAt')::timestamptz,(p_next->>'updatedAt')::timestamptz)
        on conflict do nothing;
    else
      update public.newsletter_weeks set stage=p_next->>'stage',payload=p_next,updated_at=(p_next->>'updatedAt')::timestamptz
        where id=p_id and payload=p_expected;
    end if;
  elsif p_table = 'x_content_packs' then
    if p_expected is null then
      insert into public.x_content_packs(id,date,title,theme,planned_minutes,payload,created_at,updated_at)
        values(p_id,(p_next->>'date')::date,p_next->>'title',p_next->>'theme',(p_next->>'plannedMinutes')::integer,p_next,
          (p_next->>'createdAt')::timestamptz,(p_next->>'updatedAt')::timestamptz) on conflict do nothing;
    else
      update public.x_content_packs set title=p_next->>'title',theme=p_next->>'theme',planned_minutes=(p_next->>'plannedMinutes')::integer,
        payload=p_next,updated_at=(p_next->>'updatedAt')::timestamptz where id=p_id and payload=p_expected;
    end if;
  else raise exception 'Unsupported content table';
  end if;
  get diagnostics changed = row_count;
  return changed = 1;
end $$;
revoke all on function public.security_ingest_cas(text,text,jsonb,jsonb) from public, anon, authenticated;
grant execute on function public.security_ingest_cas(text,text,jsonb,jsonb) to service_role;
