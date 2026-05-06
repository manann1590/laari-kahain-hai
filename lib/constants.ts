import type { FoodCategory, ReportStatus, Severity } from "@/lib/supabase/types";

export const FOOD_CATEGORY_VALUES: FoodCategory[] = [
  "chaat_snacks",
  "tea_coffee",
  "meals_thali",
  "fast_food",
  "south_indian",
  "desserts",
  "juice_shakes",
  "street_chinese",
  "breakfast",
  "late_night",
  "other",
];

export const STATUS_VALUES: ReportStatus[] = [
  "pending",
  "approved",
  "verified",
  "rejected",
  "duplicate",
];

export const PUBLIC_STATUS_VALUES: ReportStatus[] = ["approved", "verified"];

export const SEVERITY_VALUES: Severity[] = ["low", "medium", "high", "critical"];

export const FOOD_CATEGORIES: Record<
  FoodCategory,
  { label: string; description: string; marker: string; badge: string }
> = {
  chaat_snacks: {
    label: "Chaat & Snacks",
    description: "Pani puri, bhel, dabeli, vada pav, sandwiches, and quick bites",
    marker: "#FF8A00",
    badge: "bg-orange-100 text-orange-950 border-orange-200",
  },
  tea_coffee: {
    label: "Tea & Coffee",
    description: "Chai, coffee, cocoa, coolers, and tiny hangout counters",
    marker: "#8B5E34",
    badge: "bg-amber-100 text-amber-950 border-amber-200",
  },
  meals_thali: {
    label: "Meals & Thali",
    description: "Lunch plates, dinner boxes, paratha, khichdi, rice bowls, and full meals",
    marker: "#1FA971",
    badge: "bg-emerald-100 text-emerald-950 border-emerald-200",
  },
  fast_food: {
    label: "Fast Food",
    description: "Burgers, pizzas, fries, rolls, wraps, momos, and fusion plates",
    marker: "#E3442E",
    badge: "bg-red-100 text-red-950 border-red-200",
  },
  south_indian: {
    label: "South Indian",
    description: "Dosa, idli, uttapam, medu vada, filter coffee, and podi magic",
    marker: "#3867D6",
    badge: "bg-blue-100 text-blue-950 border-blue-200",
  },
  desserts: {
    label: "Desserts",
    description: "Ice cream, kulfi, falooda, waffles, cakes, and sweet cravings",
    marker: "#C44CCB",
    badge: "bg-fuchsia-100 text-fuchsia-950 border-fuchsia-200",
  },
  juice_shakes: {
    label: "Juice & Shakes",
    description: "Fresh juice, soda, lassi, shakes, smoothies, and summer rescue",
    marker: "#008C8C",
    badge: "bg-teal-100 text-teal-950 border-teal-200",
  },
  street_chinese: {
    label: "Street Chinese",
    description: "Noodles, manchurian, fried rice, chilli paneer, and wok counters",
    marker: "#7C3AED",
    badge: "bg-violet-100 text-violet-950 border-violet-200",
  },
  breakfast: {
    label: "Breakfast",
    description: "Poha, fafda, jalebi, maska bun, eggs, and morning staples",
    marker: "#F59E0B",
    badge: "bg-yellow-100 text-yellow-950 border-yellow-200",
  },
  late_night: {
    label: "Late Night",
    description: "After-hours bites, chai, rolls, maggi, eggs, and midnight saviors",
    marker: "#21170F",
    badge: "bg-stone-100 text-stone-950 border-stone-300",
  },
  other: {
    label: "Other Food Spot",
    description: "Anything tasty that does not fit the usual buckets",
    marker: "#64748B",
    badge: "bg-slate-100 text-slate-950 border-slate-200",
  },
};

export const STATUS_LABELS: Record<ReportStatus, { label: string; badge: string }> = {
  pending: {
    label: "Pending Review",
    badge: "bg-amber-50 text-amber-900 border-amber-200",
  },
  approved: {
    label: "Verified",
    badge: "bg-emerald-50 text-emerald-900 border-emerald-200",
  },
  verified: {
    label: "Verified",
    badge: "bg-emerald-50 text-emerald-900 border-emerald-200",
  },
  rejected: {
    label: "Rejected",
    badge: "bg-red-50 text-red-900 border-red-200",
  },
  duplicate: {
    label: "Duplicate",
    badge: "bg-slate-50 text-slate-900 border-slate-200",
  },
};

export const SEVERITY_LABELS: Record<Severity, { label: string; badge: string }> = {
  low: { label: "Low", badge: "bg-slate-50 text-slate-800 border-slate-200" },
  medium: { label: "Medium", badge: "bg-blue-50 text-blue-900 border-blue-200" },
  high: { label: "High", badge: "bg-orange-50 text-orange-900 border-orange-200" },
  critical: { label: "Critical", badge: "bg-red-50 text-red-900 border-red-200" },
};

export const AHMEDABAD_CENTER = {
  lat: 23.0225,
  lng: 72.5714,
};

export const DEFAULT_CITY = "Ahmedabad";
export const DEFAULT_STATE = "Gujarat";
export const DEFAULT_COUNTRY = "India";
