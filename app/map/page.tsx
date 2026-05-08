import type { Metadata } from "next";
import {
  Coffee,
  Filter,
  Info,
  ListFilter,
  MapPinned,
  Moon,
  Pizza,
  Sandwich,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Soup,
  Store,
  Utensils,
} from "lucide-react";
import { FOOD_CATEGORIES } from "@/lib/constants";
import { getRequestLocale } from "@/lib/i18n-server";
import { categoryLabel, getCopy, type Locale } from "@/lib/i18n";
import type { FoodCategory } from "@/lib/supabase/types";
import { getPublicReports } from "@/lib/data/reports";
import { normalizeFoodCategory } from "@/lib/validators/report";
import { cn } from "@/lib/utils";
import { Select } from "@/components/ui/Select";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { PublicMapLoader } from "@/components/map/PublicMapLoader";
import { Card } from "@/components/ui/Card";
import { VendorListView } from "@/components/map/VendorListView";

export const metadata: Metadata = {
  title: "Food Map",
};

export const revalidate = 60;

const quickFilters: Array<{
  label: string;
  href: string;
  icon: typeof MapPinned;
  active: (category?: FoodCategory | null) => boolean;
}> = [
  { label: "All", href: "/map", icon: MapPinned, active: (category) => !category },
  { label: "Chaat", href: "/map?category=chaat_snacks", icon: Sandwich, active: (category) => category === "chaat_snacks" },
  { label: "Tea/Coffee", href: "/map?category=tea_coffee", icon: Coffee, active: (category) => category === "tea_coffee" },
  { label: "Meals", href: "/map?category=meals_thali", icon: Utensils, active: (category) => category === "meals_thali" },
  { label: "Fast food", href: "/map?category=fast_food", icon: Pizza, active: (category) => category === "fast_food" },
  { label: "South Indian", href: "/map?category=south_indian", icon: Soup, active: (category) => category === "south_indian" },
  { label: "Late night", href: "/map?category=late_night", icon: Moon, active: (category) => category === "late_night" },
] as const;

function FilterForm({
  category,
  area,
  district,
  search,
  locale,
}: {
  category?: FoodCategory | null;
  area?: string;
  district?: string;
  search?: string;
  locale: Locale;
}) {
  const t = getCopy(locale);

  return (
    <form className="grid gap-3">
      <Input
        label="Search"
        name="search"
        defaultValue={search}
        placeholder="Food, vendor, area"
      />
      <Select
        label="Cuisine"
        name="category"
        defaultValue={category || "all"}
        options={[
          { value: "all", label: t.map.allIssues },
          ...Object.keys(FOOD_CATEGORIES).map((value) => ({
            value,
            label: categoryLabel(locale, value as FoodCategory),
          })),
        ]}
      />
      <Input label={t.common.area} name="area" defaultValue={area} placeholder="Satellite" />
      <Input label={t.common.district} name="district" defaultValue={district} placeholder="Ahmedabad" />
      <div className="flex flex-col gap-2 sm:flex-row xl:flex-col">
        <Button type="submit" className="w-full">
          <Filter className="h-4 w-4" aria-hidden="true" />
          {t.common.applyFilters}
        </Button>
        <Button href="/map" variant="secondary" className="w-full">
          {t.common.clearFilters}
        </Button>
      </div>
    </form>
  );
}

function VendorCta() {
  return (
    <Card variant="elevated" className="border-civic-orange/30 bg-white">
      <div className="flex gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-civic-orange/10 text-civic-orange">
          <Store className="h-5 w-5" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <h2 className="font-black text-civic-text">Are you a vendor?</h2>
          <p className="mt-1 text-sm leading-6 text-civic-muted">
            List your spot after admin approval. Login or request access with your mobile number and password.
          </p>
        </div>
      </div>
      <Button href="/partner/login" className="mt-4 w-full">
        List your spot
      </Button>
    </Card>
  );
}

export default async function MapPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;
  const locale = await getRequestLocale();
  const t = getCopy(locale);
  const category = normalizeFoodCategory(params.category);
  const district = params.district?.trim();
  const area = params.area?.trim();
  const search = (params.search || params.q || "").trim();
  let reports: Awaited<ReturnType<typeof getPublicReports>> = [];
  let errorMessage = "";

  try {
    reports = await getPublicReports({
      category: category || "all",
      district,
      area,
      search,
    });
  } catch (error) {
    errorMessage = error instanceof Error ? error.message : "Could not load vendor listings.";
  }

  if (errorMessage) {
    return (
      <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <EmptyState title={t.map.unavailable} description={errorMessage} />
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-7xl min-w-0 px-4 py-4 sm:px-6 lg:px-8">
      <section className="mb-4 overflow-hidden rounded-lg border border-civic-line bg-white shadow-card">
        <div className="h-1 ticket-edge" aria-hidden="true" />
        <div className="grid gap-4 p-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
          <div className="min-w-0">
            <p className="inline-flex max-w-full items-center gap-2 rounded-full border border-civic-orange/25 bg-civic-orange/10 px-3 py-1 text-xs font-black text-civic-orange">
              <span className="h-2 w-2 rounded-full bg-civic-leaf" aria-hidden="true" />
              Ahmedabad street food, live
            </p>
            <h1 className="mt-3 text-2xl font-black leading-tight text-civic-text sm:text-4xl">
              Search food spots, then go.
            </h1>
            <p className="mt-2 max-w-3xl text-sm leading-7 text-civic-muted">
              Find verified carts and stalls by craving, vendor name, area, or district. Menus, calls,
              WhatsApp, photos, and directions stay close to the map.
            </p>
          </div>

          <div className="grid min-w-0 grid-cols-[92px_minmax(0,1fr)] items-center gap-3 rounded-lg border border-civic-line bg-civic-ink p-3 text-white shadow-card sm:min-w-72">
            <div className="radar-screen" aria-hidden="true">
              <span className="radar-blip left-[26%] top-[30%]" />
              <span className="radar-blip left-[62%] top-[38%]" />
              <span className="radar-blip left-[44%] top-[68%]" />
            </div>
            <div className="min-w-0 text-sm">
              <p className="text-3xl font-black leading-none">{reports.length}</p>
              <p className="mt-1 font-black">vendors shown</p>
              <p className="mt-1 truncate text-xs text-white/65">
                {category ? categoryLabel(locale, category) : search ? `Search: ${search}` : "All verified spots"}
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-civic-line p-3 sm:p-4">
          <form action="/map" className="grid min-w-0 gap-2 lg:grid-cols-[minmax(0,1fr)_auto]">
            <label className="sr-only" htmlFor="map-search">Search food, vendor, or area</label>
            <div className="flex min-w-0 items-center gap-2 rounded-lg border border-civic-line bg-civic-bg px-3">
              <Search className="h-5 w-5 shrink-0 text-civic-muted" aria-hidden="true" />
              <input
                id="map-search"
                name="search"
                type="search"
                defaultValue={search}
                placeholder="Search chai, dosa, vada pav, Satellite..."
                className="h-12 min-w-0 flex-1 bg-transparent text-base text-civic-text outline-none placeholder:text-civic-muted"
              />
            </div>
            <Button type="submit" size="lg" className="w-full lg:w-auto">
              Search
            </Button>
          </form>

          <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
            {quickFilters.map((item) => {
              const Icon = item.icon;
              const isActive = item.active(category);
              return (
                <a
                  key={item.label}
                  href={item.href}
                  className={cn(
                    "inline-flex min-h-10 shrink-0 items-center gap-1.5 rounded-full border px-3 text-xs font-bold transition",
                    isActive
                      ? "border-civic-orange bg-civic-orange text-white"
                      : "border-civic-line bg-white text-civic-text hover:border-civic-orange/50 hover:bg-civic-orange/10",
                  )}
                >
                  <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                  {item.label}
                </a>
              );
            })}
          </div>
        </div>
      </section>

      <div className="grid min-w-0 gap-5 xl:grid-cols-[330px_minmax(0,1fr)]">
        <aside className="order-2 space-y-4 xl:order-1 xl:sticky xl:top-24 xl:self-start">
          <details className="rounded-lg border border-civic-line bg-white shadow-card xl:hidden">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-4 text-sm font-black text-civic-text">
              <span className="flex items-center gap-2">
                <SlidersHorizontal className="h-4 w-4 text-civic-orange" aria-hidden="true" />
                More filters
              </span>
              <span className="text-xs font-semibold text-civic-muted">{reports.length} shown</span>
            </summary>
            <div className="border-t border-civic-line p-4">
              <FilterForm
                category={category}
                area={area}
                district={district}
                search={search}
                locale={locale}
              />
            </div>
          </details>

          <Card
            variant="mapOverlay"
            title={t.map.filters}
            description={`${reports.length} ${t.map.shown}`}
            className="hidden xl:block"
          >
            <FilterForm
              category={category}
              area={area}
              district={district}
              search={search}
              locale={locale}
            />
          </Card>

          <VendorCta />

          <Card variant="default">
            <div className="flex gap-3 text-sm leading-6 text-civic-muted">
              <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-civic-leaf" aria-hidden="true" />
              <p>{t.map.onlyVisible}</p>
            </div>
          </Card>
        </aside>

        <div className="order-1 min-w-0 space-y-5 xl:order-2">
          <Card variant="elevated" className="p-3">
            <PublicMapLoader reports={reports} locale={locale} />
          </Card>

          {reports.length === 0 ? (
            <EmptyState
              icon={MapPinned}
              title="Ahmedabad's live food map is ready"
              description="No verified spots match this search yet. Vendors can request access, and admin-approved listings will appear here."
              action={<Button href="/partner/login">List your spot</Button>}
              secondaryAction={<Button href="/map" variant="secondary">Clear search</Button>}
            />
          ) : (
            <VendorListView reports={reports} locale={locale} />
          )}

          {reports.length === 0 ? (
            <div className="grid gap-4 md:grid-cols-3">
              {[
                { icon: Info, title: t.map.cards[0][0], copy: t.map.cards[0][1] },
                { icon: ShieldCheck, title: t.map.cards[1][0], copy: t.map.cards[1][1] },
                { icon: ListFilter, title: t.map.cards[2][0], copy: t.map.cards[2][1] },
              ].map((item) => (
                <Card key={item.title} variant="interactive">
                  <item.icon className="h-6 w-6 text-civic-orange" aria-hidden="true" />
                  <h2 className="mt-4 font-black text-civic-text">{item.title}</h2>
                  <p className="mt-2 text-sm leading-6 text-civic-muted">{item.copy}</p>
                </Card>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </main>
  );
}
