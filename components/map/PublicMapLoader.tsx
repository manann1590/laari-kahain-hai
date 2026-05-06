"use client";

import dynamic from "next/dynamic";
import type { Locale } from "@/lib/i18n";
import type { PublicReport } from "@/lib/supabase/types";
import { Loading } from "@/components/ui/Loading";

const PublicMapClient = dynamic(
  () => import("@/components/map/PublicMap").then((mod) => mod.PublicMap),
  {
    ssr: false,
    loading: () => <Loading label="" className="min-h-[320px] justify-center" />,
  },
);

export function PublicMapLoader({
  reports,
  heightClass,
  locale = "en",
}: {
  reports: PublicReport[];
  heightClass?: string;
  locale?: Locale;
}) {
  return <PublicMapClient reports={reports} heightClass={heightClass} locale={locale} />;
}
