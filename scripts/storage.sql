/*
Public-read buckets for the single site avatar and the optional page background.

Every object is written by a server action that re-encodes the upload with
sharp, so the allowed MIME list describes what each bucket actually stores, not
what a browser may upload. The actions reject unsupported input types first.

Run with: psql "$DATABASE_URL" -f scripts/storage.sql
*/

insert into storage.buckets (
  allowed_mime_types,
  file_size_limit,
  id,
  name,
  public
)
values (
  array['image/jpeg', 'image/png', 'image/webp'],
  5242880,
  'avatar',
  'avatar',
  true
)
on conflict (id) do update set
  allowed_mime_types = excluded.allowed_mime_types,
  file_size_limit = excluded.file_size_limit,
  public = excluded.public;

insert into storage.buckets (
  allowed_mime_types,
  file_size_limit,
  id,
  name,
  public
)
values (
  array['image/avif', 'image/webp'],
  5242880,
  'background',
  'background',
  true
)
on conflict (id) do update set
  allowed_mime_types = excluded.allowed_mime_types,
  file_size_limit = excluded.file_size_limit,
  public = excluded.public;

drop policy if exists "avatar public read" on storage.objects;
create policy "avatar public read"
  on storage.objects
  for select
  to public
  using (bucket_id = 'avatar');

drop policy if exists "avatar authenticated insert" on storage.objects;
create policy "avatar authenticated insert"
  on storage.objects
  for insert
  to authenticated
  with check (bucket_id = 'avatar');

drop policy if exists "avatar authenticated update" on storage.objects;
create policy "avatar authenticated update"
  on storage.objects
  for update
  to authenticated
  using (bucket_id = 'avatar')
  with check (bucket_id = 'avatar');

drop policy if exists "avatar authenticated delete" on storage.objects;
create policy "avatar authenticated delete"
  on storage.objects
  for delete
  to authenticated
  using (bucket_id = 'avatar');

drop policy if exists "background public read" on storage.objects;
create policy "background public read"
  on storage.objects
  for select
  to public
  using (bucket_id = 'background');

drop policy if exists "background authenticated insert" on storage.objects;
create policy "background authenticated insert"
  on storage.objects
  for insert
  to authenticated
  with check (bucket_id = 'background');

drop policy if exists "background authenticated update" on storage.objects;
create policy "background authenticated update"
  on storage.objects
  for update
  to authenticated
  using (bucket_id = 'background')
  with check (bucket_id = 'background');

drop policy if exists "background authenticated delete" on storage.objects;
create policy "background authenticated delete"
  on storage.objects
  for delete
  to authenticated
  using (bucket_id = 'background');
