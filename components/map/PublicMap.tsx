"use client";

import { MapContainer, TileLayer } from "react-leaflet";
import { getCopy, type Locale } from "@/lib/i18n";
import type { PublicReport } from "@/lib/supabase/types";
import { AHMEDABAD_CENTER } from "@/lib/constants";
import { ReportMarker } from "@/components/map/ReportMarker";
import { Button } from "@/components/ui/Button";

export function PublicMap({
  reports,
  heightClass = "h-[62svh] min-h-[360px] sm:h-[70vh] sm:min-h-[420px]",
  locale = "en",
}: {
  reports: PublicReport[];
  heightClass?: string;
  locale?: Locale;
}) {
  const t = getCopy(locale);

  if (reports.length === 0) {
    return (
      <div className={`relative overflow-hidden rounded-lg border border-civic-line bg-civic-soft ${heightClass}`}>
        <div className="absolute inset-0 civic-grid opacity-80" aria-hidden="true" />
        <div className="absolute left-8 top-12 h-5 w-5 rounded-full border-2 border-white bg-civic-amber shadow-soft" />
        <div className="absolute right-16 top-24 h-5 w-5 rounded-full border-2 border-white bg-civic-teal shadow-soft" />
        <div className="absolute bottom-16 left-1/3 h-5 w-5 rounded-full border-2 border-white bg-civic-green shadow-soft" />
        <div className="absolute inset-0 flex items-center justify-center p-5">
          <div className="max-w-md rounded-lg border border-civic-line bg-civic-ink/95 p-6 text-center shadow-soft backdrop-blur">
            <h2 className="text-xl font-black text-white">{t.map.noReports}</h2>
            <p className="mt-2 text-sm leading-6 text-civic-muted">
              {t.map.noReportsCopy}
            </p>
            <Button href="/reports/new" className="mt-5 w-full sm:w-auto">
              {t.map.submitFirst}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const center = reports[0]
    ? { lat: reports[0].latitude, lng: reports[0].longitude }
    : AHMEDABAD_CENTER;

  return (
    <div className={`overflow-hidden rounded-lg border border-civic-line ${heightClass}`}>
      <MapContainer
        center={[center.lat, center.lng]}
        zoom={12}
        scrollWheelZoom={false}
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {reports.map((report) => (
          <ReportMarker key={report.id} report={report} locale={locale} />
        ))}
      </MapContainer>
    </div>
  );
}
