import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Copy, X, ArrowRight } from "lucide-react";
import { requireAdmin } from "@/lib/data/admin";
import { getAdminReportById, getReportEvents, getNearbyReports } from "@/lib/data/reports";
import {
  markDuplicateAction,
  rejectReportAction,
  updateReportAction,
} from "@/app/admin/actions";
import { FOOD_CATEGORIES, STATUS_LABELS } from "@/lib/constants";
import { distanceMeters } from "@/lib/geo";
import { formatDateTime } from "@/lib/utils";
import { PageShell } from "@/components/layout/PageShell";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { AdminReportForm } from "@/components/admin/AdminReportForm";
import { SafetyChecklist } from "@/components/admin/SafetyChecklist";
import { ReportStatusBadge } from "@/components/reports/ReportStatusBadge";
import { CategoryBadge } from "@/components/reports/CategoryBadge";
import { PublicMapLoader } from "@/components/map/PublicMapLoader";

export const metadata: Metadata = {
  title: "Review Vendor",
};

export default async function AdminReportDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  await requireAdmin();
  const { id } = await params;
  const query = await searchParams;
  const [report, events] = await Promise.all([getAdminReportById(id), getReportEvents(id)]);
  if (!report) notFound();

  const nearbyReports = await getNearbyReports(
    report.latitude,
    report.longitude,
    report.category,
    report.id,
    150,
  ).catch(() => []);

  const topNearby = nearbyReports.slice(0, 5);

  return (
    <PageShell
      eyebrow="Admin review"
      title="Review vendor listing"
      description="Check location, image safety, menu details, contact info, and moderation history before publishing."
      actions={
        <>
          <Button href="/admin" variant="secondary" className="w-full sm:w-auto">
            Back to dashboard
          </Button>
          {report.status === "approved" || report.status === "verified" ? (
            <Button href={`/reports/${report.id}`} variant="secondary" className="w-full sm:w-auto">
              Public page
            </Button>
          ) : null}
        </>
      }
    >
      {query.saved ? (
        <p className="mb-4 rounded-md border border-cyan-200 bg-cyan-50 p-3 text-sm text-cyan-950">
          Vendor changes saved.
        </p>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <aside className="space-y-6">
          {/* Tracking ID header */}
          {report.tracking_id ? (
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-normal text-civic-muted">Tracking ID</span>
              <span className="rounded-md bg-civic-soft px-2.5 py-1 font-mono text-sm font-black text-civic-green">
                {report.tracking_id}
              </span>
            </div>
          ) : null}

          {report.image_url ? (
            <Card title="Image review" className="p-3">
              <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-civic-ink">
                <Image
                  src={report.image_url}
                  alt={FOOD_CATEGORIES[report.category].label}
                  fill
                  sizes="(max-width: 1280px) 100vw, 45vw"
                  className="object-cover"
                />
              </div>
            </Card>
          ) : null}

          {/* Interactive Safety Checklist — only for pending listings */}
          {report.status === "pending" ? (
            <Card title="Image safety checklist" variant="warning">
              <SafetyChecklist reportId={report.id} />
            </Card>
          ) : null}

          <Card title="Map preview" className="p-3">
            <PublicMapLoader reports={[report]} heightClass="h-80 min-h-80" />
          </Card>

          {/* Nearby listings — Duplicate Detection */}
          <Card title="Nearby vendors" description="Open listings within 150m with the same cuisine.">
            {topNearby.length === 0 ? (
              <p className="text-sm text-civic-muted">No nearby vendors found within 150m.</p>
            ) : (
              <ul className="space-y-2">
                {topNearby.map((nearby) => {
                  const dist = Math.round(
                    distanceMeters(
                      { latitude: report.latitude, longitude: report.longitude },
                      { latitude: nearby.latitude, longitude: nearby.longitude },
                    ),
                  );
                  return (
                    <li
                      key={nearby.id}
                      className="flex min-w-0 items-start justify-between gap-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm"
                    >
                      <div className="min-w-0">
                        {nearby.tracking_id ? (
                          <p className="font-mono text-xs font-black text-civic-green">
                            {nearby.tracking_id}
                          </p>
                        ) : null}
                        <p className="mt-0.5 text-amber-900">
                          {FOOD_CATEGORIES[nearby.category]?.label ?? nearby.category}
                        </p>
                        <p className="mt-0.5 text-xs text-civic-muted">
                          {STATUS_LABELS[nearby.status]?.label ?? nearby.status} &middot; {dist}m away
                        </p>
                      </div>
                      <Link
                        href={`/admin/reports/${nearby.id}`}
                        className="shrink-0 text-civic-orange hover:underline"
                        aria-label={`Review nearby vendor ${nearby.tracking_id ?? nearby.id}`}
                      >
                        <ArrowRight className="h-4 w-4" aria-hidden="true" />
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </Card>

          {/* Quick Actions */}
          <Card title="Quick actions">
            <div className="space-y-4">
              {/* Approve — via SafetyChecklist, only shown for pending */}
              {report.status === "pending" ? (
                <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-950">
                  <p className="mb-2 font-black">Approve</p>
                  <p className="mb-3 text-xs text-green-800">
                    Use the safety checklist above to enable approval.
                  </p>
                </div>
              ) : null}

              {/* Reject */}
              <form action={rejectReportAction.bind(null, report.id)} className="space-y-2">
                <Textarea
                  label="Rejection note"
                  name="rejection_note"
                  placeholder="Optional internal note"
                  className="min-h-20"
                />
                <Button type="submit" variant="danger" className="w-full">
                  <X className="h-4 w-4" aria-hidden="true" />
                  Reject
                </Button>
              </form>

              {/* Mark Duplicate */}
              <form action={markDuplicateAction.bind(null, report.id)} className="space-y-2">
                <Input label="Duplicate of vendor ID" name="duplicate_of" />
                <Button type="submit" variant="outline" className="w-full">
                  <Copy className="h-4 w-4" aria-hidden="true" />
                  Mark duplicate
                </Button>
              </form>
            </div>
          </Card>

          {/* Event Timeline */}
          <Card title="Event timeline">
            {events.length === 0 ? (
              <p className="text-sm text-civic-muted">No events recorded yet.</p>
            ) : (
              <ol className="space-y-3">
                {events.map((event) => (
                  <li key={event.id} className="rounded-md border border-civic-line bg-civic-bg p-3 text-sm">
                    <p className="font-black capitalize text-civic-text">
                      {event.event_type.replaceAll("_", " ")}
                    </p>
                    <p className="mt-1 text-xs text-civic-muted">
                      {formatDateTime(event.created_at)}
                    </p>
                    {event.note ? <p className="mt-2 text-civic-muted">{event.note}</p> : null}
                    {event.old_status || event.new_status ? (
                      <p className="mt-2 text-xs text-civic-muted">
                        {event.old_status || "none"} &rarr; {event.new_status || "none"}
                      </p>
                    ) : null}
                    {event.proof_image_url ? (
                      <a
                        href={event.proof_image_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2 block text-xs text-civic-orange underline"
                      >
                        View proof image
                      </a>
                    ) : null}
                  </li>
                ))}
              </ol>
            )}
          </Card>
        </aside>

        <div className="space-y-6">
          <Card variant="elevated">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <CategoryBadge category={report.category} />
              <ReportStatusBadge status={report.status} />
              {report.tracking_id ? (
                <span className="rounded-md bg-civic-soft px-2 py-0.5 font-mono text-xs font-black text-civic-green">
                  {report.tracking_id}
                </span>
              ) : null}
            </div>
            <AdminReportForm report={report} action={updateReportAction.bind(null, report.id)} />
          </Card>
        </div>
      </div>
    </PageShell>
  );
}
