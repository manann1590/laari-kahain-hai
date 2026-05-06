-- ══════════════════════════════════════════════════════════════════════════════
-- LAARI KAHAIN HAI — Complete Supabase Setup
-- Run this ONCE in the Supabase SQL Editor on a fresh project.
-- Every statement is idempotent: safe to re-run if something fails mid-way.
-- ══════════════════════════════════════════════════════════════════════════════


-- ── 0. Extensions ─────────────────────────────────────────────────────────────

CREATE EXTENSION IF NOT EXISTS "pgcrypto";


-- ── 1. Tracking-ID sequence ───────────────────────────────────────────────────

CREATE SEQUENCE IF NOT EXISTS public.report_tracking_seq;


-- ── 2. Core tables ────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.vendors (
  -- Identity
  id                       UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  tracking_id              TEXT         UNIQUE,

  -- Vendor / listing details
  category                 TEXT         NOT NULL CHECK (category IN (
                             'chaat_snacks','tea_coffee','meals_thali','fast_food',
                             'south_indian','desserts','juice_shakes',
                             'street_chinese','breakfast','late_night','other'
                           )),
  title                    TEXT,
  description              TEXT,
  menu_text                TEXT,
  vendor_phone             TEXT,
  vendor_whatsapp          TEXT,
  cuisine_tags             TEXT,
  price_range              TEXT,
  hours_text               TEXT,

  -- Location
  latitude                 DOUBLE PRECISION NOT NULL,
  longitude                DOUBLE PRECISION NOT NULL,
  address_text             TEXT,
  area                     TEXT,
  district                 TEXT,
  city                     TEXT         DEFAULT 'Ahmedabad',
  state                    TEXT         DEFAULT 'Gujarat',
  country                  TEXT         DEFAULT 'India',

  -- Media
  image_url                TEXT,
  image_path               TEXT,
  stall_photo_url          TEXT,
  stall_photo_path         TEXT,

  -- Moderation
  status                   TEXT         NOT NULL DEFAULT 'pending' CHECK (status IN (
                             'pending','approved','verified','rejected','duplicate'
                           )),
  severity                 TEXT         DEFAULT 'medium' CHECK (severity IN ('low','medium','high','critical')),
  verification_level       TEXT         DEFAULT 'medium' CHECK (verification_level IN ('high','medium','low')),
  source                   TEXT         DEFAULT 'public_form',
  admin_notes              TEXT,
  reporter_phone_hash      TEXT,
  duplicate_of             UUID         REFERENCES public.vendors(id),
  confirmation_count       INTEGER      DEFAULT 1,

  -- Timestamps
  created_at               TIMESTAMPTZ  DEFAULT timezone('utc', now()),
  updated_at               TIMESTAMPTZ  DEFAULT timezone('utc', now()),
  approved_at              TIMESTAMPTZ,
  rejected_at              TIMESTAMPTZ
);

-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.vendor_events (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id       UUID        REFERENCES public.vendors(id) ON DELETE CASCADE,
  event_type      TEXT        NOT NULL,
  old_status      TEXT,
  new_status      TEXT,
  note            TEXT,
  actor           TEXT        DEFAULT 'admin',
  proof_image_url TEXT,
  created_at      TIMESTAMPTZ DEFAULT timezone('utc', now())
);

-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.listing_confirmations (
  id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id         UUID        REFERENCES public.vendors(id) ON DELETE CASCADE,
  confirmation_hash TEXT,
  created_at        TIMESTAMPTZ DEFAULT timezone('utc', now())
);


-- ── 3. Indexes ────────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS vendors_status_idx          ON public.vendors(status);
CREATE INDEX IF NOT EXISTS vendors_category_idx        ON public.vendors(category);
CREATE INDEX IF NOT EXISTS vendors_district_idx        ON public.vendors(district);
CREATE INDEX IF NOT EXISTS vendors_area_idx            ON public.vendors(area);
CREATE INDEX IF NOT EXISTS vendors_vendor_phone_idx    ON public.vendors(vendor_phone);
CREATE INDEX IF NOT EXISTS vendors_created_at_idx      ON public.vendors(created_at DESC);
CREATE INDEX IF NOT EXISTS vendors_lat_lng_idx         ON public.vendors(latitude, longitude);
CREATE INDEX IF NOT EXISTS vendors_duplicate_of_idx    ON public.vendors(duplicate_of);
CREATE INDEX IF NOT EXISTS vendor_events_vendor_id_idx ON public.vendor_events(vendor_id);


-- ── 4. Functions ──────────────────────────────────────────────────────────────

-- Auto-update updated_at on every row change
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = timezone('utc', now());
  RETURN NEW;
END;
$$;

-- Generate a human-readable tracking ID: LKH-AHD-2025-000001
CREATE OR REPLACE FUNCTION public.generate_tracking_id()
RETURNS TEXT LANGUAGE plpgsql AS $$
DECLARE
  yr  TEXT;
  seq BIGINT;
BEGIN
  yr  := to_char(now() AT TIME ZONE 'Asia/Kolkata', 'YYYY');
  seq := nextval('public.report_tracking_seq');
  RETURN 'LKH-AHD-' || yr || '-' || lpad(seq::text, 6, '0');
END;
$$;

-- Assign tracking ID before insert if not supplied
CREATE OR REPLACE FUNCTION public.set_tracking_id()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.tracking_id IS NULL THEN
    NEW.tracking_id := public.generate_tracking_id();
  END IF;
  RETURN NEW;
END;
$$;


-- ── 5. Triggers ───────────────────────────────────────────────────────────────

DROP TRIGGER IF EXISTS vendors_set_updated_at  ON public.vendors;
CREATE TRIGGER vendors_set_updated_at
  BEFORE UPDATE ON public.vendors
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS vendors_set_tracking_id ON public.vendors;
CREATE TRIGGER vendors_set_tracking_id
  BEFORE INSERT ON public.vendors
  FOR EACH ROW EXECUTE FUNCTION public.set_tracking_id();


-- ── 6. Row Level Security ─────────────────────────────────────────────────────

ALTER TABLE public.vendors               ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendor_events         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listing_confirmations ENABLE ROW LEVEL SECURITY;

-- vendors: anyone can submit a new listing (server validates before insert)
DROP POLICY IF EXISTS "Public can submit vendors" ON public.vendors;
CREATE POLICY "Public can submit vendors"
  ON public.vendors FOR INSERT
  WITH CHECK (true);

-- vendors: public can only read verified listings
DROP POLICY IF EXISTS "Public can read verified vendors" ON public.vendors;
CREATE POLICY "Public can read verified vendors"
  ON public.vendors FOR SELECT
  USING (status IN ('approved','verified'));

-- vendor_events: readable only when the parent vendor is verified
DROP POLICY IF EXISTS "Public can read events for verified vendors" ON public.vendor_events;
CREATE POLICY "Public can read events for verified vendors"
  ON public.vendor_events FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.vendors
      WHERE vendors.id = vendor_events.vendor_id
        AND vendors.status IN ('approved','verified')
    )
  );

-- listing_confirmations: community can confirm verified listings
DROP POLICY IF EXISTS "Public can add listing confirmations" ON public.listing_confirmations;
CREATE POLICY "Public can add listing confirmations"
  ON public.listing_confirmations FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.vendors
      WHERE vendors.id = listing_confirmations.vendor_id
        AND vendors.status IN ('approved','verified')
    )
  );


-- ── 7. Storage ────────────────────────────────────────────────────────────────

-- Public bucket so verified listing images are accessible via URL
INSERT INTO storage.buckets (id, name, public)
VALUES ('vendor-images', 'vendor-images', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public read vendor images" ON storage.objects;
CREATE POLICY "Public read vendor images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'vendor-images');

-- Upload goes through the Next.js server action using the service-role key,
-- so no anon upload policy is needed here.


-- ══════════════════════════════════════════════════════════════════════════════
-- Done. Tables are empty and ready for real vendor submissions.
-- Verify with:
--   SELECT COUNT(*) FROM public.vendors;   -- should be 0
-- ══════════════════════════════════════════════════════════════════════════════


-- ── TEARDOWN — paste this block in SQL Editor to wipe everything ──────────────
--
-- TRUNCATE public.listing_confirmations, public.vendor_events, public.vendors
-- RESTART IDENTITY CASCADE;
--
-- Or to drop all tables completely:
-- DROP TABLE IF EXISTS public.listing_confirmations CASCADE;
-- DROP TABLE IF EXISTS public.vendor_events CASCADE;
-- DROP TABLE IF EXISTS public.vendors CASCADE;
-- DROP FUNCTION IF EXISTS public.set_updated_at CASCADE;
-- DROP FUNCTION IF EXISTS public.set_tracking_id CASCADE;
-- DROP FUNCTION IF EXISTS public.generate_tracking_id CASCADE;
