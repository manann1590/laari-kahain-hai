"use client";

import { useState } from "react";
import Image from "next/image";
import { ExternalLink, LayoutGrid, List, MapPinned, Phone } from "lucide-react";
import { FOOD_CATEGORIES } from "@/lib/constants";
import { getCopy, categoryLabel } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n";
import type { FoodCategory } from "@/lib/supabase/types";
import { formatDate, titleFromLocation } from "@/lib/utils";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

type ReportRow = {
  id: string;
  category: FoodCategory;
  title: string | null;
  description: string | null;
  area: string | null;
  district: string | null;
  image_url: string | null;
  vendor_phone: string | null;
  menu_text: string | null;
  price_range: string | null;
  hours_text: string | null;
  created_at: string;
};

type Props = {
  reports: ReportRow[];
  locale: Locale;
};

function telHref(phone?: string | null) {
  if (!phone) return "";
  const normalized = phone.replace(/[^\d+]/g, "");
  return normalized ? `tel:${normalized}` : "";
}

export function VendorListView({ reports, locale }: Props) {
  const [view, setView] = useState<"grid" | "list">("grid");
  const t = getCopy(locale);

  return (
    <Card title={t.map.listView} description={t.map.listCopy} className="p-0">
      {/* View toggle */}
      <div className="flex items-center justify-end gap-1 px-5 pb-1 pt-0">
        <button
          type="button"
          aria-label="Grid view"
          aria-pressed={view === "grid"}
          onClick={() => setView("grid")}
          className={cn(
            "inline-flex h-8 w-8 items-center justify-center rounded-lg transition-colors",
            view === "grid"
              ? "bg-civic-orange text-white shadow-sm"
              : "text-civic-muted hover:bg-civic-soft hover:text-civic-text",
          )}
        >
          <LayoutGrid className="h-4 w-4" aria-hidden="true" />
        </button>
        <button
          type="button"
          aria-label="List view"
          aria-pressed={view === "list"}
          onClick={() => setView("list")}
          className={cn(
            "inline-flex h-8 w-8 items-center justify-center rounded-lg transition-colors",
            view === "list"
              ? "bg-civic-orange text-white shadow-sm"
              : "text-civic-muted hover:bg-civic-soft hover:text-civic-text",
          )}
        >
          <List className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>

      {/* Grid / card view */}
      {view === "grid" ? (
        <div className="grid gap-4 p-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
          {reports.map((report) => (
            <article
              key={report.id}
              className="rounded-lg border border-civic-line bg-civic-soft/85 p-3 shadow-sm"
            >
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
                    <span
                      className={
                        FOOD_CATEGORIES[report.category].badge +
                        " inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold"
                      }
                    >
                      {categoryLabel(locale, report.category)}
                    </span>
                  </div>
                  <h2 className="mt-2 truncate font-black text-white">
                    {report.title || titleFromLocation(report.area, report.district)}
                  </h2>
                  <p className="mt-1 text-sm text-civic-muted">
                    {titleFromLocation(report.area, report.district)}
                  </p>
                  <p className="mt-1 line-clamp-2 text-sm leading-5 text-civic-muted">
                    {report.menu_text || report.description || t.map.verifiedReportFallback}
                  </p>
                  <div className="mt-3 flex items-center justify-between gap-3">
                    <span className="text-xs text-civic-muted">
                      {report.price_range || formatDate(report.created_at)}
                    </span>
                    <Button href={`/reports/${report.id}`} size="sm">
                      {t.map.openReport}
                    </Button>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        /* List / table view */
        <div className="overflow-x-auto">
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
                        <p className="font-black text-white">{report.title || "Unnamed spot"}</p>
                        <p className="text-xs text-civic-muted">
                          {report.price_range || "Price not added"}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={
                        FOOD_CATEGORIES[report.category].badge +
                        " inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold"
                      }
                    >
                      {categoryLabel(locale, report.category)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-civic-muted">
                    {titleFromLocation(report.area, report.district)}
                  </td>
                  <td className="max-w-xs px-4 py-3 text-civic-muted">
                    <p className="line-clamp-2">
                      {report.menu_text || report.description || t.map.verifiedReportFallback}
                    </p>
                  </td>
                  <td className="px-4 py-3 text-civic-muted">
                    {report.hours_text || "Ask vendor"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      {report.vendor_phone ? (
                        <Button
                          href={telHref(report.vendor_phone)}
                          size="sm"
                          variant="secondary"
                        >
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
      )}
    </Card>
  );
}
