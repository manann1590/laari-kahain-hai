import { Radar } from "lucide-react";
import {
  ArrowRight,
  Camera,
  CheckCircle2,
  Clock,
  Coffee,
  CupSoda,
  MapPin,
  MapPinned,
  Phone,
  Pizza,
  Sandwich,
  ShieldCheck,
  Soup,
  Star,
  Utensils,
  Zap,
} from "lucide-react";
import type { FoodCategory } from "@/lib/supabase/types";
import { getMissingPublicConfig } from "@/lib/config";
import { getPublicDashboardStats } from "@/lib/data/reports";
import { getRequestLocale } from "@/lib/i18n-server";
import { getCopy, categoryDescription, categoryLabel } from "@/lib/i18n";
import { Button } from "@/components/ui/Button";
import { StatCard } from "@/components/ui/StatCard";

export const revalidate = 300;

const categoryOrder = [
  "chaat_snacks",
  "tea_coffee",
  "meals_thali",
  "fast_food",
  "south_indian",
  "desserts",
  "juice_shakes",
  "street_chinese",
] as const;

const issueIcons: Record<FoodCategory, typeof MapPin> = {
  chaat_snacks: Sandwich,
  tea_coffee: Coffee,
  meals_thali: Utensils,
  fast_food: Pizza,
  south_indian: Soup,
  desserts: CupSoda,
  juice_shakes: Zap,
  street_chinese: Star,
  breakfast: Clock,
  late_night: MapPin,
  other: MapPinned,
};

async function loadStats() {
  try {
    return await getPublicDashboardStats();
  } catch {
    return null;
  }
}

function statValue(value?: number | null, empty = "—") {
  return value && value > 0 ? value : empty;
}

const liveRows = [
  ["Satellite", "Cheese vada pav", "5 min"],
  ["Vastrapur", "Mini thali", "12 min"],
  ["Prahladnagar", "Cutting chai", "Live"],
];

const steps = [
  {
    num: "01",
    icon: Camera,
    title: "Shoot",
    body: "Camera photo of the stall, counter, or menu board. Keeps listings fresh and recognisable.",
  },
  {
    num: "02",
    icon: MapPin,
    title: "Pin",
    body: "Capture GPS while standing at your spot, or paste a Google Maps link.",
  },
  {
    num: "03",
    icon: ShieldCheck,
    title: "Review",
    body: "Admin checks the listing before it goes public. No fake or stale entries.",
  },
  {
    num: "04",
    icon: Zap,
    title: "Discover",
    body: "Customers find you on the live map, check the menu, call, and come eat.",
  },
];

export default async function HomePage() {
  const locale = await getRequestLocale();
  const t = getCopy(locale);
  const stats = await loadStats();
  const missingConfig = getMissingPublicConfig();

  return (
    <main>
      {/* ── HERO ───────────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        {/* Dot grid overlay */}
        <div className="absolute inset-0 civic-grid opacity-30 pointer-events-none" aria-hidden="true" />

        {/* Hero gradient background */}
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(135deg, #FF4500 0%, #FF5722 45%, #FF8C00 100%)" }}
          aria-hidden="true"
        />

        <div className="relative mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-22">
          <div className="grid items-center gap-10 lg:grid-cols-[1fr_380px] xl:grid-cols-[1fr_420px]">

            {/* Left — headline + CTAs */}
            <div>
              {/* Logo + brand name */}
              <div className="flex items-center gap-3">
                <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm border border-white/30 shadow-soft">
                  <Radar className="h-8 w-8 text-white" aria-hidden="true" />
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-white/40 bg-white/20 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-white backdrop-blur-sm">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
                  {t.home.eyebrow}
                </span>
              </div>

              <h1 className="mt-5 text-7xl font-black leading-[0.88] tracking-tight text-white drop-shadow-sm sm:text-8xl lg:text-9xl">
                Food<span className="text-white/30">Radar</span>
              </h1>

              <p className="mt-5 max-w-lg text-base leading-7 text-white/85 sm:text-lg">
                Find Ahmedabad&apos;s street food vendors before they move&nbsp;— menu, photo,
                phone, and live location in one tap.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Button href="/map" size="lg" className="bg-white text-civic-orange font-black shadow-soft hover:bg-white/90 border-transparent focus:ring-white">
                  <MapPinned className="h-4 w-4" aria-hidden="true" />
                  Open Food Map
                </Button>
                <Button href="/reports/new" variant="ghost" size="lg" className="border border-white/40 bg-white/20 text-white backdrop-blur-sm hover:bg-white/30">
                  <Camera className="h-4 w-4" aria-hidden="true" />
                  List Your Spot
                </Button>
              </div>

              {/* Trust signals */}
              <div className="mt-8 flex flex-wrap gap-5">
                {[
                  { icon: CheckCircle2, label: "Admin-verified listings" },
                  { icon: ShieldCheck,  label: "No signup required" },
                  { icon: Phone,        label: "Direct vendor contact" },
                ].map(({ icon: Icon, label }) => (
                  <div key={label} className="flex items-center gap-1.5 text-sm text-white/80">
                    <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                    {label}
                  </div>
                ))}
              </div>
            </div>

            {/* Right — live preview card */}
            <div className="flex flex-col gap-3">
              <div className="overflow-hidden rounded-2xl bg-white shadow-soft">
                {/* Stat pills */}
                <div className="grid grid-cols-3 divide-x divide-civic-line border-b border-civic-line">
                  {[
                    { value: stats?.totalApproved ?? 0,         label: "verified",  color: "text-civic-leaf" },
                    { value: stats?.reportsThisWeek ?? 0,       label: "this week", color: "text-civic-orange" },
                    { value: stats?.topDistrictArea || "Live",  label: "hotspot",   color: "text-civic-yellow" },
                  ].map(({ value, label, color }) => (
                    <div key={label} className="flex flex-col items-center py-4">
                      <span className={`text-2xl font-black leading-none ${color}`}>{value}</span>
                      <span className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-civic-muted">
                        {label}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Map mock */}
                <div
                  className="relative h-36 overflow-hidden"
                  style={{ background: "linear-gradient(135deg,#FFF4E0 0%,#FDE8C8 100%)" }}
                >
                  <div className="absolute inset-0 civic-grid opacity-40" />
                  {[
                    { pos: "left-[14%] top-[20%]", color: "bg-civic-leaf",   label: "CHAAT" },
                    { pos: "left-[52%] top-[15%]", color: "bg-civic-orange", label: "CHAI" },
                    { pos: "left-[68%] top-[55%]", color: "bg-civic-yellow", label: "MEAL" },
                    { pos: "left-[30%] top-[60%]", color: "bg-civic-red",    label: "FAST" },
                  ].map(({ pos, color, label }) => (
                    <span
                      key={label}
                      className={`absolute ${pos} inline-flex items-center gap-1 rounded-lg border border-white/60 ${color} px-2 py-1 text-[10px] font-black text-white shadow-card`}
                    >
                      <MapPin className="h-3 w-3" aria-hidden="true" />
                      {label}
                    </span>
                  ))}
                  <span className="absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-civic-leaf px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-white">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
                    verified only
                  </span>
                </div>

                {/* Tonight's shortlist */}
                <div className="p-4">
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-civic-orange/10 text-civic-orange">
                      <Zap className="h-4 w-4" aria-hidden="true" />
                    </span>
                    <div>
                      <p className="text-sm font-black text-civic-text">Tonight&apos;s shortlist</p>
                      <p className="text-xs text-civic-muted">Map · table · call · go</p>
                    </div>
                  </div>

                  <div className="mt-3 divide-y divide-civic-line overflow-hidden rounded-xl border border-civic-line">
                    {liveRows.map(([area, menu, eta]) => (
                      <div key={area} className="grid grid-cols-[1fr_auto] items-center gap-3 px-3 py-2.5">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-black text-civic-text">{area}</p>
                          <p className="truncate text-xs text-civic-muted">{menu}</p>
                        </div>
                        <span className="shrink-0 rounded-full bg-civic-orange/10 px-2 py-0.5 text-[11px] font-bold text-civic-orange">
                          {eta}
                        </span>
                      </div>
                    ))}
                  </div>

                  <Button href="/map" variant="outline" className="mt-3 w-full">
                    Browse all vendors
                    <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </Button>
                </div>
              </div>

              {missingConfig.length > 0 ? (
                <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-xs text-amber-700">
                  Add {missingConfig.join(", ")} to enable live Supabase data.
                </p>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS ROW ──────────────────────────────────────────── */}
      <section className="mx-auto grid max-w-7xl gap-3 px-4 py-8 sm:px-6 md:grid-cols-2 lg:grid-cols-4 lg:px-8">
        <StatCard
          icon={CheckCircle2}
          value={statValue(stats?.totalApproved, t.home.awaitingFirst)}
          label={t.home.verifiedReports}
          helperText={t.home.publicOnlyVerified}
          tone="green"
        />
        <StatCard
          icon={Camera}
          value={statValue(stats?.reportsThisWeek, t.home.beFirst)}
          label={t.home.reportsThisWeek}
          helperText="Camera-first listings keep the board fresh."
          tone="orange"
        />
        <StatCard
          icon={Phone}
          value="Call"
          label="Direct contact"
          helperText="Public profiles show phone and WhatsApp actions."
          tone="blue"
        />
        <StatCard
          icon={Star}
          value={stats?.topDistrictArea || "Open"}
          label={t.home.topIssue}
          helperText={stats?.topDistrictArea || "Food board begins after verified listings."}
          tone="amber"
        />
      </section>

      {/* ── CATEGORIES ─────────────────────────────────────────── */}
      <section className="border-y border-civic-line bg-white">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div>
              <p className="inline-flex items-center rounded-full border border-civic-orange/30 bg-civic-orange/8 px-3 py-0.5 text-[11px] font-bold uppercase tracking-widest text-civic-orange">
                Food Lanes
              </p>
              <h2 className="mt-3 text-3xl font-black text-civic-text">
                Scan by craving, not by scrolling.
              </h2>
              <p className="mt-2 max-w-lg text-sm leading-6 text-civic-muted">
                Filter by cuisine, neighbourhood, hours, and price to find the right spot fast.
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {categoryOrder.map((issueType) => {
              const Icon = issueIcons[issueType];
              return (
                <a
                  key={issueType}
                  href={`/map?category=${issueType}`}
                  className="group flex min-h-40 flex-col justify-between rounded-2xl border border-civic-line bg-civic-bg p-5 shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:border-civic-orange/50 hover:bg-white hover:shadow-glow"
                >
                  <div className="flex items-start justify-between gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-civic-orange/10 text-civic-orange transition-colors group-hover:bg-civic-orange group-hover:text-white">
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <ArrowRight className="h-4 w-4 text-civic-muted/40 transition-all group-hover:translate-x-0.5 group-hover:text-civic-orange/70" aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className="font-black text-civic-text">{categoryLabel(locale, issueType)}</h3>
                    <p className="mt-1 text-xs leading-5 text-civic-muted">
                      {categoryDescription(locale, issueType)}
                    </p>
                  </div>
                </a>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ───────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="text-center">
          <p className="inline-flex items-center rounded-full border border-civic-leaf/30 bg-civic-leaf/8 px-3 py-0.5 text-[11px] font-bold uppercase tracking-widest text-civic-leaf">
            How it works
          </p>
          <h2 className="mt-3 text-3xl font-black text-civic-text sm:text-4xl">
            Park. Snap. Serve. Get discovered.
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-sm leading-7 text-civic-muted">
            Vendors add stall details from the street. Customers browse the live map, check the
            menu, call, and go eat.
          </p>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map(({ num, icon: Icon, title, body }) => (
            <div
              key={num}
              className="relative overflow-hidden rounded-2xl border border-civic-line bg-white p-6 shadow-card"
            >
              <span className="absolute right-4 top-3 font-mono text-5xl font-black text-civic-orange/8 select-none">
                {num}
              </span>
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-civic-orange/10 text-civic-orange">
                <Icon className="h-5 w-5" aria-hidden="true" />
              </span>
              <h3 className="mt-4 text-lg font-black text-civic-text">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-civic-muted">{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA SPLIT ──────────────────────────────────────────── */}
      <section className="border-t border-civic-line bg-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid gap-5 lg:grid-cols-2">

            {/* Vendor CTA — warm gradient */}
            <div
              className="overflow-hidden rounded-2xl p-7 text-white shadow-soft"
              style={{ background: "linear-gradient(135deg, #FF4500 0%, #FF8C00 100%)" }}
            >
              <p className="inline-flex items-center rounded-full border border-white/30 bg-white/20 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-widest text-white">
                For Vendors
              </p>
              <h2 className="mt-4 text-2xl font-black leading-tight text-white sm:text-3xl">
                A listing that works like a tiny storefront.
              </h2>
              <p className="mt-3 text-sm leading-7 text-white/80">
                Name, photo, menu, hours, price, contact, and your exact standing location — all in
                one review queue. Go public in under a day.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Button
                  href="/reports/new"
                  className="bg-civic-brown text-white border-transparent hover:bg-[#3d2920] focus:ring-civic-brown"
                >
                  Start listing
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                </Button>
                <Button
                  href="/admin"
                  className="border border-white/40 bg-white/20 text-white backdrop-blur-sm hover:bg-white/30 focus:ring-white"
                  variant="ghost"
                >
                  Admin review
                  <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
                </Button>
              </div>
            </div>

            {/* Customer CTA — clean white */}
            <div className="overflow-hidden rounded-2xl border border-civic-line bg-civic-bg p-7 shadow-card">
              <p className="inline-flex items-center rounded-full border border-civic-leaf/30 bg-civic-leaf/10 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-widest text-civic-leaf">
                For Hungry People
              </p>
              <h2 className="mt-4 text-2xl font-black leading-tight text-civic-text sm:text-3xl">
                The city already has amazing food. It just needs a live map.
              </h2>
              <p className="mt-3 text-sm leading-7 text-civic-muted">
                Street food moves by time, day, weather, and crowd. Open the map, scan the table,
                check the menu, call before you go.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Button href="/map">
                  Open food map
                  <MapPinned className="h-3.5 w-3.5" aria-hidden="true" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
