import { getCopy, issueLabel, type Locale } from "@/lib/i18n";
import type { LeaderboardRow } from "@/lib/supabase/types";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { Trophy } from "lucide-react";

export function LeaderboardTable({ rows, locale = "en" }: { rows: LeaderboardRow[]; locale?: Locale }) {
  const t = getCopy(locale);

  if (rows.length === 0) {
    return (
      <EmptyState
        icon={Trophy}
        title={t.leaderboard.awaitingFirst}
        description={t.leaderboard.awaitingFirstCopy}
        action={<Button href="/reports/new">{t.common.submitAnIssue}</Button>}
      />
    );
  }

  return (
    <>
      <div className="space-y-3 md:hidden">
        {rows.map((row) => (
          <article key={`${row.area}-${row.district}`} className="rounded-lg border border-civic-line bg-civic-soft/85 p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-black uppercase tracking-normal text-civic-amber">{t.leaderboard.rank} #{row.rank}</p>
                <h3 className="mt-2 text-lg font-black text-white">{row.area}</h3>
                <p className="text-sm text-civic-muted">{row.district}</p>
              </div>
              <span className="rounded-md bg-civic-ink px-3 py-1 text-sm font-black text-civic-teal">
                {row.open_count} {t.leaderboard.open}
              </span>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-lg border border-civic-line bg-civic-ink p-3">
                <p className="text-civic-muted">{t.home.topIssue}</p>
                <p className="mt-1 font-black text-white">{issueLabel(locale, row.top_issue_type)}</p>
              </div>
              <div className="rounded-lg border border-civic-line bg-civic-ink p-3">
                <p className="text-civic-muted">{t.common.resolved}</p>
                <p className="mt-1 font-black text-white">{row.resolved_count}</p>
              </div>
            </div>
          </article>
        ))}
      </div>
      <div className="hidden overflow-x-auto rounded-lg border border-civic-line bg-civic-soft/85 md:block">
      <table className="min-w-full divide-y divide-civic-line text-sm">
        <thead className="bg-civic-ink text-left text-xs uppercase tracking-normal text-civic-muted">
          <tr>
            <th className="px-4 py-3">{t.leaderboard.rank}</th>
            <th className="px-4 py-3">{t.leaderboard.areaDistrict}</th>
            <th className="px-4 py-3">{t.leaderboard.openIssues}</th>
            <th className="px-4 py-3">{t.leaderboard.topIssueType}</th>
            <th className="px-4 py-3">{t.common.resolved}</th>
            <th className="px-4 py-3">{t.leaderboard.latestReport}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-civic-line">
          {rows.map((row) => (
            <tr key={`${row.area}-${row.district}`} className="hover:bg-white/5">
              <td className="px-4 py-3 font-black text-white">#{row.rank}</td>
              <td className="px-4 py-3">
                <p className="font-black text-white">{row.area}</p>
                <p className="text-xs text-civic-muted">{row.district}</p>
              </td>
              <td className="px-4 py-3 text-white">{row.open_count}</td>
              <td className="px-4 py-3 text-civic-muted">
                {issueLabel(locale, row.top_issue_type)}
              </td>
              <td className="px-4 py-3 text-civic-muted">{row.resolved_count}</td>
              <td className="px-4 py-3 text-civic-muted">{t.leaderboard.latestActivity}</td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </>
  );
}
