import type { Metadata } from "next";
import { AlertTriangle, Check, Copy, LogOut, Plus, Store, X } from "lucide-react";
import { requireAdmin } from "@/lib/data/admin";
import { getAdminReports, getDashboardStats } from "@/lib/data/reports";
import { getPartnerRequests } from "@/lib/data/partners";
import { normalizeFoodCategory, normalizeStatus } from "@/lib/validators/report";
import {
  approvePartnerRequestAction,
  logoutAction,
  rejectPartnerRequestAction,
} from "@/app/admin/actions";
import { PageShell } from "@/components/layout/PageShell";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { StatsCards } from "@/components/leaderboard/StatsCards";
import { AdminFilters } from "@/components/admin/AdminFilters";
import { AdminReportTable } from "@/components/admin/AdminReportTable";

export const metadata: Metadata = {
  title: "Admin Dashboard",
};

export default async function AdminDashboardPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  await requireAdmin();
  const params = await searchParams;
  const status = normalizeStatus(params.status);
  const category = normalizeFoodCategory(params.category);
  const search = params.search?.trim();

  let data:
    | {
        reports: Awaited<ReturnType<typeof getAdminReports>>;
        stats: Awaited<ReturnType<typeof getDashboardStats>>;
        partners: Awaited<ReturnType<typeof getPartnerRequests>>;
      }
    | null = null;
  let errorMessage = "";

  try {
    const [reports, stats] = await Promise.all([
      getAdminReports({
        status: status || "all",
        category: category || "all",
        search,
      }),
      getDashboardStats(),
    ]);
    const partners = await getPartnerRequests("all");
    data = { reports, stats, partners };
  } catch (error) {
    errorMessage = error instanceof Error ? error.message : "Could not load admin dashboard.";
  }

  return (
    <PageShell
      eyebrow="Admin"
      title="Admin dashboard"
      description="Review incoming vendor listings before they become public. Approve only clear, location-backed food spots."
      actions={
        <>
          <Button href="/admin/reports/new" className="w-full sm:w-auto">
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add vendor
          </Button>
          <form action={logoutAction} className="w-full sm:w-auto">
            <Button type="submit" variant="secondary" className="w-full sm:w-auto">
              <LogOut className="h-4 w-4" aria-hidden="true" />
              Logout
            </Button>
          </form>
        </>
      }
    >
      {errorMessage || !data ? (
        <EmptyState title="Admin data is not available" description={errorMessage} />
      ) : (
        <div className="space-y-6">
          {params.setup ? (
            <Card variant="success">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="font-black text-civic-text">
                    Partner approved{params.partnerApproved ? `: ${params.partnerApproved}` : ""}
                  </p>
                  <p className="mt-1 break-all text-sm leading-6 text-civic-muted">
                    Share this setup link with the partner: {params.setup}
                  </p>
                </div>
                <Button href={params.setup} variant="secondary" className="w-full sm:w-auto">
                  <Copy className="h-4 w-4" aria-hidden="true" />
                  Open setup
                </Button>
              </div>
            </Card>
          ) : null}

          <StatsCards stats={data.stats} />

          <Card
            title="Partner onboarding"
            description="Approve partners before they can create vendor listings from /partner."
          >
            {data.partners.length === 0 ? (
              <p className="text-sm text-civic-muted">No partner requests yet.</p>
            ) : (
              <div className="space-y-3">
                {data.partners.map((partner) => (
                  <article key={partner.id} className="rounded-lg border border-civic-line bg-civic-bg p-4">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="inline-flex items-center gap-1 rounded-full border border-civic-line bg-white px-3 py-1 text-xs font-bold text-civic-text">
                            <Store className="h-3.5 w-3.5" aria-hidden="true" />
                            {partner.status}
                          </span>
                        </div>
                        <h2 className="mt-3 font-black text-civic-text">{partner.business_name}</h2>
                        <p className="mt-1 text-sm text-civic-muted">
                          {[partner.owner_name, partner.area, partner.district].filter(Boolean).join(" · ") || "Location not added"}
                        </p>
                        {partner.address_text ? (
                          <p className="mt-1 text-sm leading-6 text-civic-muted">{partner.address_text}</p>
                        ) : null}
                      </div>

                      {partner.status === "pending" ? (
                        <div className="grid gap-2 sm:min-w-72">
                          <form action={approvePartnerRequestAction.bind(null, partner.id)}>
                            <Button type="submit" variant="success" className="w-full">
                              <Check className="h-4 w-4" aria-hidden="true" />
                              Approve partner
                            </Button>
                          </form>
                          <form action={rejectPartnerRequestAction.bind(null, partner.id)} className="grid gap-2">
                            <Input label="Rejection note" name="rejection_note" placeholder="Optional admin note" />
                            <Button type="submit" variant="danger" className="w-full">
                              <X className="h-4 w-4" aria-hidden="true" />
                              Reject
                            </Button>
                          </form>
                        </div>
                      ) : null}
                    </div>
                  </article>
                ))}
              </div>
            )}
          </Card>

          {data.stats.pending > 0 ? (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-5 shadow-sm">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex gap-3">
                  <AlertTriangle className="mt-1 h-6 w-6 shrink-0 text-civic-amber" aria-hidden="true" />
                  <div>
                    <p className="font-black text-civic-text">{data.stats.pending} listings need review</p>
                    <p className="mt-1 text-sm leading-6 text-amber-800">
                      Pending vendor listings are hidden publicly until moderation is complete.
                    </p>
                  </div>
                </div>
                <Button href="/admin?status=pending" variant="secondary" className="w-full sm:w-auto">
                  View pending
                </Button>
              </div>
            </div>
          ) : null}
          <AdminFilters status={status} category={category} search={search} />
          <AdminReportTable reports={data.reports} />
        </div>
      )}
    </PageShell>
  );
}
