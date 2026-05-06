export type IssueType =
  | "pothole"
  | "broken_streetlight"
  | "garbage"
  | "waterlogging"
  | "damaged_road"
  | "damaged_footpath"
  | "open_manhole"
  | "damaged_public_property"
  | "drainage"
  | "illegal_dumping"
  | "other";

export type ReportStatus =
  | "pending"
  | "approved"                  // backwards-compat alias for verified
  | "verified"                  // admin approved, publicly visible
  | "rejected"
  | "duplicate"
  | "in_progress"
  | "sent_to_amc"
  | "amc_acknowledged"
  | "resolved_claimed"          // admin claims resolved; awaits verification
  | "citizen_verified_resolved" // citizen confirmed resolved
  | "reopened"
  | "resolved";                 // backwards-compat alias for resolved_claimed

export type VerificationLevel = "high" | "medium" | "low";

export type Severity = "low" | "medium" | "high" | "critical";

export type Report = {
  id: string;
  tracking_id: string | null;
  issue_type: IssueType;
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
  resolved_at: string | null;
  rejected_at: string | null;
  resolved_claimed_at: string | null;
  citizen_verified_at: string | null;
  reopened_at: string | null;
  sent_to_amc_at: string | null;
};

export type PublicReport = Pick<
  Report,
  | "id"
  | "tracking_id"
  | "issue_type"
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
  | "resolved_at"
  | "resolved_claimed_at"
  | "citizen_verified_at"
  | "reopened_at"
  | "sent_to_amc_at"
>;

export type ReportInsert = Partial<Omit<Report, "id" | "created_at" | "updated_at">> & {
  issue_type: IssueType;
  latitude: number;
  longitude: number;
};

export type ReportUpdate = Partial<Omit<Report, "id" | "created_at" | "updated_at">>;

export type ReportEvent = {
  id: string;
  report_id: string;
  event_type: string;
  old_status: ReportStatus | null;
  new_status: ReportStatus | null;
  note: string | null;
  actor: string | null;
  proof_image_url: string | null;
  created_at: string;
};

export type LeaderboardRow = {
  rank: number;
  area: string;
  district: string;
  open_count: number;
  resolved_count: number;
  top_issue_type: IssueType;
};

export type DashboardStats = {
  totalApproved: number;
  pending: number;
  resolved: number;
  rejected: number;
  reportsThisWeek: number;
  topIssueType: IssueType | null;
  topDistrictArea: string | null;
};

export type ReportFilters = {
  issue_type?: IssueType | "all";
  status?: ReportStatus | "all";
  district?: string;
  area?: string;
  search?: string;
};

export type AmcEmailBatch = {
  id: string;
  week_start: string;
  week_end: string;
  subject: string | null;
  body: string | null;
  report_count: number;
  sent_to: string | null;
  cc: string | null;
  status: "draft" | "sent" | "failed";
  sent_at: string | null;
  created_at: string;
};

export type AmcEmailBatchReport = {
  id: string;
  batch_id: string;
  report_id: string;
  created_at: string;
};

export type AmcBatchWithReports = AmcEmailBatch & {
  reports: PublicReport[];
};
