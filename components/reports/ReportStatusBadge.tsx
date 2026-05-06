import { STATUS_LABELS } from "@/lib/constants";
import { getCopy, type Locale } from "@/lib/i18n";
import type { ReportStatus } from "@/lib/supabase/types";
import { Badge } from "@/components/ui/Badge";

export function ReportStatusBadge({ status, locale = "en" }: { status: ReportStatus; locale?: Locale }) {
  const value = STATUS_LABELS[status] ?? STATUS_LABELS.pending;
  return <Badge className={value.badge}>{getCopy(locale).status[status] ?? getCopy(locale).status.pending}</Badge>;
}
