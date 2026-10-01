create schema if not exists on_track_private;
revoke all on schema on_track_private from public, anon;
grant usage on schema on_track_private to authenticated;
create table on_track_private.coach_request_limits (
  owner_id uuid not null references auth.users(id) on delete cascade,
  utc_day date not null,
  attempts integer not null check (attempts between 1 and 5),
  primary key(owner_id,utc_day)
);
alter table on_track_private.coach_request_limits enable row level security;
revoke all on on_track_private.coach_request_limits from public, anon, authenticated;
-- Private SECURITY DEFINER is necessary to keep callers from resetting their counters.
-- Explicit auth.uid guard, fixed search path, no caller-selected owner/date/count.
create function on_track_private.claim_coach_request() returns boolean
language plpgsql security definer set search_path = '' as $$
declare who uuid := auth.uid(); n integer; today_utc date := (now() at time zone 'UTC')::date;
begin
  if who is null then raise exception 'Authentication required' using errcode='42501'; end if;
  insert into on_track_private.coach_request_limits(owner_id,utc_day,attempts) values(who,today_utc,1)
  on conflict(owner_id,utc_day) do update set attempts=on_track_private.coach_request_limits.attempts+1
  where on_track_private.coach_request_limits.attempts < 5
  returning attempts into n;
  return n is not null;
end $$;
revoke all on function on_track_private.claim_coach_request() from public, anon;
grant execute on function on_track_private.claim_coach_request() to authenticated;
create function public.claim_on_track_coach_request() returns boolean
language sql security invoker set search_path = '' as $$ select on_track_private.claim_coach_request(); $$;
revoke all on function public.claim_on_track_coach_request() from public, anon;
grant execute on function public.claim_on_track_coach_request() to authenticated;
