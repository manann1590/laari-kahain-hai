import Image from "next/image";
import {
  ArrowRight,
  Camera,
  CheckCircle2,
  Clock,
  Coffee,
  CupSoda,
  MapPin,
  MapPinned,
  MessageCircle,
  Navigation,
  Phone,
  Pizza,
  Sandwich,
  Search,
  ShieldCheck,
  Soup,
  Store,
  Utensils,
} from "lucide-react";
import type { FoodCategory } from "@/lib/supabase/types";
import { getMissingPublicConfig } from "@/lib/config";
import { getPublicDashboardStats } from "@/lib/data/reports";
import { getRequestLocale } from "@/lib/i18n-server";
import { categoryDescription, categoryLabel } from "@/lib/i18n";
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
  "late_night",
] as const;

const categoryIcons: Record<FoodCategory, typeof MapPin> = {
  chaat_snacks: Sandwich,
  tea_coffee: Coffee,
  meals_thali: Utensils,
  fast_food: Pizza,
  south_indian: Soup,
  desserts: CupSoda,
  juice_shakes: CupSoda,
  street_chinese: Soup,
  breakfast: Clock,
  late_night: MapPinned,
  other: Store,
};

const trustSignals = [
  ["Verified before publishing", "Admin review keeps duplicate, stale, and unsafe listings off the public map."],
  ["Call, WhatsApp, directions", "Customers can act from the listing without hunting across social apps."],
  ["Built for Ahmedabad lanes", "Search by craving, vendor name, area, or district as the food map grows."],
] as const;

const heroPins = [
  { label: "Chai", className: "left-[18%] top-[30%] bg-amber-100 text-amber-950 border-amber-200" },
  { label: "Dosa", className: "right-[18%] top-[22%] bg-blue-100 text-blue-950 border-blue-200" },
  { label: "Meals", className: "left-[42%] top-[52%] bg-green-100 text-green-950 border-green-200" },
  { label: "Late night", className: "right-[12%] bottom-[18%] bg-slate-100 text-slate-950 border-slate-200" },
] as const;

const actionPreviews = [
  { icon: Phone, label: "Call" },
  { icon: MessageCircle, label: "WhatsApp" },
  { icon: Navigation, label: "Directions" },
] as const;

async function loadStats() {
  try {
    return await getPublicDashboardStats();
  } catch {
    return null;
  }
}

function statValue(value?: number | null, empty = "Ready") {
  return value && value > 0 ? value : empty;
}

// TODO: Replace with live counts from database — hardcoded stats erode trust

export default async function HomePage() {
  const locale = await getRequestLocale();
  const stats = await loadStats();
  const missingConfig = getMissingPublicConfig();

  return (
    <main className="min-w-0">
      <section className="relative overflow-hidden border-b border-civic-line bg-white">
        <div className="absolute inset-0 civic-grid opacity-60" aria-hidden="true" />
        <div className="relative mx-auto grid max-w-7xl min-w-0 gap-8 px-4 py-10 sm:px-6 sm:py-14 lg:grid-cols-[1.02fr_0.98fr] lg:px-8">
          <div className="min-w-0">
            <p className="inline-flex max-w-full items-center gap-2 rounded-full border border-civic-orange/25 bg-civic-orange/10 px-3 py-1 text-xs font-bold text-civic-orange">
              <span className="h-2 w-2 rounded-full bg-civic-leaf" aria-hidden="true" />
              Ahmedabad street food, live
            </p>

            <div className="mt-5 max-w-sm sm:max-w-md">
              <Image
                src="/brand/foodradar-logo.png"
                alt="FoodRadar logo"
                width={900}
                height={238}
                priority
                className="h-auto w-full rounded-lg object-contain"
              />
            </div>

            <h1 className="mt-6 max-w-3xl text-4xl font-black leading-tight text-civic-text sm:text-5xl lg:text-6xl">
              Find Ahmedabad street food near you, live.
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-8 text-civic-muted sm:text-lg">
              Search verified food carts and stalls by craving, vendor, or area. See menus,
              phone and WhatsApp contact, photos, directions, and current location before you go.
            </p>

            <form action="/map" className="mt-6 rounded-lg border border-civic-line bg-white p-2 shadow-soft">
              <label className="sr-only" htmlFor="home-search">Search food, vendor, or area</label>
              <div className="flex min-w-0 flex-col gap-2 sm:flex-row">
                <div className="flex min-w-0 flex-1 items-center gap-2 rounded-md bg-civic-bg px-3">
                  <Search className="h-5 w-5 shrink-0 text-civic-muted" aria-hidden="true" />
                  <input
                    id="home-search"
                    name="search"
                    type="search"
                    placeholder="Search chai, dosa, vada pav, Satellite..."
                    className="h-12 min-w-0 flex-1 bg-transparent text-base text-civic-text outline-none placeholder:text-civic-muted"
                  />
                </div>
                <Button type="submit" size="lg" className="w-full sm:w-auto">
                  Explore food map
                </Button>
              </div>
            </form>

            <div className="mt-4 flex min-w-0 flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Button href="/map?near=me" size="lg" className="w-full sm:w-auto">
                <Navigation className="h-4 w-4" aria-hidden="true" />
                Find food near me
              </Button>
              <Button href="/reports/new" size="lg" variant="secondary" className="w-full sm:w-auto">
                <Camera className="h-4 w-4" aria-hidden="true" />
                List my food spot
              </Button>
            </div>

            <div className="mt-6 grid gap-3 text-sm sm:grid-cols-3">
              {trustSignals.map(([title, body]) => (
                <div key={title} className="rounded-lg border border-civic-line bg-white p-3 shadow-sm">
                  <p className="font-black text-civic-text">{title}</p>
                  <p className="mt-1 leading-5 text-civic-muted">{body}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="min-w-0 lg:pt-8">
            <div className="overflow-hidden rounded-lg border border-civic-line bg-white shadow-soft">
              <div className="flex items-center justify-between gap-3 border-b border-civic-line p-4">
                <div className="min-w-0">
                  <p className="text-sm font-black text-civic-text">FoodRadar live preview</p>
                  <p className="text-xs leading-5 text-civic-muted">Verified vendors around Ahmedabad</p>
                </div>
                <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-bold text-green-800">
                  Reviewed
                </span>
              </div>
              <div className="relative h-[330px] bg-civic-bg sm:h-[390px]">
                <div className="absolute inset-0 civic-grid opacity-80" aria-hidden="true" />
                <div className="absolute left-5 right-5 top-5 rounded-lg border border-civic-line bg-white/95 p-3 shadow-card">
                  <div className="flex items-center gap-2">
                    <Search className="h-4 w-4 shrink-0 text-civic-muted" aria-hidden="true" />
                    <p className="min-w-0 truncate text-sm font-semibold text-civic-text">
                      Search food, vendor, or area
                    </p>
                  </div>
                </div>
                {heroPins.map((pin) => (
                  <span
                    key={pin.label}
                    className={`absolute inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-black shadow-card ${pin.className}`}
                  >
                    <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
                    {pin.label}
                  </span>
                ))}
                <div className="absolute bottom-5 left-5 right-5 rounded-lg border border-civic-line bg-white p-4 shadow-card">
                  <div className="grid gap-3 sm:grid-cols-3">
                    {actionPreviews.map(({ icon: Icon, label }) => (
                      <div key={label} className="flex items-center gap-2 rounded-md bg-civic-bg px-3 py-2">
                        <Icon className="h-4 w-4 text-civic-orange" aria-hidden="true" />
                        <span className="text-sm font-bold text-civic-text">{label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {missingConfig.length > 0 ? (
              <p className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-2.5 text-xs text-amber-950">
                Add {missingConfig.join(", ")} to enable live Supabase data.
              </p>
            ) : null}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-3 px-4 py-8 sm:px-6 md:grid-cols-2 lg:grid-cols-4 lg:px-8">
        <StatCard
          icon={CheckCircle2}
          value={statValue(stats?.totalApproved)}
          label="Verified vendors"
          helperText="Only approved listings reach customers."
          tone="green"
        />
        <StatCard
          icon={Camera}
          value={statValue(stats?.reportsThisWeek, "Fresh")}
          label="New this week"
          helperText="Fresh submissions keep the food map current."
          tone="orange"
        />
        <StatCard
          icon={MapPinned}
          value={stats?.topDistrictArea || "Ahmedabad"}
          label="Active area"
          helperText="Browse by neighborhood as supply grows."
          tone="blue"
        />
        <StatCard
          icon={ShieldCheck}
          value="Reviewed"
          label="Trust layer"
          helperText="Listings are checked before publishing."
          tone="amber"
        />
      </section>

      <section className="border-y border-civic-line bg-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="flex min-w-0 flex-col justify-between gap-5 md:flex-row md:items-end">
            <div className="min-w-0">
              <p className="text-sm font-black text-civic-orange">Popular searches</p>
              <h2 className="mt-2 text-3xl font-black leading-tight text-civic-text">
                Start with what you feel like eating.
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-7 text-civic-muted">
                FoodRadar is built for real street-food decisions: menu, photo, phone, WhatsApp,
                and directions in one verified listing.
              </p>
            </div>
            <Button href="/map" variant="outline" className="w-full sm:w-auto">
              View all categories
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Button>
          </div>

          <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {categoryOrder.map((category) => {
              const Icon = categoryIcons[category];
              return (
                <a
                  key={category}
                  href={`/map?category=${category}`}
                  className="group flex min-h-36 min-w-0 flex-col justify-between rounded-lg border border-civic-line bg-civic-bg p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-civic-orange/50 hover:bg-white hover:shadow-card"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-civic-orange/10 text-civic-orange transition-colors group-hover:bg-civic-orange group-hover:text-white">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <div className="mt-5 min-w-0">
                    <h3 className="font-black text-civic-text">{categoryLabel(locale, category)}</h3>
                    <p className="mt-1 text-xs leading-5 text-civic-muted">
                      {categoryDescription(locale, category)}
                    </p>
                  </div>
                </a>
              );
            })}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-4 py-12 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
        <div className="rounded-lg border border-civic-line bg-white p-6 shadow-card">
          <Store className="h-8 w-8 text-civic-orange" aria-hidden="true" />
          <h2 className="mt-4 text-2xl font-black leading-tight text-civic-text">
            Own a cart, stall, or small food spot?
          </h2>
          <p className="mt-3 text-sm leading-7 text-civic-muted">
            List your food spot with a fresh photo, menu, public phone, WhatsApp, hours,
            and current location. After review, nearby customers can discover you on FoodRadar.
          </p>
          <Button href="/reports/new" className="mt-5 w-full sm:w-auto">
            List my food spot
          </Button>
        </div>

        <div className="rounded-lg border border-civic-line bg-civic-ink p-6 text-white shadow-soft">
          <ShieldCheck className="h-8 w-8 text-amber-300" aria-hidden="true" />
          <h2 className="mt-4 text-2xl font-black leading-tight">
            For city teams and local-commerce partners
          </h2>
          <p className="mt-3 text-sm leading-7 text-white/75">
            FoodRadar can become a verified supply layer for outreach, local campaigns,
            neighborhood food zones, and operational visibility.
          </p>
          <Button href="/admin" variant="secondary" className="mt-5 w-full sm:w-auto">
            View partner dashboard
          </Button>
        </div>
      </section>
    </main>
  );
}
