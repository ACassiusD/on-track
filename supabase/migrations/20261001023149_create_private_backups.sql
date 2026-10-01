-- Immutable real-mode snapshots. The publishable API key never bypasses ownership.
create table public.on_track_backups (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  schema_version integer not null default 1 check (schema_version = 1),
  captured_at timestamptz not null,
  created_at timestamptz not null default now(),
  payload jsonb not null check (jsonb_typeof(payload) = 'object' and payload->>'version' = '1' and payload->>'photosIncluded' = 'false' and octet_length(payload::text) <= 2000000),
  summary jsonb not null check (jsonb_typeof(summary) = 'object')
);
create index on_track_backups_owner_created on public.on_track_backups(owner_id, created_at desc);
alter table public.on_track_backups enable row level security;
revoke all on public.on_track_backups from anon, authenticated;
grant select, insert, delete on public.on_track_backups to authenticated;
create policy on_track_backups_select_owner on public.on_track_backups for select to authenticated using ((select auth.uid()) = owner_id);
create policy on_track_backups_insert_owner on public.on_track_backups for insert to authenticated with check ((select auth.uid()) = owner_id);
create policy on_track_backups_delete_owner on public.on_track_backups for delete to authenticated using ((select auth.uid()) = owner_id);
-- No UPDATE grants/policy: previews always point to an immutable snapshot.

-- Photo upload is not enabled in the client yet. Provision a private owner-folder bucket
-- so future implementation cannot accidentally use publicly accessible photos.
insert into storage.buckets(id, name, public, file_size_limit, allowed_mime_types)
values ('on-track-private-photos', 'on-track-private-photos', false, 15000000, array['image/jpeg','image/png','image/heic','image/heif'])
on conflict (id) do nothing;
create policy on_track_photos_select_owner on storage.objects for select to authenticated using (bucket_id = 'on-track-private-photos' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy on_track_photos_insert_owner on storage.objects for insert to authenticated with check (bucket_id = 'on-track-private-photos' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy on_track_photos_delete_owner on storage.objects for delete to authenticated using (bucket_id = 'on-track-private-photos' and (storage.foldername(name))[1] = (select auth.uid())::text);
-- Immutable names; no upsert/UPDATE. Originals require explicit ownership deletion.
