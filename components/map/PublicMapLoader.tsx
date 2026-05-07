"use client";

import dynamic from "next/dynamic";
import { getCopy, type Locale } from "@/lib/i18n";
import type { PublicReport } from "@/lib/supabase/types";
import { Loading } from "@/components/ui/Loading";
import { Button } from "@/components/ui/Button";

const PublicMapClient = dynamic(
  () => import("@/components/map/PublicMap").then((mod) => mod.PublicMap),
  {
    ssr: false,
    loading: () => <Loading label="" className="min-h-[320px] justify-center" />,
  },
);

function EmptyMapPreview({
  heightClass = "h-[62svh] min-h-[360px] sm:h-[70vh] sm:min-h-[420px]",
  locale = "en",
}: {
  heightClass?: string;
  locale?: Locale;
}) {
  const t = getCopy(locale);

  return (
    <div className={`relative overflow-hidden rounded-lg border border-civic-line bg-civic-bg ${heightClass}`}>
      <div className="absolute inset-0 civic-grid opacity-80" aria-hidden="true" />
      <div className="absolute left-6 top-12 rounded-full border border-amber-200 bg-amber-100 px-3 py-1 text-xs font-black text-amber-950 shadow-card sm:left-8">
        Chai
      </div>
      <div className="absolute right-6 top-24 rounded-full border border-green-200 bg-green-100 px-3 py-1 text-xs font-black text-green-950 shadow-card sm:right-16">
        Meals
      </div>
      <div className="absolute bottom-16 left-1/4 rounded-full border border-blue-200 bg-blue-100 px-3 py-1 text-xs font-black text-blue-950 shadow-card">
        Dosa
      </div>
      <div className="absolute inset-0 flex items-center justify-center p-5">
        <div className="max-w-md rounded-lg border border-civic-line bg-white/95 p-6 text-center shadow-soft backdrop-blur">
          <h2 className="text-xl font-black text-civic-text">Ahmedabad&apos;s live food map is ready</h2>
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

export function PublicMapLoader({
  reports,
  heightClass,
  locale = "en",
}: {
  reports: PublicReport[];
  heightClass?: string;
  locale?: Locale;
}) {
  if (reports.length === 0) {
    return <EmptyMapPreview heightClass={heightClass} locale={locale} />;
  }

  return <PublicMapClient reports={reports} heightClass={heightClass} locale={locale} />;
}
