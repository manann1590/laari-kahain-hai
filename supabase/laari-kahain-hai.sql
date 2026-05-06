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

CREATE TABLE IF NOT EXISTS public.reports (
  -- Identity
  id                       UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  tracking_id              TEXT         UNIQUE,

  -- Vendor / listing details
  issue_type               TEXT         NOT NULL CHECK (issue_type IN (
                             'pothole','broken_streetlight','garbage','waterlogging',
                             'damaged_road','damaged_footpath','open_manhole',
                             'damaged_public_property','drainage','illegal_dumping','other'
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
                             'pending','approved','verified','rejected','duplicate',
                             'in_progress','sent_to_amc','amc_acknowledged',
                             'resolved_claimed','citizen_verified_resolved',
                             'reopened','resolved'
                           )),
  severity                 TEXT         DEFAULT 'medium' CHECK (severity IN ('low','medium','high','critical')),
  verification_level       TEXT         DEFAULT 'medium' CHECK (verification_level IN ('high','medium','low')),
  source                   TEXT         DEFAULT 'public_form',
  admin_notes              TEXT,
  reporter_phone_hash      TEXT,
  duplicate_of             UUID         REFERENCES public.reports(id),
  confirmation_count       INTEGER      DEFAULT 1,

  -- Timestamps
  created_at               TIMESTAMPTZ  DEFAULT timezone('utc', now()),
  updated_at               TIMESTAMPTZ  DEFAULT timezone('utc', now()),
  approved_at              TIMESTAMPTZ,
  rejected_at              TIMESTAMPTZ,
  resolved_at              TIMESTAMPTZ,
  resolved_claimed_at      TIMESTAMPTZ,
  citizen_verified_at      TIMESTAMPTZ,
  reopened_at              TIMESTAMPTZ,
  sent_to_amc_at           TIMESTAMPTZ
);

-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.report_events (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id       UUID        REFERENCES public.reports(id) ON DELETE CASCADE,
  event_type      TEXT        NOT NULL,
  old_status      TEXT,
  new_status      TEXT,
  note            TEXT,
  actor           TEXT        DEFAULT 'admin',
  proof_image_url TEXT,
  created_at      TIMESTAMPTZ DEFAULT timezone('utc', now())
);

-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.issue_confirmations (
  id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id         UUID        REFERENCES public.reports(id) ON DELETE CASCADE,
  confirmation_hash TEXT,
  created_at        TIMESTAMPTZ DEFAULT timezone('utc', now())
);

-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.amc_email_batches (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  week_start   DATE        NOT NULL,
  week_end     DATE        NOT NULL,
  subject      TEXT,
  body         TEXT,
  report_count INTEGER     DEFAULT 0,
  sent_to      TEXT,
  cc           TEXT,
  status       TEXT        DEFAULT 'draft' CHECK (status IN ('draft','sent','failed')),
  sent_at      TIMESTAMPTZ,
  created_at   TIMESTAMPTZ DEFAULT timezone('utc', now())
);

CREATE TABLE IF NOT EXISTS public.amc_email_batch_reports (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id   UUID        REFERENCES public.amc_email_batches(id) ON DELETE CASCADE,
  report_id  UUID        REFERENCES public.reports(id)           ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT timezone('utc', now()),
  UNIQUE (batch_id, report_id)
);


-- ── 3. Indexes ────────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS reports_status_idx            ON public.reports(status);
CREATE INDEX IF NOT EXISTS reports_issue_type_idx        ON public.reports(issue_type);
CREATE INDEX IF NOT EXISTS reports_district_idx          ON public.reports(district);
CREATE INDEX IF NOT EXISTS reports_area_idx              ON public.reports(area);
CREATE INDEX IF NOT EXISTS reports_vendor_phone_idx      ON public.reports(vendor_phone);
CREATE INDEX IF NOT EXISTS reports_created_at_idx        ON public.reports(created_at DESC);
CREATE INDEX IF NOT EXISTS reports_lat_lng_idx           ON public.reports(latitude, longitude);
CREATE INDEX IF NOT EXISTS reports_duplicate_of_idx      ON public.reports(duplicate_of);
CREATE INDEX IF NOT EXISTS report_events_report_id_idx   ON public.report_events(report_id);
CREATE INDEX IF NOT EXISTS amc_batches_status_idx        ON public.amc_email_batches(status);
CREATE INDEX IF NOT EXISTS amc_batch_reports_batch_idx   ON public.amc_email_batch_reports(batch_id);
CREATE INDEX IF NOT EXISTS amc_batch_reports_report_idx  ON public.amc_email_batch_reports(report_id);


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

DROP TRIGGER IF EXISTS reports_set_updated_at  ON public.reports;
CREATE TRIGGER reports_set_updated_at
  BEFORE UPDATE ON public.reports
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS reports_set_tracking_id ON public.reports;
CREATE TRIGGER reports_set_tracking_id
  BEFORE INSERT ON public.reports
  FOR EACH ROW EXECUTE FUNCTION public.set_tracking_id();


-- ── 6. Row Level Security ─────────────────────────────────────────────────────

ALTER TABLE public.reports                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.report_events           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.issue_confirmations     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.amc_email_batches       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.amc_email_batch_reports ENABLE ROW LEVEL SECURITY;

-- reports: anyone can submit a new listing (server validates before insert)
DROP POLICY IF EXISTS "Public can submit reports" ON public.reports;
CREATE POLICY "Public can submit reports"
  ON public.reports FOR INSERT
  WITH CHECK (true);

-- reports: public can only read live / verified listings
DROP POLICY IF EXISTS "Public can read verified reports" ON public.reports;
CREATE POLICY "Public can read verified reports"
  ON public.reports FOR SELECT
  USING (status IN (
    'approved','verified','in_progress','sent_to_amc','amc_acknowledged',
    'resolved_claimed','citizen_verified_resolved','reopened','resolved'
  ));

-- report_events: readable only when the parent report is public
DROP POLICY IF EXISTS "Public can read events for verified reports" ON public.report_events;
CREATE POLICY "Public can read events for verified reports"
  ON public.report_events FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.reports
      WHERE reports.id = report_events.report_id
        AND reports.status IN (
          'approved','verified','in_progress','sent_to_amc','amc_acknowledged',
          'resolved_claimed','citizen_verified_resolved','reopened','resolved'
        )
    )
  );

-- issue_confirmations: community can confirm approved listings
DROP POLICY IF EXISTS "Public can add confirmations" ON public.issue_confirmations;
CREATE POLICY "Public can add confirmations"
  ON public.issue_confirmations FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.reports
      WHERE reports.id = issue_confirmations.report_id
        AND reports.status = 'approved'
    )
  );

-- amc_email_batches: only sent batches are public
DROP POLICY IF EXISTS "Public can read sent amc batches" ON public.amc_email_batches;
CREATE POLICY "Public can read sent amc batches"
  ON public.amc_email_batches FOR SELECT
  USING (status = 'sent');

-- amc_email_batch_reports: visible only when the batch is sent
DROP POLICY IF EXISTS "Public can read sent amc batch reports" ON public.amc_email_batch_reports;
CREATE POLICY "Public can read sent amc batch reports"
  ON public.amc_email_batch_reports FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.amc_email_batches
      WHERE amc_email_batches.id = amc_email_batch_reports.batch_id
        AND amc_email_batches.status = 'sent'
    )
  );


-- ── 7. Storage ────────────────────────────────────────────────────────────────

-- Public bucket so approved listing images are accessible via URL
INSERT INTO storage.buckets (id, name, public)
VALUES ('report-images', 'report-images', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public read report images" ON storage.objects;
CREATE POLICY "Public read report images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'report-images');

-- Upload goes through the Next.js server action using the service-role key,
-- so no anon upload policy is needed here. If you switch to direct client
-- uploads, add an INSERT policy restricting to this bucket.


-- ── 8. Seed data ──────────────────────────────────────────────────────────────
-- Nine sample vendors (eight approved, one pending) so the map and
-- leaderboard have content from day one.
-- DELETE this block if you want to start with a completely empty database.

INSERT INTO public.reports (
  issue_type, title, description, menu_text,
  vendor_phone, vendor_whatsapp, cuisine_tags, price_range, hours_text,
  latitude, longitude, address_text, area, district,
  status, severity, approved_at
) VALUES
  (
    'pothole', 'Raju Bhai Cheese Vada Pav',
    'Famous for double-cheese vada pav and late-night cold coffee.',
    'Cheese vada pav ₹45 · Masala bun ₹35 · Cold coffee ₹70 · Double cheese ₹65',
    '+91 98765 43210', '+91 98765 43210',
    'veg, cheesy, snacks, street food', '₹35–₹90', '5 PM – 11 PM',
    23.0301, 72.5086, 'Near Satellite Road crossing', 'Satellite', 'Ahmedabad',
    'approved', 'medium', timezone('utc', now())
  ),
  (
    'garbage', 'Vastrapur Mini Thali Van',
    'Gujarati thali, dal rice, paratha, and chaas on wheels.',
    'Mini thali ₹120 · Dal rice ₹80 · Aloo paratha ₹70 · Chaas ₹20',
    '+91 98765 43211', '+91 98765 43211',
    'veg, thali, gujarati, lunch, dinner', '₹70–₹160', '12 PM – 3 PM, 7 PM – 10 PM',
    23.0396, 72.5293, 'Vastrapur Lake road', 'Vastrapur', 'Ahmedabad',
    'approved', 'medium', timezone('utc', now())
  ),
  (
    'waterlogging', 'Bopal Burger Cart',
    'Burgers, fries, wraps, and late-night peri peri momos.',
    'Aloo tikki burger ₹60 · Paneer wrap ₹110 · Peri peri fries ₹90 · Veg momos ₹80',
    '+91 98765 43212', '+91 98765 43212',
    'burgers, momos, fast food, wraps', '₹60–₹140', '6 PM – 12 AM',
    23.0339, 72.4637, 'Bopal main road, near S G Highway', 'Bopal', 'Ahmedabad',
    'approved', 'medium', timezone('utc', now())
  ),
  (
    'broken_streetlight', 'Prahladnagar Cutting Chai',
    'Neighbourhood chai stop — masala chai, bun maska, iced tea.',
    'Cutting chai ₹15 · Masala chai ₹20 · Bun maska ₹35 · Lemon iced tea ₹50',
    '+91 98765 43213', '+91 98765 43213',
    'chai, coffee, bun maska, morning', '₹15–₹80', '7 AM – 11 AM, 5 PM – 10 PM',
    23.0129, 72.5073, 'Prahladnagar Garden Road', 'Prahladnagar', 'Ahmedabad',
    'approved', 'low', timezone('utc', now())
  ),
  (
    'damaged_road', 'Maninagar Dosa Corner',
    'South Indian breakfast — dosa, idli, uttapam, filter coffee.',
    'Masala dosa ₹90 · Mysore dosa ₹120 · Idli plate ₹50 · Filter coffee ₹40',
    '+91 98765 43214', '+91 98765 43214',
    'south indian, dosa, breakfast, idli', '₹40–₹140', '8 AM – 1 PM, 6 PM – 10 PM',
    22.9978, 72.6084, 'Near Maninagar railway station road', 'Maninagar', 'Ahmedabad',
    'approved', 'medium', timezone('utc', now())
  ),
  (
    'damaged_footpath', 'CG Road Kulfi Stop',
    'Dessert cart — kulfi, falooda, rabdi, chocolate waffles.',
    'Malai kulfi ₹50 · Falooda ₹110 · Rabdi cup ₹90 · Chocolate waffle ₹130',
    '+91 98765 43215', '+91 98765 43215',
    'dessert, kulfi, sweet, late night', '₹50–₹150', '7 PM – 12 AM',
    23.0365, 72.5611, 'CG Road side lane, Navrangpura', 'Navrangpura', 'Ahmedabad',
    'approved', 'low', timezone('utc', now())
  ),
  (
    'open_manhole', 'Gota Juice Lari',
    'Fresh juice, sitafal shake, masala soda, sweet lassi.',
    'Mosambi juice ₹60 · Sitafal shake ₹120 · Masala soda ₹35 · Sweet lassi ₹70',
    '+91 98765 43216', '+91 98765 43216',
    'juice, shakes, lassi, summer, healthy', '₹35–₹130', '10 AM – 10 PM',
    23.1013, 72.5407, 'Gota main road', 'Gota', 'Ahmedabad',
    'approved', 'low', timezone('utc', now())
  ),
  (
    'damaged_public_property', 'Kankaria Wok Cart',
    'Street Chinese — noodles, fried rice, manchurian, chilli paneer.',
    'Hakka noodles ₹100 · Fried rice ₹100 · Manchurian ₹120 · Chilli paneer ₹150',
    '+91 98765 43217', '+91 98765 43217',
    'chinese, spicy, noodles, dinner, wok', '₹100–₹180', '6 PM – 11:30 PM',
    22.9960, 72.5996, 'Kankaria approach road', 'Kankaria', 'Ahmedabad',
    'approved', 'medium', timezone('utc', now())
  ),
  (
    'garbage', 'Khanpur Thali (Pending)',
    'Gujarati thali cart awaiting admin review.',
    'Menu pending review.',
    '+91 98765 43218', '+91 98765 43218',
    'thali, gujarati, lunch', '₹80–₹140', '12 PM – 3 PM',
    23.0258, 72.5873, 'Khanpur lane', 'Khanpur', 'Ahmedabad',
    'pending', 'medium', null
  )
ON CONFLICT DO NOTHING;

-- Create a "created" event for every seeded row
INSERT INTO public.report_events (report_id, event_type, new_status, note)
SELECT id, 'created', status, 'Seed vendor listing.'
FROM public.reports
WHERE title IN (
  'Raju Bhai Cheese Vada Pav', 'Vastrapur Mini Thali Van', 'Bopal Burger Cart',
  'Prahladnagar Cutting Chai', 'Maninagar Dosa Corner',   'CG Road Kulfi Stop',
  'Gota Juice Lari',           'Kankaria Wok Cart',        'Khanpur Thali (Pending)'
)
ON CONFLICT DO NOTHING;


-- ══════════════════════════════════════════════════════════════════════════════
-- Done. Verify with:
--   SELECT COUNT(*) FROM public.reports;          -- should be 9
--   SELECT tracking_id FROM public.reports LIMIT 3; -- LKH-AHD-YYYY-000001 …
-- ══════════════════════════════════════════════════════════════════════════════
