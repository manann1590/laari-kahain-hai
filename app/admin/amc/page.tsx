import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { requireAdmin } from "@/lib/data/admin";
import { getAmcBatches, getAmcBatchById, getBatchReports } from "@/lib/data/amc";
import { getAdminReports } from "@/lib/data/reports";
import {
  createAmcBatchAction,
  addReportsToBatchAction,
  generateEmailBodyAction,
  markBatchSentAction,
} from "@/app/admin/amc/actions";
import { ISSUE_TYPES, STATUS_LABELS } from "@/lib/constants";
import { formatDate, formatDateTime } from "@/lib/utils";
import { PageShell } from "@/components/layout/PageShell";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { EmptyState } from "@/components/ui/EmptyState";
import { ReportStatusBadge } from "@/components/reports/ReportStatusBadge";
import { IssueTypeBadge } from "@/components/reports/IssueTypeBadge";
import { Mail, Plus, Send, FileText } from "lucide-react";

export const metadata: Metadata = {
  title: "Review Exports — Admin",
};

export default async function AdminAmcPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  await requireAdmin();
  const query = await searchParams;
  const batchId = query.batch;

  let batches: Awaited<ReturnType<typeof getAmcBatches>> = [];
  try {
    batches = await getAmcBatches();
  } catch {
    batches = [];
  }

  // If a batch is selected, load its detail
  const selectedBatch = batchId ? await getAmcBatchById(batchId) : null;
  const batchReports = selectedBatch ? await getBatchReports(selectedBatch.id) : [];
  const batchReportIds = new Set(batchReports.map((r) => r.id));

  // Listings eligible to be added to this batch (verified or in_progress, not already in batch)
  let eligibleReports: Awaited<ReturnType<typeof getAdminReports>> = [];
  if (selectedBatch) {
    const [verified, inProgress] = await Promise.all([
      getAdminReports({ status: "verified" }).catch(() => [] as Awaited<ReturnType<typeof getAdminReports>>),
      getAdminReports({ status: "in_progress" }).catch(() => [] as Awaited<ReturnType<typeof getAdminReports>>),
    ]);
    eligibleReports = [...verified, ...inProgress].filter((r) => !batchReportIds.has(r.id));
  }

  // Pre-generate email body to show if it exists
  const emailBody = selectedBatch?.body ?? null;

  return (
    <PageShell
      eyebrow="Review exports"
      title="Weekly Review Batches"
      description="Manage vendor batches prepared for follow-up, outreach, or audit."
      actions={
        <Button href="#create-batch" variant="primary">
          <Plus className="h-4 w-4" aria-hidden="true" />
          Create new batch
        </Button>
      }
    >
      <div className="grid gap-8 xl:grid-cols-[1fr_1.4fr]">
        {/* Left: batch list + create form */}
        <div className="space-y-6">
          <Card title="All batches">
            {batches.length === 0 ? (
              <EmptyState
                title="No batches yet"
                description="Create your first review batch below."
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-civic-line text-sm">
                  <thead className="bg-civic-soft text-left text-xs uppercase tracking-wide text-civic-muted">
                    <tr>
                      <th className="px-4 py-2">Week</th>
                      <th className="px-4 py-2">Listings</th>
                      <th className="px-4 py-2">Status</th>
                      <th className="px-4 py-2">Sent</th>
                      <th className="px-4 py-2"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-civic-line">
                    {batches.map((batch) => (
                      <tr
                        key={batch.id}
                        className={
                          batch.id === batchId
                            ? "bg-civic-teal/5 font-medium"
                            : "hover:bg-civic-soft"
                        }
                      >
                        <td className="px-4 py-2 text-white">
                          {formatDate(batch.week_start)} &ndash; {formatDate(batch.week_end)}
                        </td>
                        <td className="px-4 py-2 text-civic-muted">{batch.report_count}</td>
                        <td className="px-4 py-2">
                          <span
                            className={
                              batch.status === "sent"
                                ? "inline-block rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-800"
                                : batch.status === "failed"
                                  ? "inline-block rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-semibold text-red-800"
                                  : "inline-block rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-800"
                            }
                          >
                            {batch.status}
                          </span>
                        </td>
                        <td className="px-4 py-2 text-civic-muted">
                          {batch.sent_at ? formatDateTime(batch.sent_at) : "—"}
                        </td>
                        <td className="px-4 py-2">
                          <Link
                            href={`/admin/amc?batch=${batch.id}`}
                            className="text-civic-teal hover:underline"
                          >
                            View
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>

          {/* Create batch form */}
          <div id="create-batch">
          <Card title="Create new batch">
            <form action={createAmcBatchAction} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  label="Week start"
                  name="week_start"
                  type="date"
                  required
                />
                <Input
                  label="Week end"
                  name="week_end"
                  type="date"
                  required
                />
              </div>
              <Button type="submit" variant="primary">
                <Plus className="h-4 w-4" aria-hidden="true" />
                Create batch
              </Button>
            </form>
          </Card>
          </div>
        </div>

        {/* Right: batch detail */}
        <div className="space-y-6">
          {selectedBatch ? (
            <>
              <Card
                title={`Batch: ${formatDate(selectedBatch.week_start)} – ${formatDate(selectedBatch.week_end)}`}
                variant="elevated"
              >
                <dl className="grid gap-2 text-sm sm:grid-cols-2">
                  <div>
                    <dt className="text-civic-muted">Status</dt>
                    <dd className="font-black capitalize text-white">{selectedBatch.status}</dd>
                  </div>
                  <div>
                    <dt className="text-civic-muted">Listing count</dt>
                    <dd className="font-black text-white">{selectedBatch.report_count}</dd>
                  </div>
                  {selectedBatch.sent_at ? (
                    <div>
                      <dt className="text-civic-muted">Sent at</dt>
                      <dd className="font-black text-white">{formatDateTime(selectedBatch.sent_at)}</dd>
                    </div>
                  ) : null}
                  {selectedBatch.sent_to ? (
                    <div>
                      <dt className="text-civic-muted">Sent to</dt>
                      <dd className="font-black text-white">{selectedBatch.sent_to}</dd>
                    </div>
                  ) : null}
                </dl>
              </Card>

              {/* Listings already in batch */}
              {batchReports.length > 0 ? (
                <Card title={`Listings in this batch (${batchReports.length})`}>
                  <ul className="space-y-2">
                    {batchReports.map((report) => (
                      <li
                        key={report.id}
                        className="flex items-center gap-3 rounded-lg border border-civic-line bg-civic-ink p-2.5 text-sm"
                      >
                        {report.image_url ? (
                          <div className="relative h-12 w-16 shrink-0 overflow-hidden rounded bg-civic-soft">
                            <Image
                              src={report.image_url}
                              alt={ISSUE_TYPES[report.issue_type]?.label ?? report.issue_type}
                              fill
                              sizes="64px"
                              className="object-cover"
                            />
                          </div>
                        ) : (
                          <div className="h-12 w-16 shrink-0 rounded bg-civic-soft" />
                        )}
                        <div className="min-w-0 flex-1">
                          {report.tracking_id ? (
                            <p className="font-mono text-xs font-semibold text-civic-muted">
                              {report.tracking_id}
                            </p>
                          ) : null}
                          <IssueTypeBadge issueType={report.issue_type} />
                          <p className="mt-0.5 truncate text-xs text-civic-muted">
                            {[report.area, report.district].filter(Boolean).join(", ")}
                          </p>
                        </div>
                        <ReportStatusBadge status={report.status} />
                      </li>
                    ))}
                  </ul>
                </Card>
              ) : null}

              {/* Add listings to batch */}
              {selectedBatch.status === "draft" && eligibleReports.length > 0 ? (
                <Card
                  title="Add listings to batch"
                  description="Select verified or in-progress vendor listings not yet in this batch."
                >
                  <form
                    action={addReportsToBatchAction.bind(null, selectedBatch.id)}
                    className="space-y-3"
                  >
                    <ul className="max-h-80 space-y-2 overflow-y-auto">
                      {eligibleReports.map((report) => (
                        <li key={report.id}>
                          <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-civic-line p-2.5 text-sm hover:border-civic-teal/30 hover:bg-civic-soft">
                            <input
                              type="checkbox"
                              name="report_id"
                              value={report.id}
                              className="h-4 w-4 rounded border-civic-line text-civic-teal focus:ring-civic-teal"
                            />
                            {report.image_url ? (
                              <div className="relative h-10 w-14 shrink-0 overflow-hidden rounded bg-civic-soft">
                                <Image
                                  src={report.image_url}
                                  alt={ISSUE_TYPES[report.issue_type]?.label ?? report.issue_type}
                                  fill
                                  sizes="56px"
                                  className="object-cover"
                                />
                              </div>
                            ) : (
                              <div className="h-10 w-14 shrink-0 rounded bg-civic-soft" />
                            )}
                            <div className="min-w-0 flex-1">
                              {report.tracking_id ? (
                                <p className="font-mono text-xs font-semibold text-civic-muted">
                                  {report.tracking_id}
                                </p>
                              ) : null}
                              <IssueTypeBadge issueType={report.issue_type} />
                              <p className="mt-0.5 truncate text-xs text-civic-muted">
                                {report.description
                                  ? report.description.slice(0, 80) + (report.description.length > 80 ? "…" : "")
                                  : [report.area, report.district].filter(Boolean).join(", ")}
                              </p>
                            </div>
                            <span
                              className={
                                STATUS_LABELS[report.status]
                                  ? `rounded-full border px-2 py-0.5 text-xs font-semibold ${STATUS_LABELS[report.status].badge}`
                                  : "text-xs text-civic-muted"
                              }
                            >
                              {STATUS_LABELS[report.status]?.label ?? report.status}
                            </span>
                          </label>
                        </li>
                      ))}
                    </ul>
                    <Button type="submit" variant="primary">
                      <Plus className="h-4 w-4" aria-hidden="true" />
                      Add selected listings
                    </Button>
                  </form>
                </Card>
              ) : selectedBatch.status === "draft" && eligibleReports.length === 0 ? (
                <Card title="Add listings to batch">
                  <p className="text-sm text-civic-muted">
                    No eligible verified or in-progress listings available to add.
                  </p>
                </Card>
              ) : null}

              {/* Generate email body */}
              {selectedBatch.status === "draft" ? (
                <Card title="Email body" description="Generate the email body to review before sending.">
                  <form
                    action={async () => {
                      "use server";
                      await generateEmailBodyAction(selectedBatch.id);
                    }}
                    className="space-y-3"
                  >
                    <Button type="submit" variant="secondary">
                      <FileText className="h-4 w-4" aria-hidden="true" />
                      Generate email body
                    </Button>
                  </form>
                  {emailBody ? (
                    <Textarea
                      label="Generated email body (copy to clipboard)"
                      readOnly
                      value={emailBody}
                      className="mt-4 min-h-48 font-mono text-xs"
                    />
                  ) : null}
                </Card>
              ) : null}

              {/* Mark as Sent */}
              {selectedBatch.status === "draft" ? (
                <Card title="Mark batch as sent" description="Record that this batch was shared for review.">
                  <form
                    action={markBatchSentAction.bind(null, selectedBatch.id)}
                    className="space-y-3"
                  >
                    <Input
                      label="Sent to (email)"
                      name="sent_to"
                      type="email"
                      required
                      placeholder="partners@larilocal.in"
                    />
                    <Input
                      label="CC (optional)"
                      name="cc"
                      type="email"
                      placeholder="cc@example.com"
                    />
                    <Input
                      label="Subject"
                      name="subject"
                      placeholder="Lari Local Vendors — Week ..."
                    />
                    <Button type="submit" variant="primary">
                      <Send className="h-4 w-4" aria-hidden="true" />
                      Mark as sent
                    </Button>
                  </form>
                </Card>
              ) : null}

              {/* Export CSV */}
              <div className="flex items-center gap-3">
                <Button
                  href={`/admin/amc/export?batch=${selectedBatch.id}`}
                  variant="secondary"
                >
                  <FileText className="h-4 w-4" aria-hidden="true" />
                  Export CSV
                </Button>
              </div>
            </>
          ) : (
            <div className="flex min-h-64 items-center justify-center rounded-lg border border-dashed border-civic-line bg-civic-soft/80 p-8 text-center">
              <div>
                <Mail className="mx-auto h-10 w-10 text-civic-teal/40" aria-hidden="true" />
                <p className="mt-3 text-sm text-civic-muted">
                  Select a batch from the list, or create a new one.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </PageShell>
  );
}
