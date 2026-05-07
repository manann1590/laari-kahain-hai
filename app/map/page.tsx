import type { Metadata } from "next";
import {
  Clock3,
  Coffee,
  Filter,
  Info,
  ListFilter,
  MapPinned,
  Moon,
  Navigation,
  Sandwich,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Utensils,
} from "lucide-react";
import { FOOD_CATEGORIES } from "@/lib/constants";
import { getRequestLocale } from "@/lib/i18n-server";
import { categoryLabel, getCopy, type Locale } from "@/lib/i18n";
import type { FoodCategory } from "@/lib/supabase/types";
import { getPublicReports } from "@/lib/data/reports";
import { normalizeFoodCategory } from "@/lib/validators/report";
import { cn } from "@/lib/utils";
import { PageShell } from "@/components/layout/PageShell";
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
  active: (category?: FoodCategory | null, near?: string, open?: string) => boolean;
}> = [
  { label: "All", href: "/map", icon: MapPinned, active: (category?: FoodCategory | null, near?: string) => !category && !near },
  { label: "Open now", href: "/map?open=now", icon: Clock3, active: (_category?: FoodCategory | null, _near?: string, open?: string) => open === "now" },
  { label: "Near me", href: "/map?near=me", icon: Navigation, active: (_category?: FoodCategory | null, near?: string) => near === "me" },
  { label: "Chaat", href: "/map?category=chaat_snacks", icon: Sandwich, active: (category?: FoodCategory | null) => category === "chaat_snacks" },
  { label: "Tea/Coffee", href: "/map?category=tea_coffee", icon: Coffee, active: (category?: FoodCategory | null) => category === "tea_coffee" },
  { label: "Meals", href: "/map?category=meals_thali", icon: Utensils, active: (category?: FoodCategory | null) => category === "meals_thali" },
  { label: "Late night", href: "/map?category=late_night", icon: Moon, active: (category?: FoodCategory | null) => category === "late_night" },
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
        label={t.map.issueType}
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
  const near = params.near?.trim();
  const open = params.open?.trim();
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

  return (
    <PageShell
      eyebrow={t.common.publicMap}
      title={t.map.title}
      description={t.map.description}
      actions={
        <Button href="/reports/new" className="w-full sm:w-auto">
          {t.common.submitAnIssue}
        </Button>
      }
    >
      {errorMessage ? (
        <EmptyState title={t.map.unavailable} description={errorMessage} />
      ) : (
        <div className="grid min-w-0 gap-5 xl:grid-cols-[340px_1fr]">
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

            <Card variant="default">
              <div className="flex gap-3 text-sm leading-6 text-civic-muted">
                <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-civic-leaf" aria-hidden="true" />
                <p>{t.map.onlyVisible}</p>
              </div>
            </Card>
          </aside>

          <div className="order-1 min-w-0 space-y-5 xl:order-2">
            <Card className="p-3">
              <form action="/map" className="flex min-w-0 flex-col gap-2 sm:flex-row">
                <label className="sr-only" htmlFor="map-search">Search food, vendor, or area</label>
                <div className="flex min-w-0 flex-1 items-center gap-2 rounded-lg border border-civic-line bg-white px-3">
                  <Search className="h-5 w-5 shrink-0 text-civic-muted" aria-hidden="true" />
                  <input
                    id="map-search"
                    name="search"
                    type="search"
                    defaultValue={search}
                    placeholder="Search food, vendor, or area"
                    className="h-11 min-w-0 flex-1 text-base text-civic-text outline-none placeholder:text-civic-muted sm:text-sm"
                  />
                </div>
                <Button type="submit" variant="secondary" className="w-full sm:w-auto">
                  Search
                </Button>
              </form>

              {/* Category chips — hidden on xl where the sidebar select handles category filtering */}
              <div className="mt-3 flex flex-wrap gap-2 xl:hidden">
                {quickFilters.map((item) => {
                  const Icon = item.icon;
                  const isActive = item.active(category, near, open);
                  return (
                    <a
                      key={item.label}
                      href={item.href}
                      className={cn(
                        "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-2 text-xs font-bold transition",
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
            </Card>

            <Card variant="elevated" className="p-3">
              <PublicMapLoader reports={reports} locale={locale} />
            </Card>

            {reports.length === 0 ? (
              <EmptyState
                icon={MapPinned}
                title="Ahmedabad's live food map is ready"
                description="List the first verified spot, or use the search and category chips to explore how FoodRadar will work as supply grows."
                action={<Button href="/reports/new">{t.map.submitFirst}</Button>}
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
      )}
    </PageShell>
  );
}
