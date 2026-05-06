import { AlertCircle, CheckCircle2, Clock3, TrendingUp } from "lucide-react";
import { getCopy, type Locale } from "@/lib/i18n";
import type { DashboardStats } from "@/lib/supabase/types";
import { StatCard } from "@/components/ui/StatCard";

const cards = [
  { key: "totalApproved", label: "Verified Vendors", icon: CheckCircle2, tone: "green", helper: "Public listings after admin review." },
  { key: "pending", label: "Pending Review", icon: Clock3, tone: "amber", helper: "Needs moderation before publishing." },
  { key: "resolved", label: "Closed Listings", icon: AlertCircle, tone: "blue", helper: "Visible public listing status." },
  { key: "reportsThisWeek", label: "New This Week", icon: TrendingUp, tone: "orange", helper: "Recent food-map activity." },
] as const;

export function StatsCards({
  stats,
  showPending = true,
  locale = "en",
}: {
  stats: DashboardStats;
  showPending?: boolean;
  locale?: Locale;
}) {
  const t = getCopy(locale);
  const visibleCards = showPending
    ? cards
    : cards.filter((card) => card.key !== "pending");

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {visibleCards.map((card) => (
        <StatCard
          key={card.key}
          icon={card.icon}
          value={stats[card.key] || (card.key === "totalApproved" ? t.home.awaitingFirst : 0)}
          label={t.leaderboard.stats[card.key][0]}
          helperText={stats[card.key] ? t.leaderboard.stats[card.key][1] : t.leaderboard.stats[card.key][2]}
          tone={card.tone}
        />
      ))}
    </div>
  );
}
