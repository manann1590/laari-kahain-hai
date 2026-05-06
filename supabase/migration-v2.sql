-- Lari Local v2 migration
-- Run this in Supabase SQL Editor after schema.sql

-- ── 1. Tracking ID ─────────────────────────────────────────────────────────

CREATE SEQUENCE IF NOT EXISTS public.report_tracking_seq;

CREATE OR REPLACE FUNCTION public.generate_tracking_id()
RETURNS TEXT LANGUAGE plpgsql AS $$
DECLARE
  yr TEXT;
  seq BIGINT;
BEGIN
  yr  := to_char(now() AT TIME ZONE 'Asia/Kolkata', 'YYYY');
  seq := nextval('public.report_tracking_seq');
  RETURN 'LARI-AHD-' || yr || '-' || lpad(seq::text, 6, '0');
END;
$$;

ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS tracking_id TEXT UNIQUE;

CREATE OR REPLACE FUNCTION public.set_tracking_id()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.tracking_id IS NULL THEN
    NEW.tracking_id := public.generate_tracking_id();
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS reports_set_tracking_id ON public.reports;
CREATE TRIGGER reports_set_tracking_id
  BEFORE INSERT ON public.reports
  FOR EACH ROW EXECUTE FUNCTION public.set_tracking_id();

-- Back-fill existing rows
UPDATE public.reports SET tracking_id = public.generate_tracking_id() WHERE tracking_id IS NULL;

-- ── 2. Expand issue_type constraint ────────────────────────────────────────

ALTER TABLE public.reports DROP CONSTRAINT IF EXISTS reports_issue_type_check;
ALTER TABLE public.reports ADD CONSTRAINT reports_issue_type_check CHECK (
  issue_type IN (
    'pothole','broken_streetlight','garbage','waterlogging',
    'damaged_road','damaged_footpath','open_manhole','damaged_public_property',
    'drainage','illegal_dumping','other'
  )
);

-- ── 3. Expand status constraint ────────────────────────────────────────────

ALTER TABLE public.reports DROP CONSTRAINT IF EXISTS reports_status_check;
ALTER TABLE public.reports ADD CONSTRAINT reports_status_check CHECK (
  status IN (
    'pending','approved','verified','rejected','duplicate',
    'in_progress','sent_to_amc','amc_acknowledged',
    'resolved_claimed','citizen_verified_resolved','reopened','resolved'
  )
);

-- ── 4. New report columns ──────────────────────────────────────────────────

ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS verification_level TEXT DEFAULT 'medium'
  CHECK (verification_level IN ('high','medium','low'));

ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS resolved_claimed_at  TIMESTAMPTZ;
ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS citizen_verified_at  TIMESTAMPTZ;
ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS reopened_at          TIMESTAMPTZ;
ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS sent_to_amc_at       TIMESTAMPTZ;
ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS vendor_phone         TEXT;
ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS vendor_whatsapp      TEXT;
ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS menu_text            TEXT;
ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS cuisine_tags         TEXT;
ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS price_range          TEXT;
ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS hours_text           TEXT;
ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS stall_photo_url      TEXT;
ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS stall_photo_path     TEXT;
CREATE INDEX IF NOT EXISTS reports_vendor_phone_idx ON public.reports(vendor_phone);

-- ── 5. report_events: add proof_image_url ─────────────────────────────────

ALTER TABLE public.report_events ADD COLUMN IF NOT EXISTS proof_image_url TEXT;

-- ── 6. AMC email batch tables ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.amc_email_batches (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  week_start   DATE NOT NULL,
  week_end     DATE NOT NULL,
  subject      TEXT,
  body         TEXT,
  report_count INTEGER DEFAULT 0,
  sent_to      TEXT,
  cc           TEXT,
  status       TEXT DEFAULT 'draft' CHECK (status IN ('draft','sent','failed')),
  sent_at      TIMESTAMPTZ,
  created_at   TIMESTAMPTZ DEFAULT timezone('utc', now())
);

CREATE TABLE IF NOT EXISTS public.amc_email_batch_reports (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id   UUID REFERENCES public.amc_email_batches(id) ON DELETE CASCADE,
  report_id  UUID REFERENCES public.reports(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT timezone('utc', now()),
  UNIQUE(batch_id, report_id)
);

CREATE INDEX IF NOT EXISTS amc_batches_status_idx        ON public.amc_email_batches(status);
CREATE INDEX IF NOT EXISTS amc_batch_reports_batch_idx   ON public.amc_email_batch_reports(batch_id);
CREATE INDEX IF NOT EXISTS amc_batch_reports_report_idx  ON public.amc_email_batch_reports(report_id);

ALTER TABLE public.amc_email_batches       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.amc_email_batch_reports ENABLE ROW LEVEL SECURITY;

-- ── 7. Update RLS policies ─────────────────────────────────────────────────

DROP POLICY IF EXISTS "Public can read verified reports" ON public.reports;
CREATE POLICY "Public can read verified reports"
ON public.reports FOR SELECT
USING (status IN (
  'approved','verified','in_progress','sent_to_amc','amc_acknowledged',
  'resolved_claimed','citizen_verified_resolved','reopened','resolved'
));

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

DROP POLICY IF EXISTS "Public can read sent amc batches" ON public.amc_email_batches;
CREATE POLICY "Public can read sent amc batches"
ON public.amc_email_batches FOR SELECT USING (status = 'sent');

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
