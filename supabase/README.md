# Lari Local Supabase Setup

This folder contains the SQL needed for Supabase setup.

## Files

- `schema.sql`: database tables, constraints, indexes, RLS policies, and the `updated_at` trigger.
- `seed.sql`: sample Ahmedabad vendor listings for local testing.
- `storage-policies.sql`: public `report-images` bucket and read policy.

## Database Setup

1. Create a free Supabase project.
2. Open SQL Editor.
3. Run `schema.sql`.
4. Optional: run `seed.sql` for sample data.
5. Copy the project URL, anon key, and service role key into `.env.local`.

## Storage Setup

Run `storage-policies.sql` in SQL Editor. It creates a public bucket named `report-images`.

Privacy note: the bucket is public, so any uploaded object URL can be viewed by anyone who has the URL. Supabase Storage policies cannot automatically check whether the linked report has been approved.

Admin workflow requirement: upload only reviewed food vendor images. Before approving a listing, check for faces, license plates, children, private documents, private interiors, harassment content, or other sensitive details.

Production hardening:

- Use a private bucket.
- Strip EXIF metadata before upload.
- Blur faces and vehicle plates.
- Store moderation status for images separately.
- Serve signed URLs only after report approval.

## RLS Notes

RLS is enabled on all tables.

Public users can read only listings where `status in ('approved', 'resolved')`. Pending, rejected, duplicate, phone hash, and admin notes are never queried by public pages.

Admin writes use the Supabase service role key from protected Next.js server actions. The service role key must never be exposed to the browser.

Production hardening:

- Replace the password-cookie auth with Supabase Auth.
- Create an `admins` table or custom claims for authorization.
- Add authenticated admin RLS policies.
- Rotate the service role key if it is ever exposed.
