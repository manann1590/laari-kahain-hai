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
  ShieldCheck,
  Workflow,
} from "lucide-react";
import { FOOD_CATEGORIES } from "@/lib/constants";
import { getRequestLocale } from "@/lib/i18n-server";
import { getCopy, categoryLabel } from "@/lib/i18n";
import { appConfig } from "@/lib/config";
import { getPublicReportById } from "@/lib/data/reports";
import { formatDateTime, timeAgo, titleFromLocation } from "@/lib/utils";
import { googleMapsLink } from "@/lib/geo";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { ReportEvent } from "@/lib/supabase/types";
import { PageShell } from "@/components/layout/PageShell";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { CategoryBadge } from "@/components/reports/CategoryBadge";
import { ReportStatusBadge } from "@/components/reports/ReportStatusBadge";
import { PublicMapLoader } from "@/components/map/PublicMapLoader";

export const revalidate = 300;

async function getPublicReportEvents(reportId: string): Promise<ReportEvent[]> {
  const client = createServerSupabaseClient();
  const { data } = await client
    .from("vendor_events")
    .select("*")
    .eq("vendor_id", reportId)
    .order("created_at", { ascending: true });
  return (data || []) as ReportEvent[];
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
    title: `${report.title || FOOD_CATEGORIES[report.category].label} in ${report.area || report.city || "Ahmedabad"}`,
    description: report.menu_text || report.description || "Verified food vendor listing on FoodRadar.",
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

  const [report, events] = await Promise.all([
    getPublicReportById(id).catch(() => null),
    getPublicReportEvents(id).catch(() => [] as ReportEvent[]),
  ]);

  if (!report) notFound();

  const shareUrl = `${appConfig.siteUrl}/reports/${report.id}`;
  const whatsAppUrl = `https://wa.me/?text=${encodeURIComponent(`Find this on FoodRadar: ${shareUrl}`)}`;
  const vendorTel = report.vendor_phone ? `tel:${report.vendor_phone.replace(/[^\d+]/g, "")}` : "";
  const vendorWhatsappDigits = (report.vendor_whatsapp || report.vendor_phone || "").replace(/\D/g, "");
  const vendorWhatsappUrl = vendorWhatsappDigits ? `https://wa.me/${vendorWhatsappDigits}` : "";

  return (
    <PageShell
      eyebrow={t.reportDetail.eyebrow}
      title={report.title || categoryLabel(locale, report.category)}
      description={t.reportDetail.description}
      actions={
        <>
          {vendorTel ? (
            <Button href={vendorTel} className="w-full sm:w-auto">
              <Phone className="h-4 w-4" aria-hidden="true" />
              Call vendor
            </Button>
          ) : null}
          {vendorWhatsappUrl ? (
            <Button href={vendorWhatsappUrl} variant="success" className="w-full sm:w-auto">
              <MessageCircle className="h-4 w-4" aria-hidden="true" />
              WhatsApp vendor
            </Button>
          ) : null}
          <Button href={googleMapsLink(report.latitude, report.longitude)} variant="secondary" className="w-full sm:w-auto">
            <ExternalLink className="h-4 w-4" aria-hidden="true" />
            Get directions
          </Button>
        </>
      }
    >
      {justSubmitted ? (
        <Card variant="success" className="mb-6">
          <div className="flex flex-col items-start gap-4 sm:flex-row">
            <CheckCircle2 className="h-8 w-8 shrink-0 text-civic-teal" aria-hidden="true" />
            <div>
              <h2 className="text-xl font-black text-civic-text">{t.reportDetail.submittedSuccess}</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-civic-muted">
                {t.reportDetail.submittedSuccessCopy}
              </p>
            </div>
          </div>
        </Card>
      ) : null}

      {report.tracking_id ? (
        <div className="mb-6 flex min-w-0 items-center gap-3 rounded-lg border border-civic-line bg-white px-4 py-3 shadow-sm">
          <ClipboardCopy className="h-5 w-5 shrink-0 text-civic-teal" aria-hidden="true" />
          <div className="min-w-0 flex-1">
            <p className="text-xs font-black uppercase tracking-normal text-civic-muted">{t.common.trackingId}</p>
            <p className="mt-0.5 break-all font-mono text-base font-black text-civic-text">{report.tracking_id}</p>
          </div>
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="order-2 space-y-6 lg:order-1">
          <Card variant="elevated">
            <div className="flex flex-wrap gap-2">
              <CategoryBadge category={report.category} locale={locale} />
              <ReportStatusBadge status={report.status} locale={locale} />
              {report.price_range ? <Badge className="border-yellow-200 bg-yellow-100 text-civic-brown">{report.price_range}</Badge> : null}
            </div>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-lg border border-civic-line bg-civic-bg p-4">
                <p className="text-xs font-black uppercase tracking-normal text-civic-muted">{t.common.area}</p>
                <p className="mt-2 font-black text-civic-text">{titleFromLocation(report.area, report.district)}</p>
              </div>
              <div className="rounded-lg border border-civic-line bg-civic-bg p-4">
                <p className="text-xs font-black uppercase tracking-normal text-civic-muted">Hours</p>
                <p className="mt-2 font-black text-civic-text">{report.hours_text || "Ask vendor"}</p>
              </div>
              <div className="rounded-lg border border-civic-line bg-civic-bg p-4">
                <p className="text-xs font-black uppercase tracking-normal text-civic-muted">Phone</p>
                <p className="mt-2 font-black text-civic-text">{report.vendor_phone || "Not added"}</p>
              </div>
              <div className="rounded-lg border border-civic-line bg-civic-bg p-4">
                <p className="text-xs font-black uppercase tracking-normal text-civic-muted">Tags</p>
                <p className="mt-2 font-black text-civic-text">{report.cuisine_tags || categoryLabel(locale, report.category)}</p>
              </div>
              <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                <p className="text-xs font-black uppercase tracking-normal text-green-800">Trust</p>
                <p className="mt-2 font-black text-green-950">Verified listing</p>
              </div>
              <div className="rounded-lg border border-civic-line bg-civic-bg p-4">
                <p className="text-xs font-black uppercase tracking-normal text-civic-muted">Last updated</p>
                <p className="mt-2 font-black text-civic-text">{formatDateTime(report.updated_at)}</p>
              </div>
            </div>
          </Card>

          <Card title="Menu" className="menu-paper">
            {report.menu_image_url ? (
              report.menu_image_url.endsWith(".pdf") ? (
                <a
                  href={report.menu_image_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 rounded-lg border border-civic-line bg-white px-4 py-3 text-sm font-semibold text-civic-text hover:bg-civic-bg"
                >
                  <ExternalLink className="h-4 w-4 shrink-0 text-civic-teal" aria-hidden="true" />
                  Open menu PDF
                </a>
              ) : (
                <div className="overflow-hidden rounded-lg border border-civic-line">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={report.menu_image_url}
                    alt="Menu"
                    className="w-full object-contain"
                  />
                </div>
              )
            ) : null}
            {report.menu_text || report.description ? (
              <p className={`whitespace-pre-line leading-8 text-civic-text ${report.menu_image_url ? "mt-4" : ""}`}>
                {report.menu_text || report.description}
              </p>
            ) : !report.menu_image_url ? (
              <p className="text-civic-muted">{t.reportDetail.noDescription}</p>
            ) : null}
            {report.address_text ? (
              <p className="mt-4 rounded-lg border border-civic-line bg-civic-bg p-4 text-sm leading-6 text-civic-muted">
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

          <Card title={t.common.timeline}>
            <ol className="space-y-4 text-sm">
              <li className="flex gap-3">
                <CalendarDays className="mt-0.5 h-5 w-5 shrink-0 text-civic-teal" aria-hidden="true" />
                <div>
                  <p className="font-black text-civic-text">{t.reportDetail.submitted}</p>
                  <p className="text-civic-muted">{formatDateTime(report.created_at)}</p>
                </div>
              </li>
              {events.map((event) => (
                <li key={event.id} className="flex gap-3">
                  <Workflow className="mt-0.5 h-5 w-5 shrink-0 text-civic-teal" aria-hidden="true" />
                  <div className="min-w-0 flex-1">
                    <p className="font-black capitalize text-civic-text">
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
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-civic-leaf" aria-hidden="true" />
                  <div>
                    <p className="font-black text-civic-text">{t.reportDetail.verified}</p>
                    <p className="text-civic-muted">{formatDateTime(report.approved_at)}</p>
                  </div>
                </li>
              ) : null}
            </ol>
          </Card>

          <Card title={t.common.privacyNote} variant="success">
            <p className="flex gap-3 text-sm leading-6 text-civic-muted">
              <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-civic-teal" aria-hidden="true" />
              {t.reportDetail.privacyCopy}
            </p>
          </Card>

          <Card title={t.reportDetail.shareTitle}>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <p className="min-w-0 flex-1 break-all rounded-md bg-civic-soft px-3 py-2 text-sm text-civic-muted">
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

        <div className="order-1 space-y-6 lg:order-2">
          {report.image_url ? (
            <Card className="p-3">
              <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-civic-ink">
                <Image
                  src={report.image_url}
                  alt={categoryLabel(locale, report.category)}
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

      <div className="fixed inset-x-0 bottom-[calc(env(safe-area-inset-bottom)+4.6rem)] z-30 border-t border-civic-line bg-white/95 p-3 shadow-[0_-10px_30px_rgba(15,23,42,0.12)] backdrop-blur md:hidden">
        <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${vendorTel && vendorWhatsappUrl ? 3 : vendorTel || vendorWhatsappUrl ? 2 : 1}, minmax(0, 1fr))` }}>
          {vendorTel ? (
            <Button href={vendorTel} size="sm">
              <Phone className="h-4 w-4" aria-hidden="true" />
              Call
            </Button>
          ) : null}
          {vendorWhatsappUrl ? (
            <Button href={vendorWhatsappUrl} size="sm" variant="success">
              <MessageCircle className="h-4 w-4" aria-hidden="true" />
              WhatsApp
            </Button>
          ) : null}
          <Button href={googleMapsLink(report.latitude, report.longitude)} size="sm" variant="secondary">
            <ExternalLink className="h-4 w-4" aria-hidden="true" />
            Directions
          </Button>
        </div>
      </div>
    </PageShell>
  );
}
