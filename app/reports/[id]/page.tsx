import Image from "next/image";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  CheckCircle2,
  ClipboardCopy,
  ExternalLink,
  MessageCircle,
  Phone,
  ShieldCheck,
} from "lucide-react";
import { FOOD_CATEGORIES } from "@/lib/constants";
import { getRequestLocale } from "@/lib/i18n-server";
import { getCopy, categoryLabel } from "@/lib/i18n";
import { appConfig } from "@/lib/config";
import { getPublicReportById } from "@/lib/data/reports";
import { titleFromLocation } from "@/lib/utils";
import { googleMapsLink } from "@/lib/geo";
import { PageShell } from "@/components/layout/PageShell";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { CategoryBadge } from "@/components/reports/CategoryBadge";
import { ReportStatusBadge } from "@/components/reports/ReportStatusBadge";
import { PublicMapLoader } from "@/components/map/PublicMapLoader";

export const revalidate = 300;


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

  const report = await getPublicReportById(id).catch(() => null);

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


      <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="space-y-6">
          <Card variant="elevated">
            <div className="flex flex-wrap gap-2">
              <CategoryBadge category={report.category} locale={locale} />
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
                <p className="mt-2 font-black text-white">{report.cuisine_tags || categoryLabel(locale, report.category)}</p>
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
                  className="flex items-center gap-2 rounded-lg border border-civic-line bg-civic-ink px-4 py-3 text-sm font-semibold text-white hover:bg-white/5"
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
              <p className={`whitespace-pre-line leading-8 text-white ${report.menu_image_url ? "mt-4" : ""}`}>
                {report.menu_text || report.description}
              </p>
            ) : !report.menu_image_url ? (
              <p className="text-civic-muted">{t.reportDetail.noDescription}</p>
            ) : null}
            {report.address_text ? (
              <p className="mt-4 rounded-lg border border-civic-line bg-civic-ink p-4 text-sm leading-6 text-civic-muted">
                {report.address_text}
              </p>
            ) : null}
          </Card>

          <Card title="Contact vendor">
            <div className="flex flex-wrap gap-2">
              {vendorTel ? (
                <Button href={vendorTel}>
                  <Phone className="h-4 w-4" aria-hidden="true" />
                  Call
                </Button>
              ) : null}
              {vendorWhatsappUrl ? (
                <Button href={vendorWhatsappUrl} variant="success">
                  <MessageCircle className="h-4 w-4" aria-hidden="true" />
                  WhatsApp
                </Button>
              ) : null}
              <Button href={googleMapsLink(report.latitude, report.longitude)} variant="secondary">
                <ExternalLink className="h-4 w-4" aria-hidden="true" />
                Directions
              </Button>
            </div>
          </Card>


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
    </PageShell>
  );
}
