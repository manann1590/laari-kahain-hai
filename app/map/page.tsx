import type { Metadata } from "next";
import Image from "next/image";
import { ExternalLink, Filter, Info, ListFilter, MapPinned, Phone, ShieldCheck } from "lucide-react";
import { FOOD_CATEGORIES } from "@/lib/constants";
import { getRequestLocale } from "@/lib/i18n-server";
import { getCopy, categoryLabel } from "@/lib/i18n";
import type { FoodCategory } from "@/lib/supabase/types";
import { getPublicReports } from "@/lib/data/reports";
import { normalizeFoodCategory } from "@/lib/validators/report";
import { formatDate, titleFromLocation } from "@/lib/utils";
import { PageShell } from "@/components/layout/PageShell";
import { Select } from "@/components/ui/Select";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { PublicMapLoader } from "@/components/map/PublicMapLoader";
import { Card } from "@/components/ui/Card";

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

  function telHref(phone?: string | null) {
    if (!phone) return "";
    const normalized = phone.replace(/[^\d+]/g, "");
    return normalized ? `tel:${normalized}` : "";
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
              <Card title={t.map.listView} description={t.map.listCopy} className="p-0">
                <div className="grid gap-4 p-4 md:hidden">
                  {reports.map((report) => (
                    <article key={report.id} className="rounded-lg border border-civic-line bg-civic-soft/85 p-3 shadow-sm">
                      <div className="flex gap-3">
                        {report.image_url ? (
                          <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-civic-ink">
                            <Image
                              src={report.image_url}
                              alt={categoryLabel(locale, report.category)}
                              fill
                              sizes="96px"
                              className="object-cover"
                            />
                          </div>
                        ) : (
                          <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-lg bg-civic-ink">
                            <MapPinned className="h-6 w-6 text-civic-muted" aria-hidden="true" />
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className={FOOD_CATEGORIES[report.category].badge + " inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold"}>
                              {categoryLabel(locale, report.category)}
                            </span>
                          </div>
                          <h2 className="mt-2 truncate font-black text-white">
                            {report.title || titleFromLocation(report.area, report.district)}
                          </h2>
                          <p className="mt-1 text-sm text-civic-muted">{titleFromLocation(report.area, report.district)}</p>
                          <p className="mt-1 line-clamp-2 text-sm leading-5 text-civic-muted">{report.menu_text || report.description || t.map.verifiedReportFallback}</p>
                          <div className="mt-3 flex items-center justify-between gap-3">
                            <span className="text-xs text-civic-muted">{report.price_range || formatDate(report.created_at)}</span>
                            <Button href={`/reports/${report.id}`} size="sm">
                              {t.map.openReport}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
                <div className="hidden overflow-x-auto md:block">
                  <table className="min-w-full divide-y divide-civic-line text-sm">
                    <thead className="bg-civic-ink text-left text-xs uppercase tracking-normal text-civic-muted">
                      <tr>
                        <th className="px-4 py-3">Vendor</th>
                        <th className="px-4 py-3">Cuisine</th>
                        <th className="px-4 py-3">Location</th>
                        <th className="px-4 py-3">Menu preview</th>
                        <th className="px-4 py-3">Hours</th>
                        <th className="px-4 py-3">Contact</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-civic-line">
                      {reports.map((report) => (
                        <tr key={report.id} className="align-top hover:bg-white/5">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              {report.image_url ? (
                                <div className="relative h-14 w-16 shrink-0 overflow-hidden rounded-lg bg-civic-ink">
                                  <Image
                                    src={report.image_url}
                                    alt={categoryLabel(locale, report.category)}
                                    fill
                                    sizes="64px"
                                    className="object-cover"
                                  />
                                </div>
                              ) : null}
                              <div>
                                <p className="font-black text-white">{report.title || "Unnamed lari"}</p>
                                <p className="text-xs text-civic-muted">{report.price_range || "Price not added"}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className={FOOD_CATEGORIES[report.category].badge + " inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold"}>
                              {categoryLabel(locale, report.category)}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-civic-muted">{titleFromLocation(report.area, report.district)}</td>
                          <td className="max-w-xs px-4 py-3 text-civic-muted">
                            <p className="line-clamp-2">{report.menu_text || report.description || t.map.verifiedReportFallback}</p>
                          </td>
                          <td className="px-4 py-3 text-civic-muted">{report.hours_text || "Ask vendor"}</td>
                          <td className="px-4 py-3">
                            <div className="flex flex-wrap gap-2">
                              {report.vendor_phone ? (
                                <Button href={telHref(report.vendor_phone)} size="sm" variant="secondary">
                                  <Phone className="h-4 w-4" aria-hidden="true" />
                                  Call
                                </Button>
                              ) : null}
                              <Button href={`/reports/${report.id}`} size="sm">
                                <ExternalLink className="h-4 w-4" aria-hidden="true" />
                                View
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
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
