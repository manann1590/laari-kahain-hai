"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Clock3,
  ExternalLink,
  Globe,
  LayoutGrid,
  List,
  MapPinned,
  MessageCircle,
  Navigation,
  Phone,
} from "lucide-react";
import { FOOD_CATEGORIES } from "@/lib/constants";
import { getCopy, categoryLabel } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n";
import type { FoodCategory } from "@/lib/supabase/types";
import { formatDate, titleFromLocation } from "@/lib/utils";
import { googleMapsLink } from "@/lib/geo";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

type ReportRow = {
  id: string;
  category: FoodCategory;
  title: string | null;
  description: string | null;
  latitude: number;
  longitude: number;
  area: string | null;
  district: string | null;
  image_url: string | null;
  vendor_phone: string | null;
  vendor_whatsapp: string | null;
  vendor_website: string | null;
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

function whatsappHref(phone?: string | null) {
  if (!phone) return "";
  const normalized = phone.replace(/\D/g, "");
  return normalized ? `https://wa.me/${normalized}` : "";
}

function websiteHref(value?: string | null) {
  if (!value) return "";
  try {
    const url = new URL(value.startsWith("http") ? value : `https://${value}`);
    return url.protocol === "http:" || url.protocol === "https:" ? url.toString() : "";
  } catch {
    return "";
  }
}

function VendorImage({ report, locale }: { report: ReportRow; locale: Locale }) {
  if (report.image_url) {
    return (
      <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-civic-ink">
        <Image
          src={report.image_url}
          alt={report.title || categoryLabel(locale, report.category)}
          fill
          sizes="(max-width: 768px) 100vw, 340px"
          className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
        />
      </div>
    );
  }

  return (
    <div className="flex aspect-[4/3] items-center justify-center rounded-lg border border-dashed border-civic-line bg-civic-bg">
      <MapPinned className="h-8 w-8 text-civic-muted" aria-hidden="true" />
    </div>
  );
}

export function VendorListView({ reports, locale }: Props) {
  const [view, setView] = useState<"grid" | "list">("grid");
  const t = getCopy(locale);
  const viewModes = [
    { mode: "grid" as const, icon: LayoutGrid, label: "Grid view" },
    { mode: "list" as const, icon: List, label: "List view" },
  ];

  return (
    <Card className="p-0">
      <div className="flex flex-col gap-3 border-b border-civic-line p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h2 className="font-black text-civic-text">Food spots on radar</h2>
          <p className="mt-1 text-sm leading-6 text-civic-muted">
            {reports.length} verified results with quick contact and directions.
          </p>
        </div>
        <div className="flex items-center gap-1 rounded-lg border border-civic-line bg-civic-bg p-1">
          {viewModes.map(({ mode, icon: Icon, label }) => (
            <button
              key={mode}
              type="button"
              aria-label={label}
              aria-pressed={view === mode}
              onClick={() => setView(mode)}
              className={cn(
                "inline-flex h-8 w-8 items-center justify-center rounded-md transition-colors",
                view === mode
                  ? "bg-civic-orange text-white shadow-sm"
                  : "text-civic-muted hover:bg-white hover:text-civic-text",
              )}
            >
              <Icon className="h-4 w-4" aria-hidden="true" />
            </button>
          ))}
        </div>
      </div>

      {view === "grid" ? (
        <div className="grid gap-4 p-4 md:grid-cols-2">
          {reports.map((report) => {
            const tel = telHref(report.vendor_phone);
            const whatsapp = whatsappHref(report.vendor_whatsapp || report.vendor_phone);
            const website = websiteHref(report.vendor_website);
            return (
              <article
                key={report.id}
                className="group overflow-hidden rounded-lg border border-civic-line bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-civic-orange/40 hover:shadow-card"
              >
                <div className="p-3">
                  <VendorImage report={report} locale={locale} />
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <span
                      className={
                        FOOD_CATEGORIES[report.category].badge +
                        " inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold"
                      }
                    >
                      {categoryLabel(locale, report.category)}
                    </span>
                    {report.price_range ? (
                      <span className="rounded-full border border-civic-line bg-civic-bg px-2.5 py-1 text-xs font-bold text-civic-text">
                        {report.price_range}
                      </span>
                    ) : null}
                  </div>
                  <h3 className="mt-3 truncate text-lg font-black text-civic-text">
                    {report.title || titleFromLocation(report.area, report.district)}
                  </h3>
                  <p className="mt-1 text-sm font-semibold text-civic-muted">
                    {titleFromLocation(report.area, report.district)}
                  </p>
                  <p className="mt-2 line-clamp-2 min-h-10 text-sm leading-5 text-civic-muted">
                    {report.menu_text || report.description || t.map.verifiedReportFallback}
                  </p>
                </div>

                <div className="grid grid-cols-4 border-t border-civic-line bg-civic-bg">
                  {tel ? (
                    <a href={tel} className="flex min-h-12 items-center justify-center text-civic-text hover:bg-white" aria-label="Call vendor">
                      <Phone className="h-4 w-4" aria-hidden="true" />
                    </a>
                  ) : (
                    <span className="flex min-h-12 items-center justify-center text-civic-muted/40">
                      <Phone className="h-4 w-4" aria-hidden="true" />
                    </span>
                  )}
                  {whatsapp ? (
                    <a href={whatsapp} className="flex min-h-12 items-center justify-center text-civic-success hover:bg-white" aria-label="WhatsApp vendor">
                      <MessageCircle className="h-4 w-4" aria-hidden="true" />
                    </a>
                  ) : (
                    <span className="flex min-h-12 items-center justify-center text-civic-muted/40">
                      <MessageCircle className="h-4 w-4" aria-hidden="true" />
                    </span>
                  )}
                  {website ? (
                    <a href={website} className="flex min-h-12 items-center justify-center text-civic-info hover:bg-white" aria-label="Open vendor website">
                      <Globe className="h-4 w-4" aria-hidden="true" />
                    </a>
                  ) : (
                    <span className="flex min-h-12 items-center justify-center text-civic-muted/40">
                      <Globe className="h-4 w-4" aria-hidden="true" />
                    </span>
                  )}
                  <a
                    href={googleMapsLink(report.latitude, report.longitude)}
                    className="flex min-h-12 items-center justify-center text-civic-orange hover:bg-white"
                    aria-label="Get directions"
                  >
                    <Navigation className="h-4 w-4" aria-hidden="true" />
                  </a>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="divide-y divide-civic-line">
          {reports.map((report) => {
            const tel = telHref(report.vendor_phone);
            const website = websiteHref(report.vendor_website);
            return (
              <article key={report.id} className="grid gap-3 p-4 hover:bg-civic-bg lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={
                        FOOD_CATEGORIES[report.category].badge +
                        " inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold"
                      }
                    >
                      {categoryLabel(locale, report.category)}
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-civic-muted">
                      <Clock3 className="h-3.5 w-3.5" aria-hidden="true" />
                      {report.hours_text || formatDate(report.created_at)}
                    </span>
                  </div>
                  <h3 className="mt-2 truncate font-black text-civic-text">{report.title || "Unnamed spot"}</h3>
                  <p className="mt-1 text-sm text-civic-muted">
                    {titleFromLocation(report.area, report.district)} · {report.menu_text || report.description || t.map.verifiedReportFallback}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {tel ? (
                    <Button href={tel} size="sm" variant="secondary">
                      <Phone className="h-4 w-4" aria-hidden="true" />
                      Call
                    </Button>
                  ) : null}
                  {website ? (
                    <Button href={website} size="sm" variant="outline">
                      <Globe className="h-4 w-4" aria-hidden="true" />
                      Website
                    </Button>
                  ) : null}
                  <Button href={`/reports/${report.id}`} size="sm">
                    <ExternalLink className="h-4 w-4" aria-hidden="true" />
                    View
                  </Button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </Card>
  );
}
