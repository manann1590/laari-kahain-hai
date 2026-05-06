import type { Metadata } from "next";
import { Camera, CheckCircle2, Clock3, MapPinned, ShieldCheck } from "lucide-react";
import { submitPublicReportAction } from "@/app/reports/new/actions";
import { getRequestLocale } from "@/lib/i18n-server";
import { getCopy } from "@/lib/i18n";
import { PageShell } from "@/components/layout/PageShell";
import { PublicReportForm } from "@/components/reports/PublicReportForm";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "List Your Spot",
  description: "Submit a food spot listing with menu, phone, photo, and location for admin review.",
};

export default async function NewPublicReportPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;
  const locale = await getRequestLocale();
  const t = getCopy(locale);
  const submitted = params.submitted === "1";
  const submittedId = params.id;

  const guidance = [
    {
      icon: Camera,
      title: t.reportForm.guidance[0][0],
      description: t.reportForm.guidance[0][1],
    },
    {
      icon: MapPinned,
      title: t.reportForm.guidance[1][0],
      description: t.reportForm.guidance[1][1],
    },
    {
      icon: ShieldCheck,
      title: t.reportForm.guidance[2][0],
      description: t.reportForm.guidance[2][1],
    },
  ];

  return (
    <PageShell
      eyebrow={t.reportForm.pageEyebrow}
      title={t.reportForm.pageTitle}
      description={t.reportForm.pageDescription}
    >
      {submitted ? (
        <Card variant="success">
          <div className="flex flex-col items-start gap-4 sm:flex-row">
            <CheckCircle2 className="h-8 w-8 shrink-0 text-civic-teal" aria-hidden="true" />
            <div>
              <h2 className="text-xl font-black text-white">{t.reportForm.submittedTitle}</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-civic-muted">
                {t.reportForm.submittedCopy}
              </p>
              {submittedId ? (
                <div className="mt-4 inline-block rounded-lg border border-civic-teal/30 bg-civic-ink px-4 py-2">
                  <p className="text-xs font-black uppercase tracking-normal text-civic-muted">
                    {t.common.referenceId}
                  </p>
                  <p className="mt-0.5 font-mono text-sm font-black text-white">
                    {submittedId}
                  </p>
                </div>
              ) : null}
              <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                <Button href="/map" variant="secondary">
                  {t.common.publicMap}
                </Button>
                <Button href="/reports/new">{t.reportForm.submitAnother}</Button>
              </div>
            </div>
          </div>
        </Card>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[0.82fr_1.18fr]">
          <div className="space-y-4">
            <Card title={t.reportForm.beforeTitle}>
              <div className="space-y-4">
                {guidance.map((item) => (
                  <div key={item.title} className="flex gap-3">
                    <item.icon
                      className="mt-0.5 h-5 w-5 shrink-0 text-civic-teal"
                      aria-hidden="true"
                    />
                    <div>
                      <h2 className="font-black text-white">{item.title}</h2>
                      <p className="mt-1 text-sm leading-6 text-civic-muted">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
            <Card title={t.reportForm.whatNextTitle}>
              <div className="flex gap-3 text-sm leading-6 text-civic-muted">
                <Clock3
                  className="mt-0.5 h-5 w-5 shrink-0 text-civic-teal"
                  aria-hidden="true"
                />
                <p>
                  {t.reportForm.whatNextCopy}
                </p>
              </div>
            </Card>
          </div>
          <div>
            <PublicReportForm action={submitPublicReportAction} locale={locale} />
          </div>
        </div>
      )}
    </PageShell>
  );
}
