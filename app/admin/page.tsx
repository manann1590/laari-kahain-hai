import type { Metadata } from "next";
import { AlertTriangle, LogOut, Plus } from "lucide-react";
import { requireAdmin } from "@/lib/data/admin";
import { getAdminReports, getDashboardStats } from "@/lib/data/reports";
import { normalizeFoodCategory, normalizeStatus } from "@/lib/validators/report";
import { logoutAction } from "@/app/admin/actions";
import { PageShell } from "@/components/layout/PageShell";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
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
    data = { reports, stats };
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
          <Button href="/admin/reports/new">
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add vendor
          </Button>
          <form action={logoutAction}>
            <Button type="submit" variant="secondary">
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
          <StatsCards stats={data.stats} />
          {data.stats.pending > 0 ? (
            <div className="rounded-lg border border-civic-amber/35 bg-civic-amber/10 p-5 shadow-sm">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex gap-3">
                  <AlertTriangle className="mt-1 h-6 w-6 shrink-0 text-civic-amber" aria-hidden="true" />
                  <div>
                    <p className="font-black text-white">{data.stats.pending} listings need review</p>
                    <p className="mt-1 text-sm leading-6 text-civic-amber">
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
