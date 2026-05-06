create extension if not exists "pgcrypto";

create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  issue_type text not null check (
    issue_type in (
      'pothole',
      'broken_streetlight',
      'garbage',
      'waterlogging',
      'damaged_road',
      'damaged_footpath',
      'open_manhole',
      'damaged_public_property',
      'drainage',
      'illegal_dumping',
      'other'
    )
  ),
  title text,
  description text,
  latitude double precision not null,
  longitude double precision not null,
  address_text text,
  area text,
  district text,
  city text default 'Ahmedabad',
  state text default 'Gujarat',
  country text default 'India',
  image_url text,
  image_path text,
  vendor_phone text,
  vendor_whatsapp text,
  menu_text text,
  cuisine_tags text,
  price_range text,
  hours_text text,
  stall_photo_url text,
  stall_photo_path text,
  status text not null default 'pending' check (
    status in ('pending', 'approved', 'rejected', 'resolved', 'duplicate')
  ),
  severity text default 'medium' check (
    severity in ('low', 'medium', 'high', 'critical')
  ),
  source text default 'manual_admin',
  reporter_phone_hash text,
  admin_notes text,
  duplicate_of uuid references public.reports(id),
  confirmation_count integer default 1,
  created_at timestamp with time zone default timezone('utc', now()),
  updated_at timestamp with time zone default timezone('utc', now()),
  approved_at timestamp with time zone,
  resolved_at timestamp with time zone,
  rejected_at timestamp with time zone
);

create table if not exists public.report_events (
  id uuid primary key default gen_random_uuid(),
  report_id uuid references public.reports(id) on delete cascade,
  event_type text not null,
  old_status text,
  new_status text,
  note text,
  actor text default 'admin',
  created_at timestamp with time zone default timezone('utc', now())
);

create table if not exists public.issue_confirmations (
  id uuid primary key default gen_random_uuid(),
  report_id uuid references public.reports(id) on delete cascade,
  confirmation_hash text,
  created_at timestamp with time zone default timezone('utc', now())
);

create index if not exists reports_status_idx on public.reports(status);
create index if not exists reports_issue_type_idx on public.reports(issue_type);
create index if not exists reports_district_idx on public.reports(district);
create index if not exists reports_area_idx on public.reports(area);
create index if not exists reports_vendor_phone_idx on public.reports(vendor_phone);
create index if not exists reports_created_at_idx on public.reports(created_at desc);
create index if not exists reports_latitude_longitude_idx on public.reports(latitude, longitude);
create index if not exists reports_duplicate_of_idx on public.reports(duplicate_of);
create index if not exists report_events_report_id_idx on public.report_events(report_id);

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$ language plpgsql;

drop trigger if exists reports_set_updated_at on public.reports;
create trigger reports_set_updated_at
before update on public.reports
for each row
execute function public.set_updated_at();

alter table public.reports enable row level security;
alter table public.report_events enable row level security;
alter table public.issue_confirmations enable row level security;

drop policy if exists "Public can read verified reports" on public.reports;
create policy "Public can read verified reports"
on public.reports
for select
using (status in ('approved', 'resolved'));

drop policy if exists "Public can read events for verified reports" on public.report_events;
create policy "Public can read events for verified reports"
on public.report_events
for select
using (
  exists (
    select 1
    from public.reports
    where reports.id = report_events.report_id
      and reports.status in ('approved', 'resolved')
  )
);

drop policy if exists "Public can add future confirmations" on public.issue_confirmations;
create policy "Public can add future confirmations"
on public.issue_confirmations
for insert
with check (
  exists (
    select 1
    from public.reports
    where reports.id = issue_confirmations.report_id
      and reports.status = 'approved'
  )
);
