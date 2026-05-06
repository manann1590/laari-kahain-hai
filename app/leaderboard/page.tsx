import type { Metadata } from "next";
import { BarChart3, Info, Trophy } from "lucide-react";
import { getRequestLocale } from "@/lib/i18n-server";
import { getCopy, issueLabel } from "@/lib/i18n";
import { getIssueTypeCounts, getLeaderboard, getPublicDashboardStats } from "@/lib/data/reports";
import { PageShell } from "@/components/layout/PageShell";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { StatsCards } from "@/components/leaderboard/StatsCards";
import { LeaderboardTable } from "@/components/leaderboard/LeaderboardTable";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Leaderboard",
};

export const revalidate = 300;

export default async function LeaderboardPage() {
  const locale = await getRequestLocale();
  const t = getCopy(locale);
  let data:
    | {
        stats: Awaited<ReturnType<typeof getPublicDashboardStats>>;
        rows: Awaited<ReturnType<typeof getLeaderboard>>;
        issueCounts: Awaited<ReturnType<typeof getIssueTypeCounts>>;
      }
    | null = null;
  let errorMessage = "";

  try {
    const [stats, rows, issueCounts] = await Promise.all([
      getPublicDashboardStats(),
      getLeaderboard(),
      getIssueTypeCounts(),
    ]);
    data = { stats, rows, issueCounts };
  } catch (error) {
    errorMessage = error instanceof Error ? error.message : "Could not load leaderboard.";
  }

  return (
    <PageShell
      eyebrow={t.common.leaderboard}
      title={t.leaderboard.title}
      description={t.leaderboard.description}
      actions={<Button href="/reports/new">{t.common.submitAnIssue}</Button>}
    >
      {errorMessage || !data ? (
        <EmptyState title={t.leaderboard.unavailable} description={errorMessage} />
      ) : (
        <div className="space-y-6">
          <StatsCards stats={data.stats} showPending={false} locale={locale} />
          <Card title={t.leaderboard.areaRanking} description={t.leaderboard.areaRankingCopy}>
            <LeaderboardTable rows={data.rows} locale={locale} />
          </Card>
          <Card title={t.leaderboard.issueBreakdown} description={t.leaderboard.issueBreakdownCopy}>
            {data.issueCounts.length === 0 ? (
              <EmptyState
                icon={BarChart3}
                title={t.leaderboard.noReports}
                description={t.leaderboard.noReportsCopy}
                action={<Button href="/reports/new">{t.common.submitAnIssue}</Button>}
              />
            ) : (
              <div className="space-y-4">
                {data.issueCounts.map((row) => {
                  const max = Math.max(...data.issueCounts.map((item) => item.count));
                  const width = `${Math.max(8, Math.round((row.count / max) * 100))}%`;
                  return (
                    <div key={row.issue_type}>
                      <div className="mb-2 flex items-center justify-between gap-3 text-sm">
                        <span className="font-black text-white">{issueLabel(locale, row.issue_type)}</span>
                        <span className="font-semibold text-civic-teal">{row.count}</span>
                      </div>
              <div className="h-3 overflow-hidden rounded-md bg-civic-ink">
                <div className="h-full rounded-md bg-civic-teal" style={{ width }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
          <div className="grid gap-4 lg:grid-cols-[1fr_auto]">
            <Card variant="warning">
              <div className="flex gap-3 text-sm leading-6 text-civic-amber">
                <Info className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
                <p>
                  {t.leaderboard.warning}
                </p>
              </div>
            </Card>
            <Card variant="elevated" className="lg:w-80">
              <Trophy className="h-7 w-7 text-civic-amber" aria-hidden="true" />
              <h2 className="mt-3 text-lg font-black text-white">{t.leaderboard.improve}</h2>
              <p className="mt-2 text-sm leading-6 text-civic-muted">{t.leaderboard.improveCopy}</p>
              <Button href="/reports/new" className="mt-4 w-full">
                {t.common.submitAnIssue}
              </Button>
            </Card>
          </div>
        </div>
      )}
    </PageShell>
  );
}
