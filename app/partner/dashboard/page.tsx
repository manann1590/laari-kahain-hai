import type { Metadata } from "next";
import { CheckCircle2, Clock3, LogOut, MapPinned, ShieldCheck } from "lucide-react";
import { createPartnerListingAction, logoutPartnerAction } from "@/app/partner/actions";
import { getPartnerReports } from "@/lib/data/reports";
import { requirePartner } from "@/lib/data/partners";
import { formatDate, titleFromLocation } from "@/lib/utils";
import { PageShell } from "@/components/layout/PageShell";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { PublicReportForm } from "@/components/reports/PublicReportForm";
import { CategoryBadge } from "@/components/reports/CategoryBadge";
import { ReportStatusBadge } from "@/components/reports/ReportStatusBadge";

export const metadata: Metadata = {
  title: "Partner Dashboard",
};

export default async function PartnerDashboardPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const partner = await requirePartner();
  const params = await searchParams;
  const submitted = params.submitted === "1";
  const setup = params.setup === "1";
  const reports = await getPartnerReports(partner.id);
  const hasListing = reports.length > 0;

  return (
    <PageShell
      eyebrow="Partner dashboard"
      title={partner.business_name}
      description="Manage your FoodRadar partner account and submit your verified food spot for admin review."
      actions={
        <form action={logoutPartnerAction} className="w-full sm:w-auto">
          <Button type="submit" variant="secondary" className="w-full sm:w-auto">
            <LogOut className="h-4 w-4" aria-hidden="true" />
            Logout
          </Button>
        </form>
      }
    >
      <div className="space-y-6">
        {setup ? (
          <Card variant="success">
            <div className="flex gap-3">
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-civic-leaf" aria-hidden="true" />
              <p className="text-sm leading-6 text-civic-text">
                Partner account activated. You can now list your food spot.
              </p>
            </div>
          </Card>
        ) : null}
        {submitted ? (
          <Card variant="success">
            <div className="flex gap-3">
              <Clock3 className="mt-0.5 h-5 w-5 shrink-0 text-civic-amber" aria-hidden="true" />
              <p className="text-sm leading-6 text-civic-text">
                Listing submitted. It is pending admin review and will appear publicly after approval.
              </p>
            </div>
          </Card>
        ) : null}

        <div className="grid gap-4 md:grid-cols-3">
          <Card title="Account status">
            <div className="flex items-center gap-2 text-sm font-black text-green-800">
              <ShieldCheck className="h-4 w-4" aria-hidden="true" />
              Active partner
            </div>
            <p className="mt-2 text-sm leading-6 text-civic-muted">
              Approved partners are the only users who can submit vendor listings.
            </p>
          </Card>
          <Card title="Base location">
            <p className="font-black text-civic-text">{titleFromLocation(partner.area, partner.district)}</p>
            <p className="mt-2 text-sm leading-6 text-civic-muted">{partner.address_text || "No landmark added."}</p>
          </Card>
          <Card title="Public visibility">
            <p className="font-black text-civic-text">{hasListing ? "Review in progress" : "Not listed yet"}</p>
            <p className="mt-2 text-sm leading-6 text-civic-muted">
              Admin approval is required before customers can see a listing.
            </p>
          </Card>
        </div>

        {hasListing ? (
          <Card title="Your listing" description="Only admin-approved listings appear on the public map.">
            <div className="space-y-3">
              {reports.map((report) => (
                <article key={report.id} className="rounded-lg border border-civic-line bg-civic-bg p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap gap-2">
                        <CategoryBadge category={report.category} />
                        <ReportStatusBadge status={report.status} />
                      </div>
                      <h2 className="mt-3 font-black text-civic-text">{report.title || partner.business_name}</h2>
                      <p className="mt-1 text-sm text-civic-muted">{titleFromLocation(report.area, report.district)}</p>
                      <p className="mt-1 text-xs text-civic-muted">Submitted {formatDate(report.created_at)}</p>
                    </div>
                    {report.status === "approved" || report.status === "verified" ? (
                      <Button href={`/reports/${report.id}`} className="w-full sm:w-auto">
                        View public listing
                      </Button>
                    ) : null}
                  </div>
                </article>
              ))}
            </div>
          </Card>
        ) : (
          <Card
            variant="elevated"
            title="List your food spot"
            description="Add your menu, phone, camera photo, and exact location. The admin team reviews it before publishing."
          >
            <PublicReportForm action={createPartnerListingAction} locale="en" />
          </Card>
        )}

        {!hasListing ? null : (
          <EmptyState
            icon={MapPinned}
            title="Need to change listing details?"
            description="For this v1, submit changes through admin support so the public map stays reviewed and consistent."
            action={<Button href="/partner">Partner support</Button>}
          />
        )}
      </div>
    </PageShell>
  );
}
