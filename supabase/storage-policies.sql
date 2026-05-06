insert into storage.buckets (id, name, public)
values ('report-images', 'report-images', true)
on conflict (id) do nothing;

drop policy if exists "Public read report images" on storage.objects;
create policy "Public read report images"
on storage.objects
for select
using (bucket_id = 'report-images');

-- MVP storage note:
-- This bucket is public because report images are shown on public verified reports.
-- Supabase Storage policies cannot directly check report status from the object alone.
-- Upload images only through the protected admin UI, and review images before approval.
-- Production hardening: use a private bucket, strip EXIF, blur faces/plates, and serve signed URLs
-- only after a report is approved.
