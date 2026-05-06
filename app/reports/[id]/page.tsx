import Image from "next/image";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  CalendarDays,
  CheckCircle2,
  ClipboardCopy,
  ExternalLink,
  MessageCircle,
  Phone,
  RefreshCw,
  Send,
  ShieldCheck,
  Workflow,
} from "lucide-react";
import { ISSUE_TYPES } from "@/lib/constants";
import { getRequestLocale } from "@/lib/i18n-server";
import { getCopy, issueLabel } from "@/lib/i18n";
import { appConfig } from "@/lib/config";
import { getPublicReportById } from "@/lib/data/reports";
import { formatDate, formatDateTime, timeAgo, titleFromLocation } from "@/lib/utils";
import { googleMapsLink } from "@/lib/geo";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { AmcEmailBatch, ReportEvent } from "@/lib/supabase/types";
import { PageShell } from "@/components/layout/PageShell";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { IssueTypeBadge } from "@/components/reports/IssueTypeBadge";
import { ReportStatusBadge } from "@/components/reports/ReportStatusBadge";
import { PublicMapLoader } from "@/components/map/PublicMapLoader";
import { ReopenForm } from "@/components/reports/ReopenForm";
import { citizenConfirmResolvedAction } from "@/app/reports/[id]/actions";

export const revalidate = 300;

async function getPublicReportEvents(reportId: string): Promise<ReportEvent[]> {
  const client = createServerSupabaseClient();
  const { data } = await client
    .from("report_events")
    .select("*")
    .eq("report_id", reportId)
    .order("created_at", { ascending: true });
  return (data || []) as ReportEvent[];
}

async function getAmcBatchForReport(reportId: string): Promise<AmcEmailBatch | null> {
  const client = createServerSupabaseClient();
  const { data: batchReport } = await client
    .from("amc_email_batch_reports")
    .select("batch_id")
    .eq("report_id", reportId)
    .maybeSingle();

  if (!batchReport) return null;

  const { data: batch } = await client
    .from("amc_email_batches")
    .select("*")
    .eq("id", batchReport.batch_id)
    .eq("status", "sent")
    .maybeSingle();

  return batch as AmcEmailBatch | null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const report = await getPublicReportById(id).catch(() => null);
  if (!report) return { title: "Vendor not found" };
  return {
    title: `${report.title || ISSUE_TYPES[report.issue_type].label} in ${report.area || report.city || "Ahmedabad"}`,
    description: report.menu_text || report.description || "Verified food vendor listing on Lari Local.",
  };
}

export default async function ReportDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const { id } = await params;
  const locale = await getRequestLocale();
  const t = getCopy(locale);
  const resolvedSearchParams = await searchParams;
  const justSubmitted = resolvedSearchParams.submitted === "1";

  const [report, events, amcBatch] = await Promise.all([
    getPublicReportById(id).catch(() => null),
    getPublicReportEvents(id).catch(() => [] as ReportEvent[]),
    getAmcBatchForReport(id).catch(() => null),
  ]);

  if (!report) notFound();

  const shareUrl = `${appConfig.siteUrl}/reports/${report.id}`;
  const whatsAppUrl = `https://wa.me/?text=${encodeURIComponent(`Food vendor on Lari Local: ${shareUrl}`)}`;
  const vendorTel = report.vendor_phone ? `tel:${report.vendor_phone.replace(/[^\d+]/g, "")}` : "";
  const vendorWhatsappDigits = (report.vendor_whatsapp || report.vendor_phone || "").replace(/\D/g, "");
  const vendorWhatsappUrl = vendorWhatsappDigits ? `https://wa.me/${vendorWhatsappDigits}` : "";

  const canReopen =
    report.status === "resolved_claimed" || report.status === "citizen_verified_resolved";
  const canConfirmResolved = report.status === "resolved_claimed";

  return (
    <PageShell
      eyebrow={t.reportDetail.eyebrow}
      title={report.title || issueLabel(locale, report.issue_type)}
      description={t.reportDetail.description}
      actions={
        <>
          {vendorTel ? (
            <Button href={vendorTel}>
              <Phone className="h-4 w-4" aria-hidden="true" />
              Call vendor
            </Button>
          ) : null}
          <Button href={googleMapsLink(report.latitude, report.longitude)} variant="secondary">
            <ExternalLink className="h-4 w-4" aria-hidden="true" />
            {t.reportDetail.openLocation}
          </Button>
        </>
      }
    >
      {justSubmitted ? (
        <Card variant="success" className="mb-6">
          <div className="flex flex-col items-start gap-4 sm:flex-row">
            <CheckCircle2 className="h-8 w-8 shrink-0 text-civic-teal" aria-hidden="true" />
            <div>
              <h2 className="text-xl font-black text-white">{t.reportDetail.submittedSuccess}</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-civic-muted">
                {t.reportDetail.submittedSuccessCopy}
              </p>
            </div>
          </div>
        </Card>
      ) : null}

      {/* Tracking ID box */}
      {report.tracking_id ? (
        <div className="mb-6 flex items-center gap-3 rounded-lg border border-civic-line bg-civic-soft px-4 py-3">
          <ClipboardCopy className="h-5 w-5 shrink-0 text-civic-teal" aria-hidden="true" />
          <div className="min-w-0 flex-1">
            <p className="text-xs font-black uppercase tracking-normal text-civic-muted">{t.common.trackingId}</p>
            <p className="mt-0.5 font-mono text-base font-black text-white">{report.tracking_id}</p>
          </div>
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="space-y-6">
          <Card variant="elevated">
            <div className="flex flex-wrap gap-2">
              <IssueTypeBadge issueType={report.issue_type} locale={locale} />
              <ReportStatusBadge status={report.status} locale={locale} />
              {report.price_range ? <Badge className="border-amber-200 bg-amber-100 text-amber-950">{report.price_range}</Badge> : null}
            </div>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-lg border border-civic-line bg-civic-ink p-4">
                <p className="text-xs font-black uppercase tracking-normal text-civic-muted">{t.common.area}</p>
                <p className="mt-2 font-black text-white">{titleFromLocation(report.area, report.district)}</p>
              </div>
              <div className="rounded-lg border border-civic-line bg-civic-ink p-4">
                <p className="text-xs font-black uppercase tracking-normal text-civic-muted">Hours</p>
                <p className="mt-2 font-black text-white">{report.hours_text || "Ask vendor"}</p>
              </div>
              <div className="rounded-lg border border-civic-line bg-civic-ink p-4">
                <p className="text-xs font-black uppercase tracking-normal text-civic-muted">Phone</p>
                <p className="mt-2 font-black text-white">{report.vendor_phone || "Not added"}</p>
              </div>
              <div className="rounded-lg border border-civic-line bg-civic-ink p-4">
                <p className="text-xs font-black uppercase tracking-normal text-civic-muted">Tags</p>
                <p className="mt-2 font-black text-white">{report.cuisine_tags || issueLabel(locale, report.issue_type)}</p>
              </div>
            </div>
          </Card>

          <Card title="Menu" className="menu-paper">
            {report.menu_text || report.description ? (
            <p className="whitespace-pre-line leading-8 text-white">{report.menu_text || report.description}</p>
            ) : (
              <p className="text-civic-muted">{t.reportDetail.noDescription}</p>
            )}
            {report.address_text ? (
              <p className="mt-4 rounded-lg border border-civic-line bg-civic-ink p-4 text-sm leading-6 text-civic-muted">
                {report.address_text}
              </p>
            ) : null}
          </Card>

          <Card title="Contact vendor">
            <div className="grid gap-3 sm:grid-cols-2">
              {vendorTel ? (
                <Button href={vendorTel} className="w-full">
                  <Phone className="h-4 w-4" aria-hidden="true" />
                  Call {report.vendor_phone}
                </Button>
              ) : null}
              {vendorWhatsappUrl ? (
                <Button href={vendorWhatsappUrl} variant="success" className="w-full">
                  <MessageCircle className="h-4 w-4" aria-hidden="true" />
                  WhatsApp vendor
                </Button>
              ) : null}
              <Button href={googleMapsLink(report.latitude, report.longitude)} variant="secondary" className="w-full">
                <ExternalLink className="h-4 w-4" aria-hidden="true" />
                Get directions
              </Button>
            </div>
          </Card>

          {/* Full public timeline */}
          <Card title={t.common.timeline}>
            <ol className="space-y-4 text-sm">
              <li className="flex gap-3">
                <CalendarDays className="mt-0.5 h-5 w-5 shrink-0 text-civic-teal" aria-hidden="true" />
                <div>
                  <p className="font-black text-white">{t.reportDetail.submitted}</p>
                  <p className="text-civic-muted">{formatDateTime(report.created_at)}</p>
                </div>
              </li>
              {events.map((event) => (
                <li key={event.id} className="flex gap-3">
                  <Workflow className="mt-0.5 h-5 w-5 shrink-0 text-civic-teal" aria-hidden="true" />
                  <div className="min-w-0 flex-1">
                    <p className="font-black capitalize text-white">
                      {event.event_type.replace(/_/g, " ")}
                    </p>
                    {event.note ? (
                      <p className="mt-0.5 text-civic-muted">{event.note}</p>
                    ) : null}
                    {event.proof_image_url ? (
                      <div className="mt-2 overflow-hidden rounded-lg border border-civic-line">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={event.proof_image_url}
                          alt={t.reportDetail.proofImage}
                          className="h-32 w-full object-cover"
                        />
                      </div>
                    ) : null}
                    <p className="mt-1 text-xs text-civic-muted">{timeAgo(event.created_at)}</p>
                  </div>
                </li>
              ))}
              {report.approved_at ? (
                <li className="flex gap-3">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" aria-hidden="true" />
                  <div>
                    <p className="font-black text-white">{t.reportDetail.verified}</p>
                    <p className="text-civic-muted">{formatDateTime(report.approved_at)}</p>
                  </div>
                </li>
              ) : null}
              {report.resolved_claimed_at ? (
                <li className="flex gap-3">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-teal-600" aria-hidden="true" />
                  <div>
                    <p className="font-black text-white">{t.reportDetail.resolvedClaimed}</p>
                    <p className="text-civic-muted">{formatDateTime(report.resolved_claimed_at)}</p>
                  </div>
                </li>
              ) : null}
              {report.citizen_verified_at ? (
                <li className="flex gap-3">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" aria-hidden="true" />
                  <div>
                    <p className="font-black text-white">{t.reportDetail.citizenVerifiedResolved}</p>
                    <p className="text-civic-muted">{formatDateTime(report.citizen_verified_at)}</p>
                  </div>
                </li>
              ) : null}
              {report.reopened_at ? (
                <li className="flex gap-3">
                  <RefreshCw className="mt-0.5 h-5 w-5 shrink-0 text-orange-600" aria-hidden="true" />
                  <div>
                    <p className="font-black text-white">{t.reportDetail.reopened}</p>
                    <p className="text-civic-muted">{formatDateTime(report.reopened_at)}</p>
                  </div>
                </li>
              ) : null}
              {report.resolved_at ? (
                <li className="flex gap-3">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" aria-hidden="true" />
                  <div>
                    <p className="font-black text-white">{t.common.resolved}</p>
                    <p className="text-civic-muted">{formatDateTime(report.resolved_at)}</p>
                  </div>
                </li>
              ) : null}
            </ol>
          </Card>

          {/* Export batch status */}
          <Card title={t.reportDetail.amcStatus}>
            {amcBatch ? (
              <div className="flex items-start gap-3 text-sm leading-6">
                <Send className="mt-0.5 h-5 w-5 shrink-0 text-indigo-600" aria-hidden="true" />
                <p className="text-white">
                  {t.reportDetail.includedAmc} — {t.reportDetail.sentOn}{" "}
                  <span className="font-semibold">{formatDate(amcBatch.sent_at)}</span>.
                </p>
              </div>
            ) : (
              <p className="text-sm text-civic-muted">{t.reportDetail.notIncludedAmc}</p>
            )}
          </Card>

          {/* Citizen confirm resolved */}
          {canConfirmResolved ? (
            <Card title={t.reportDetail.confirmResolved} variant="success">
              <p className="mb-4 text-sm leading-6 text-civic-muted">
                {t.reportDetail.confirmResolvedCopy}
              </p>
              <form action={citizenConfirmResolvedAction}>
                <input type="hidden" name="id" value={report.id} />
                <button
                  type="submit"
                  className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-civic-green px-4 text-sm font-black uppercase tracking-normal text-civic-ink shadow-sm transition hover:bg-[#d7ff76] focus:outline-none focus:ring-2 focus:ring-civic-green focus:ring-offset-2 focus:ring-offset-civic-ink"
                >
                  <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                  {t.reportDetail.yesResolved}
                </button>
              </form>
            </Card>
          ) : null}

          {/* Reopen section */}
          {canReopen ? (
            <ReopenForm reportId={report.id} locale={locale} />
          ) : null}

          <Card title={t.common.privacyNote} variant="success">
            <p className="flex gap-3 text-sm leading-6 text-civic-muted">
              <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-civic-teal" aria-hidden="true" />
              {t.reportDetail.privacyCopy}
            </p>
          </Card>

          <Card title={t.reportDetail.shareTitle}>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <p className="min-w-0 flex-1 truncate rounded-md bg-civic-soft px-3 py-2 text-sm text-civic-muted">
                {shareUrl}
              </p>
              <Button href={shareUrl} variant="secondary">
                <ClipboardCopy className="h-4 w-4" aria-hidden="true" />
                {t.common.open}
              </Button>
              <Button href={whatsAppUrl} variant="success">
                <MessageCircle className="h-4 w-4" aria-hidden="true" />
                {t.common.whatsapp}
              </Button>
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          {report.image_url ? (
            <Card className="p-3">
              <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-civic-ink">
                <Image
                  src={report.image_url}
                  alt={issueLabel(locale, report.issue_type)}
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                />
              </div>
              <p className="mt-3 text-xs leading-5 text-civic-muted">
                {t.reportDetail.imageSafety}
              </p>
            </Card>
          ) : null}
          <Card
            title={t.common.location}
            description={report.address_text || titleFromLocation(report.area, report.district)}
            className="p-3"
          >
            <PublicMapLoader reports={[report]} heightClass="h-80 min-h-80" locale={locale} />
          </Card>
        </div>
      </div>
    </PageShell>
  );
}
