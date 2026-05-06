# Lari Local

Lari Local is a Supabase-backed food truck and food lari discovery platform for Ahmedabad.

Vendors can submit a listing with their lari/truck name, cuisine, menu, public phone/WhatsApp number, current standing location, hours, price range, tags, and a fresh camera photo. Admins review submissions before they appear publicly. Customers can browse a live map, scan a vendor table, open a vendor profile, see the menu, call/WhatsApp, and get directions.

Positioning: "Find the lari before it rolls away."

## Features

- Vendor listing form with camera photo upload and browser geolocation.
- Public food map of verified food trucks, laris, carts, and pop-ups.
- Vendor table with cuisine, location, menu preview, hours, and contact actions.
- Filters by cuisine, status, area, and district.
- Public vendor detail pages with menu, phone, WhatsApp, photo, and directions.
- Food board with area rankings and cuisine breakdown.
- Admin password-based login.
- Protected admin moderation dashboard.
- Manual admin vendor creation from verified photo/location details.
- Listing edit, approve, reject, close, and duplicate workflows.
- Supabase Storage upload for vendor photos.
- Public privacy boundaries: no admin notes, no pending/rejected listings, and only vendor-provided public contact details.

## Tech Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Supabase database and storage
- Supabase client SDK
- Leaflet and React Leaflet
- OpenStreetMap tiles
- Zod validation
- Lucide icons

No paid API, Google Maps API, mobile app, AI service, or public user signup is required.

## Local Setup

Install Node.js 20 or newer, then:

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open `http://localhost:3000`.

## Environment Variables

Create `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_SITE_URL=http://localhost:3000
ADMIN_EMAIL=
ADMIN_PASSWORD=
```

Notes:

- `SUPABASE_SERVICE_ROLE_KEY` is used only by server actions. It is needed for admin moderation and public pending-submission creation.
- `ADMIN_EMAIL` and `ADMIN_PASSWORD` are the admin login credentials.
- Never expose `ADMIN_PASSWORD` or `SUPABASE_SERVICE_ROLE_KEY` in browser code.

## Supabase Setup

1. Create a free Supabase project.
2. In SQL Editor, run `supabase/schema.sql`.
3. Optional: run `supabase/seed.sql` to insert sample Ahmedabad vendor listings.
4. Run `supabase/storage-policies.sql` to create the `report-images` bucket.
5. Add the Supabase project URL, anon key, and service role key to `.env.local`.

See `supabase/README.md` for RLS and storage privacy notes.

## Public Submission Flow

1. Vendor opens `/reports/new`.
2. Vendor adds name, cuisine, menu, phone, WhatsApp, hours, price range, and tags.
3. Vendor captures a fresh camera photo.
4. Vendor uses browser location or enters latitude/longitude manually.
5. Vendor submits the listing.
6. The listing is stored as `pending`.
7. Admin reviews privacy/safety in `/admin`.
8. Admin approves the listing.
9. The listing appears on `/map`, `/leaderboard`, and its public detail page.

## Admin Moderation Flow

- `pending`: newly submitted public or manual admin listing.
- `approved`: verified and public.
- `resolved`: public, but marked closed/inactive.
- `rejected`: not public.
- `duplicate`: not public.

Admins should approve only clear, location-backed, food-vendor listings. Unsafe images or descriptions should be rejected or edited before approval.

## Privacy Notes

- Public users do not sign up.
- Vendor listings can show vendor-provided public phone/WhatsApp numbers.
- `admin_notes` are never shown publicly.
- Pending, rejected, and duplicate listings are not public.
- Public pages use public Supabase queries and only aggregate approved/resolved listing data.
- Images should be reviewed before publishing.

## Mobile Notes

- The vendor listing form uses mobile camera capture.
- The location button uses browser geolocation.
- Camera and location access work best on HTTPS, which Vercel provides automatically.
- If testing from a phone against a local network URL like `http://192.168.x.x:3000`, location access may be blocked by the mobile browser.

## Security Notes

- RLS allows public reads only for public statuses.
- Admin pages are protected by middleware and server-side auth checks.
- Admin actions require the HTTP-only admin cookie.
- Server secrets are isolated in server-only modules.
- Public submissions include basic validation, browser-side image resizing to 300 KB or less, server-side file signature checks for JPG/PNG/GIF/WebP only, a hidden honeypot field, and a short cookie cooldown.

## Running Checks

```bash
npm run lint
npm run typecheck
```
# laari-kahain-hai
