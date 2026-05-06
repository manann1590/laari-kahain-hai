import { FOOD_CATEGORIES } from "@/lib/constants";
import { categoryLabel, type Locale } from "@/lib/i18n";
import type { FoodCategory } from "@/lib/supabase/types";
import { Badge } from "@/components/ui/Badge";

export function CategoryBadge({ category, locale = "en" }: { category: FoodCategory; locale?: Locale }) {
  const item = FOOD_CATEGORIES[category] || FOOD_CATEGORIES.other;
  return <Badge className={item.badge}>{categoryLabel(locale, category)}</Badge>;
}
