begin;
create temporary table ontrack_test_ids(a uuid, b uuid);
insert into ontrack_test_ids values (gen_random_uuid(), gen_random_uuid());
grant select on ontrack_test_ids to authenticated;
insert into auth.users(id) select a from ontrack_test_ids union all select b from ontrack_test_ids;
insert into public.on_track_backups(owner_id,captured_at,payload,summary)
select a, now(), '{"version":1,"photosIncluded":false}'::jsonb, '{}'::jsonb from ontrack_test_ids
union all select b, now(), '{"version":1,"photosIncluded":false}'::jsonb, '{}'::jsonb from ontrack_test_ids;
select set_config('request.jwt.claim.sub',(select a::text from ontrack_test_ids),true);
set local role authenticated;
do $$
declare other_user uuid; own_user uuid; n integer;
begin
 select a,b into own_user,other_user from ontrack_test_ids;
 if (select count(*) from public.on_track_backups) <> 1 then raise exception 'Owner SELECT failed'; end if;
 insert into public.on_track_backups(owner_id,captured_at,payload,summary) values(own_user,now(),'{"version":1,"photosIncluded":false}','{}');
 begin
  insert into public.on_track_backups(owner_id,captured_at,payload,summary) values(other_user,now(),'{"version":1,"photosIncluded":false}','{}');
  raise exception 'Cross-owner INSERT unexpectedly passed';
 exception when insufficient_privilege then null;
 end;
 delete from public.on_track_backups where owner_id = other_user; get diagnostics n = row_count;
 if n <> 0 then raise exception 'Cross-owner DELETE unexpectedly passed'; end if;
 begin
  update public.on_track_backups set owner_id=other_user where owner_id=own_user;
  raise exception 'UPDATE unexpectedly passed';
 exception when insufficient_privilege then null;
 end;
 insert into storage.objects(bucket_id,name) values('on-track-private-photos',own_user::text||'/rls-test.jpg');
 begin
  insert into storage.objects(bucket_id,name) values('on-track-private-photos',other_user::text||'/rls-test.jpg');
  raise exception 'Cross-owner photo INSERT unexpectedly passed';
 exception when insufficient_privilege then null;
 end;
 if (select count(*) from storage.objects where bucket_id='on-track-private-photos') <> 1 then raise exception 'Photo owner SELECT failed'; end if;
 delete from public.on_track_backups where owner_id=own_user; get diagnostics n = row_count;
 if n <> 2 then raise exception 'Owner DELETE failed'; end if;
end $$;
reset role;
set local role anon;
do $$ begin
 begin
  perform id from public.on_track_backups;
  raise exception 'Anonymous SELECT unexpectedly passed';
 exception when insufficient_privilege then null;
 end;
end $$;
reset role;
rollback;
select 'Owner/cross-owner snapshot and photo RLS tests passed; all fixtures rolled back' as result;
