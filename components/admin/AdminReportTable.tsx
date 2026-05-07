import Image from "next/image";
import { Check, Eye, X } from "lucide-react";
import type { Report } from "@/lib/supabase/types";
import { FOOD_CATEGORIES } from "@/lib/constants";
import { formatDate, titleFromLocation } from "@/lib/utils";
import {
  approveReportAction,
  rejectReportAction,
} from "@/app/admin/actions";
import { Button } from "@/components/ui/Button";
import { CategoryBadge } from "@/components/reports/CategoryBadge";
import { ReportStatusBadge } from "@/components/reports/ReportStatusBadge";
import { EmptyState } from "@/components/ui/EmptyState";

export function AdminReportTable({ reports }: { reports: Report[] }) {
  if (reports.length === 0) {
    return (
      <EmptyState
        title="No pending vendors"
        description="No vendors match the current filters. New food spots can be added manually from the admin panel."
        action={<Button href="/admin/reports/new">Add vendor</Button>}
      />
    );
  }

  return (
    <>
      {/* Mobile cards */}
      <div className="space-y-3 md:hidden">
        {reports.map((report) => (
          <article key={report.id} className="rounded-lg border border-civic-line bg-civic-soft/85 p-3 shadow-sm">
            <div className="flex gap-3">
              {report.image_url ? (
                <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-md bg-civic-soft">
                  <Image
                    src={report.image_url}
                    alt={FOOD_CATEGORIES[report.category].label}
                    fill
                    sizes="96px"
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="h-24 w-24 shrink-0 rounded-md bg-civic-soft" />
              )}
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap gap-2">
                  <CategoryBadge category={report.category} />
                  <ReportStatusBadge status={report.status} />
                </div>
                {report.tracking_id ? (
                  <p className="mt-1.5 font-mono text-xs font-semibold text-civic-muted">
                    {report.tracking_id}
                  </p>
                ) : null}
                <h2 className="mt-1 truncate font-black text-white">
                  {report.title || FOOD_CATEGORIES[report.category].label}
                </h2>
                <p className="mt-1 text-sm text-civic-muted">
                  {titleFromLocation(report.area, report.district)}
                </p>
                <p className="mt-1 text-xs capitalize text-civic-muted">
                  {formatDate(report.created_at)} &middot; {report.severity || "medium"}
                </p>
              </div>
            </div>

            <div className="mt-3 grid gap-2 sm:grid-cols-3">
              <Button href={`/admin/reports/${report.id}`} size="sm" variant="secondary" className="w-full">
                <Eye className="h-4 w-4" aria-hidden="true" />
                Review
              </Button>
              {report.status === "pending" ? (
                <>
                  <form action={approveReportAction.bind(null, report.id)}>
                    <Button size="sm" type="submit" variant="success" className="w-full">
                      <Check className="h-4 w-4" aria-hidden="true" />
                      Approve
                    </Button>
                  </form>
                  <form action={rejectReportAction.bind(null, report.id)}>
                    <Button size="sm" variant="danger" type="submit" className="w-full">
                      <X className="h-4 w-4" aria-hidden="true" />
                      Reject
                    </Button>
                  </form>
                </>
              ) : null}
            </div>
          </article>
        ))}
      </div>

      {/* Desktop table */}
      <div className="hidden overflow-x-auto rounded-lg border border-civic-line bg-civic-soft/85 md:block">
        <table className="min-w-full divide-y divide-civic-line text-sm">
          <thead className="bg-civic-ink text-left text-xs uppercase tracking-normal text-civic-muted">
            <tr>
              <th className="px-4 py-3">Image</th>
              <th className="px-4 py-3">Vendor</th>
              <th className="px-4 py-3">Tracking ID</th>
              <th className="px-4 py-3">Area/District</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Created</th>
              <th className="px-4 py-3">Severity</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-civic-line">
            {reports.map((report) => (
              <tr key={report.id} className="align-top hover:bg-white/5">
                <td className="px-4 py-3">
                  {report.image_url ? (
                    <div className="relative h-14 w-20 overflow-hidden rounded bg-civic-ink">
                      <Image
                        src={report.image_url}
                        alt={FOOD_CATEGORIES[report.category].label}
                        fill
                        sizes="80px"
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="h-14 w-20 rounded bg-civic-ink" />
                  )}
                </td>
                <td className="px-4 py-3">
                  <CategoryBadge category={report.category} />
                  <p className="mt-2 max-w-xs truncate font-black text-white">
                    {report.title || FOOD_CATEGORIES[report.category].label}
                  </p>
                </td>
                <td className="px-4 py-3">
                  {report.tracking_id ? (
                    <span className="rounded-md bg-civic-ink px-2 py-0.5 font-mono text-xs font-black text-civic-green">
                      {report.tracking_id}
                    </span>
                  ) : (
                    <span className="text-xs text-civic-muted">—</span>
                  )}
                </td>
                <td className="px-4 py-3 text-civic-muted">
                  {titleFromLocation(report.area, report.district)}
                </td>
                <td className="px-4 py-3">
                  <ReportStatusBadge status={report.status} />
                </td>
                <td className="px-4 py-3 text-civic-muted">{formatDate(report.created_at)}</td>
                <td className="px-4 py-3 capitalize text-civic-muted">{report.severity || "medium"}</td>
                <td className="px-4 py-3">
                  <div className="flex min-w-48 flex-wrap gap-2">
                    <Button href={`/admin/reports/${report.id}`} size="sm" variant="secondary">
                      <Eye className="h-4 w-4" aria-hidden="true" />
                      Review
                    </Button>
                    {report.status === "pending" ? (
                      <>
                        <form action={approveReportAction.bind(null, report.id)}>
                          <Button size="sm" type="submit" variant="success">
                            <Check className="h-4 w-4" aria-hidden="true" />
                            Approve
                          </Button>
                        </form>
                        <form action={rejectReportAction.bind(null, report.id)}>
                          <Button size="sm" variant="danger" type="submit">
                            <X className="h-4 w-4" aria-hidden="true" />
                            Reject
                          </Button>
                        </form>
                      </>
                    ) : null}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
