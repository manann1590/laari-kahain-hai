import { ISSUE_TYPES } from "@/lib/constants";
import { issueLabel, type Locale } from "@/lib/i18n";
import type { IssueType } from "@/lib/supabase/types";
import { Badge } from "@/components/ui/Badge";

export function IssueTypeBadge({ issueType, locale = "en" }: { issueType: IssueType; locale?: Locale }) {
  const issue = ISSUE_TYPES[issueType] || ISSUE_TYPES.other;
  return <Badge className={issue.badge}>{issueLabel(locale, issueType)}</Badge>;
}
