-- While Your Out: photos. Run once in Supabase -> SQL Editor -> New query -> Run

-- Where the photo lives in storage (empty when an item has no photo).
alter table public.items add column if not exists photo_path text;

-- A public "photos" bucket to hold the pictures.
insert into storage.buckets (id, name, public)
values ('photos', 'photos', true)
on conflict (id) do nothing;

-- Anyone with the link can upload, view and delete photos in that bucket.
drop policy if exists "photos upload" on storage.objects;
drop policy if exists "photos read"   on storage.objects;
drop policy if exists "photos delete" on storage.objects;

create policy "photos upload" on storage.objects
  for insert to anon, authenticated with check (bucket_id = 'photos');
create policy "photos read" on storage.objects
  for select to anon, authenticated using (bucket_id = 'photos');
create policy "photos delete" on storage.objects
  for delete to anon, authenticated using (bucket_id = 'photos');
