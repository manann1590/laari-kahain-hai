"use client";

import L from "leaflet";
import { Marker, Popup } from "react-leaflet";
import Link from "next/link";
import { FOOD_CATEGORIES } from "@/lib/constants";
import { getCopy, categoryLabel, type Locale } from "@/lib/i18n";
import type { PublicReport } from "@/lib/supabase/types";
import { formatDate, titleFromLocation } from "@/lib/utils";
import { ReportStatusBadge } from "@/components/reports/ReportStatusBadge";

export function ReportMarker({ report, locale = "en" }: { report: PublicReport; locale?: Locale }) {
  const t = getCopy(locale);
  const issue = FOOD_CATEGORIES[report.category] || FOOD_CATEGORIES.other;
  const icon = L.divIcon({
    className: "",
    html: `<div class="pp-marker" style="width:18px;height:18px;background:${issue.marker}"></div>`,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
  });

  return (
    <Marker position={[report.latitude, report.longitude]} icon={icon}>
      <Popup minWidth={220}>
        <div className="space-y-2 rounded-md bg-civic-ink p-2">
          {report.image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={report.image_url}
              alt={categoryLabel(locale, report.category)}
              className="h-24 w-full rounded object-cover"
            />
          ) : null}
          <div>
            <p className="font-black text-white">{report.title || categoryLabel(locale, report.category)}</p>
            <p className="text-xs text-civic-muted">{titleFromLocation(report.area, report.district)}</p>
          </div>
          <p className="line-clamp-2 text-xs text-civic-muted">{report.menu_text || report.description}</p>
          <div className="flex items-center justify-between gap-2">
            <ReportStatusBadge status={report.status} locale={locale} />
            <span className="text-xs text-civic-muted">{report.price_range || formatDate(report.created_at)}</span>
          </div>
          <Link href={`/reports/${report.id}`} className="text-sm font-semibold text-civic-teal">
            {t.common.details}
          </Link>
        </div>
      </Popup>
    </Marker>
  );
}
