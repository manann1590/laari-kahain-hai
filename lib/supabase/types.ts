export type FoodCategory =
  | "chaat_snacks"
  | "tea_coffee"
  | "meals_thali"
  | "fast_food"
  | "south_indian"
  | "desserts"
  | "juice_shakes"
  | "street_chinese"
  | "breakfast"
  | "late_night"
  | "other";

export type ReportStatus =
  | "pending"
  | "approved"   // backwards-compat alias for verified
  | "verified"   // admin approved, publicly visible
  | "rejected"
  | "duplicate";

export type VerificationLevel = "high" | "medium" | "low";

export type Severity = "low" | "medium" | "high" | "critical";

export type Report = {
  id: string;
  tracking_id: string | null;
  category: FoodCategory;
  title: string | null;
  description: string | null;
  latitude: number;
  longitude: number;
  address_text: string | null;
  area: string | null;
  district: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  image_url: string | null;
  image_path: string | null;
  vendor_phone: string | null;
  vendor_whatsapp: string | null;
  menu_text: string | null;
  cuisine_tags: string | null;
  price_range: string | null;
  hours_text: string | null;
  stall_photo_url: string | null;
  stall_photo_path: string | null;
  status: ReportStatus;
  severity: Severity | null;
  verification_level: VerificationLevel | null;
  source: string | null;
  reporter_phone_hash: string | null;
  admin_notes: string | null;
  duplicate_of: string | null;
  confirmation_count: number | null;
  created_at: string;
  updated_at: string;
  approved_at: string | null;
  rejected_at: string | null;
};

export type PublicReport = Pick<
  Report,
  | "id"
  | "tracking_id"
  | "category"
  | "title"
  | "description"
  | "latitude"
  | "longitude"
  | "address_text"
  | "area"
  | "district"
  | "city"
  | "state"
  | "country"
  | "image_url"
  | "image_path"
  | "vendor_phone"
  | "vendor_whatsapp"
  | "menu_text"
  | "cuisine_tags"
  | "price_range"
  | "hours_text"
  | "stall_photo_url"
  | "stall_photo_path"
  | "status"
  | "severity"
  | "verification_level"
  | "confirmation_count"
  | "created_at"
  | "updated_at"
  | "approved_at"
>;

export type ReportInsert = Partial<Omit<Report, "id" | "created_at" | "updated_at">> & {
  category: FoodCategory;
  latitude: number;
  longitude: number;
};

export type ReportUpdate = Partial<Omit<Report, "id" | "created_at" | "updated_at">>;

export type ReportEvent = {
  id: string;
  vendor_id: string;
  event_type: string;
  old_status: ReportStatus | null;
  new_status: ReportStatus | null;
  note: string | null;
  actor: string | null;
  proof_image_url: string | null;
  created_at: string;
};

export type DashboardStats = {
  totalApproved: number;
  pending: number;
  rejected: number;
  reportsThisWeek: number;
  topCategory: FoodCategory | null;
  topDistrictArea: string | null;
};

export type ReportFilters = {
  category?: FoodCategory | "all";
  status?: ReportStatus | "all";
  district?: string;
  area?: string;
  search?: string;
};
