import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getPublicAmcBatches, getBatchReports } from "@/lib/data/amc";
import { getRequestLocale } from "@/lib/i18n-server";
import { getCopy, issueLabel } from "@/lib/i18n";
import { formatDate } from "@/lib/utils";
import { PageShell } from "@/components/layout/PageShell";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { IssueTypeBadge } from "@/components/reports/IssueTypeBadge";
import { Mail } from "lucide-react";

export const metadata: Metadata = {
  title: "Verified Drops — Lari Local",
  description:
    "Food vendor batches bundled for review and follow-up.",
};

export const revalidate = 300;

export default async function PublicAmcPage() {
  const locale = await getRequestLocale();
  const t = getCopy(locale);
  let batches: Awaited<ReturnType<typeof getPublicAmcBatches>> = [];
  try {
    batches = await getPublicAmcBatches();
  } catch {
    batches = [];
  }

  // For each batch, load top 3 reports
  const batchesWithReports = await Promise.all(
    batches.map(async (batch) => {
      const reports = await getBatchReports(batch.id).catch(() => []);
      return { batch, reports: reports.slice(0, 3), totalReports: batch.report_count };
    }),
  );

  return (
    <PageShell
      eyebrow={t.amcPage.eyebrow}
      title={t.amcPage.title}
      description={t.amcPage.description}
    >
      {batchesWithReports.length === 0 ? (
        <EmptyState
          icon={Mail}
          title={t.amcPage.emptyTitle}
          description={t.amcPage.emptyDescription}
        />
      ) : (
        <div className="space-y-6">
          {batchesWithReports.map(({ batch, reports, totalReports }) => (
            <Card key={batch.id} variant="default">
              <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs font-black uppercase tracking-normal text-civic-amber">
                    {t.amcPage.week} {formatDate(batch.week_start)} &ndash; {formatDate(batch.week_end)}
                  </p>
                  <h2 className="mt-1 text-xl font-black tracking-normal text-white">
                    {totalReports} {totalReports === 1 ? t.amcPage.reportSingular : t.amcPage.reportPlural} {t.amcPage.submitted}
                  </h2>
                  {batch.sent_at ? (
                    <p className="mt-0.5 text-sm text-civic-muted">
                      {t.amcPage.sentOn} {formatDate(batch.sent_at)}
                    </p>
                  ) : null}
                </div>
                <span className="inline-flex items-center gap-1.5 rounded-md bg-civic-green/10 px-3 py-1 text-xs font-black text-civic-green">
                  <Mail className="h-3.5 w-3.5" aria-hidden="true" />
                  {t.amcPage.submittedToAmc}
                </span>
              </div>

              {reports.length > 0 ? (
                <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {reports.map((report) => (
                    <li
                      key={report.id}
                      className="overflow-hidden rounded-lg border border-civic-line bg-civic-ink shadow-sm"
                    >
                      {report.image_url ? (
                        <div className="relative aspect-[4/3] bg-civic-soft">
                          <Image
                            src={report.image_url}
                            alt={issueLabel(locale, report.issue_type)}
                            fill
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <div className="aspect-[4/3] bg-civic-soft" />
                      )}
                      <div className="p-3">
                        <IssueTypeBadge issueType={report.issue_type} locale={locale} />
                        {report.tracking_id ? (
                          <p className="mt-1.5 font-mono text-xs font-semibold text-civic-muted">
                            {report.tracking_id}
                          </p>
                        ) : null}
                        <p className="mt-1 text-sm text-civic-muted">
                          {[report.area, report.district].filter(Boolean).join(", ") ||
                            t.amcPage.locationReview}
                        </p>
                        {report.menu_text || report.description ? (
                          <p className="mt-1 line-clamp-2 text-xs text-civic-muted">
                            {report.menu_text || report.description}
                          </p>
                        ) : null}
                      </div>
                    </li>
                  ))}
                </ul>
              ) : null}

              {totalReports > 3 ? (
                <p className="mt-3 text-sm text-civic-muted">
                  {t.amcPage.showing} 3 {t.amcPage.of} {totalReports} {t.amcPage.reportPlural}.{" "}
                  <Link
                    href={`/map?status=sent_to_amc`}
                    className="font-semibold text-civic-teal hover:underline"
                  >
                    {t.amcPage.viewAllMap}
                  </Link>
                </p>
              ) : null}
            </Card>
          ))}
        </div>
      )}
    </PageShell>
  );
}
