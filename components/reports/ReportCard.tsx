import Image from "next/image";
import Link from "next/link";
import { MapPin } from "lucide-react";
import { ISSUE_TYPES } from "@/lib/constants";
import type { PublicReport } from "@/lib/supabase/types";
import { formatDate, titleFromLocation } from "@/lib/utils";
import { IssueTypeBadge } from "@/components/reports/IssueTypeBadge";
import { ReportStatusBadge } from "@/components/reports/ReportStatusBadge";

export function ReportCard({ report }: { report: PublicReport }) {
  return (
    <Link
      href={`/reports/${report.id}`}
      className="grid overflow-hidden rounded-lg border border-civic-line bg-civic-soft/85 shadow-sm transition hover:-translate-y-0.5 hover:shadow-soft"
    >
      {report.image_url ? (
        <div className="relative aspect-[16/9] bg-civic-ink">
          <Image
            src={report.image_url}
            alt={ISSUE_TYPES[report.issue_type].label}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover"
          />
        </div>
      ) : null}
      <div className="p-4">
        <div className="flex flex-wrap gap-2">
          <IssueTypeBadge issueType={report.issue_type} />
          <ReportStatusBadge status={report.status} />
        </div>
        <h2 className="mt-3 text-base font-black text-white">
          {report.title || ISSUE_TYPES[report.issue_type].label}
        </h2>
        <p className="mt-2 line-clamp-2 text-sm leading-5 text-civic-muted">
          {report.menu_text || report.description || ISSUE_TYPES[report.issue_type].description}
        </p>
        <p className="mt-2 flex items-center gap-1 text-sm text-civic-muted">
          <MapPin className="h-4 w-4" aria-hidden="true" />
          {titleFromLocation(report.area, report.district)}
        </p>
        <p className="mt-2 text-xs text-civic-muted">{report.price_range || `Listed ${formatDate(report.created_at)}`}</p>
      </div>
    </Link>
  );
}
