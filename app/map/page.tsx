import type { Metadata } from "next";
import { Filter, Info, ListFilter, MapPinned, ShieldCheck } from "lucide-react";
import { FOOD_CATEGORIES, FOOD_CATEGORY_VALUES } from "@/lib/constants";
import { getRequestLocale } from "@/lib/i18n-server";
import { getCopy, categoryLabel } from "@/lib/i18n";
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
  let reports: Awaited<ReturnType<typeof getPublicReports>> = [];
  let errorMessage = "";

  try {
    reports = await getPublicReports({
      category: category || "all",
      district,
      area,
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
        <Button href="/reports/new">
          {t.common.submitAnIssue}
        </Button>
      }
    >
      {errorMessage ? (
        <EmptyState title={t.map.unavailable} description={errorMessage} />
      ) : (
        <div className="grid gap-5 xl:grid-cols-[340px_1fr]">
          <aside className="space-y-4 xl:sticky xl:top-24 xl:self-start">
            <Card variant="mapOverlay" title={t.map.filters} description={`${reports.length} ${t.map.shown}`}>
              <form className="grid gap-3">
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
            </Card>

            <Card variant="default">
              <div className="flex gap-3 text-sm leading-6 text-civic-muted">
                <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-civic-teal" aria-hidden="true" />
                <p>{t.map.onlyVisible}</p>
              </div>
            </Card>
          </aside>

          <div className="space-y-5">
            {/* Quick-filter chips — visible on mobile/tablet only (xl has the sidebar with category select) */}
            <div className="xl:hidden">
              <div className="flex flex-wrap gap-2">
                <a
                  href="/map"
                  className={cn(
                    "inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold transition-colors",
                    !category
                      ? "border-civic-orange bg-civic-orange text-white"
                      : "border-civic-line bg-white text-civic-muted hover:border-civic-orange/50 hover:text-civic-text",
                  )}
                >
                  All
                </a>
                {FOOD_CATEGORY_VALUES.map((cat) => (
                  <a
                    key={cat}
                    href={`/map?category=${cat}`}
                    className={cn(
                      "inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold transition-colors",
                      category === cat
                        ? "border-civic-orange bg-civic-orange text-white"
                        : "border-civic-line bg-white text-civic-muted hover:border-civic-orange/50 hover:text-civic-text",
                    )}
                  >
                    {categoryLabel(locale, cat)}
                  </a>
                ))}
              </div>
            </div>

            <Card variant="elevated" className="p-3">
              <PublicMapLoader reports={reports} locale={locale} />
            </Card>

            {reports.length === 0 ? (
              <EmptyState
                icon={MapPinned}
                title={t.map.noReports}
                description={t.map.noReportsCopy}
                action={<Button href="/reports/new">{t.map.submitFirst}</Button>}
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
                    <item.icon className="h-6 w-6 text-civic-teal" aria-hidden="true" />
                    <h2 className="mt-4 font-black text-white">{item.title}</h2>
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
