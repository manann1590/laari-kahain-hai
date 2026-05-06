import "server-only";
import { subDays } from "date-fns";
import { createAdminSupabaseClient, createServerSupabaseClient } from "@/lib/supabase/server";
import type {
  DashboardStats,
  IssueType,
  LeaderboardRow,
  PublicReport,
  Report,
  ReportEvent,
  ReportFilters,
  ReportInsert,
  ReportStatus,
  ReportUpdate,
} from "@/lib/supabase/types";
import { reportCreateSchema, reportUpdateSchema } from "@/lib/validators/report";
import { distanceMeters } from "@/lib/geo";

const PUBLIC_STATUSES: ReportStatus[] = [
  "approved",
  "verified",
  "in_progress",
  "sent_to_amc",
  "amc_acknowledged",
  "resolved_claimed",
  "citizen_verified_resolved",
  "reopened",
  "resolved",
];

const PUBLIC_REPORT_COLUMNS = [
  "id",
  "tracking_id",
  "issue_type",
  "title",
  "description",
  "latitude",
  "longitude",
  "address_text",
  "area",
  "district",
  "city",
  "state",
  "country",
  "image_url",
  "image_path",
  "vendor_phone",
  "vendor_whatsapp",
  "menu_text",
  "cuisine_tags",
  "price_range",
  "hours_text",
  "stall_photo_url",
  "stall_photo_path",
  "status",
  "severity",
  "verification_level",
  "confirmation_count",
  "created_at",
  "updated_at",
  "approved_at",
  "resolved_at",
  "resolved_claimed_at",
  "citizen_verified_at",
  "reopened_at",
  "sent_to_amc_at",
].join(",");

function publicClient() {
  return createServerSupabaseClient();
}

function adminClient() {
  return createAdminSupabaseClient();
}

function throwSupabaseError(message: string, error: unknown): never {
  const detail =
    error && typeof error === "object" && "message" in error
      ? String((error as { message: unknown }).message)
      : "Unknown Supabase error";
  throw new Error(`${message}: ${detail}`);
}

function stripUndefined(value: Record<string, unknown>) {
  return Object.fromEntries(
    Object.entries(value).filter(([, entryValue]) => entryValue !== undefined),
  );
}

export async function getPublicReports(filters?: ReportFilters): Promise<PublicReport[]> {
  let query = publicClient()
    .from("reports")
    .select(PUBLIC_REPORT_COLUMNS)
    .in("status", PUBLIC_STATUSES)
    .order("created_at", { ascending: false })
    .limit(300);

  if (filters?.issue_type && filters.issue_type !== "all") {
    query = query.eq("issue_type", filters.issue_type);
  }
  if (filters?.status && filters.status !== "all") {
    query = query.eq("status", filters.status);
  }
  if (filters?.district) {
    query = query.ilike("district", `%${filters.district}%`);
  }
  if (filters?.area) {
    query = query.ilike("area", `%${filters.area}%`);
  }

  const { data, error } = await query;
  if (error) throwSupabaseError("Could not load public listings", error);
  return (data || []) as unknown as PublicReport[];
}

export async function getPublicReportById(id: string): Promise<PublicReport | null> {
  const { data, error } = await publicClient()
    .from("reports")
    .select(PUBLIC_REPORT_COLUMNS)
    .eq("id", id)
    .in("status", PUBLIC_STATUSES)
    .maybeSingle();

  if (error) throwSupabaseError("Could not load listing", error);
  return data as unknown as PublicReport | null;
}

export async function getAdminReports(filters?: ReportFilters): Promise<Report[]> {
  let query = adminClient()
    .from("reports")
    .select("*")
    .order("created_at", { ascending: false });

  if (filters?.status && filters.status !== "all") {
    query = query.eq("status", filters.status);
  }
  if (filters?.issue_type && filters.issue_type !== "all") {
    query = query.eq("issue_type", filters.issue_type);
  }
  if (filters?.district) {
    query = query.ilike("district", `%${filters.district}%`);
  }
  if (filters?.search) {
    const search = filters.search.replace(/[,%()]/g, " ").trim();
    if (search) {
      query = query.or(
        `area.ilike.%${search}%,district.ilike.%${search}%,address_text.ilike.%${search}%,description.ilike.%${search}%`,
      );
    }
  }

  const { data, error } = await query;
  if (error) throwSupabaseError("Could not load admin listings", error);
  return ((data || []) as Report[]).sort((a, b) => {
    if (a.status === "pending" && b.status !== "pending") return -1;
    if (a.status !== "pending" && b.status === "pending") return 1;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });
}

export async function getAdminReportById(id: string): Promise<Report | null> {
  const { data, error } = await adminClient()
    .from("reports")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throwSupabaseError("Could not load admin listing", error);
  return data as Report | null;
}

export async function getReportEvents(reportId: string): Promise<ReportEvent[]> {
  const { data, error } = await adminClient()
    .from("report_events")
    .select("*")
    .eq("report_id", reportId)
    .order("created_at", { ascending: false });

  if (error) throwSupabaseError("Could not load listing events", error);
  return (data || []) as ReportEvent[];
}

export async function createReport(input: ReportInsert): Promise<Report> {
  const parsed = reportCreateSchema.parse(input);
  const { data, error } = await adminClient()
    .from("reports")
    .insert(stripUndefined({
      ...parsed,
      status: "pending",
      source: "manual_admin",
    }))
    .select("*")
    .single();

  if (error) throwSupabaseError("Could not create listing", error);

  await addReportEvent(data.id, {
    event_type: "created",
    new_status: data.status,
    note: "Listing created from admin manual entry.",
    actor: "admin",
  });

  return data as Report;
}

export async function createPublicReport(input: ReportInsert): Promise<Report> {
  const parsed = reportCreateSchema.parse(input);
  const { data, error } = await adminClient()
    .from("reports")
    .insert(stripUndefined({
      issue_type: parsed.issue_type,
      title: parsed.title,
      description: parsed.description,
      latitude: parsed.latitude,
      longitude: parsed.longitude,
      address_text: parsed.address_text,
      area: parsed.area,
      district: parsed.district,
      city: parsed.city,
      image_url: parsed.image_url,
      image_path: parsed.image_path,
      vendor_phone: parsed.vendor_phone,
      vendor_whatsapp: parsed.vendor_whatsapp,
      menu_text: parsed.menu_text,
      cuisine_tags: parsed.cuisine_tags,
      price_range: parsed.price_range,
      hours_text: parsed.hours_text,
      stall_photo_url: parsed.stall_photo_url,
      stall_photo_path: parsed.stall_photo_path,
      severity: parsed.severity || "medium",
      verification_level: parsed.verification_level || "low",
      status: "pending",
      source: "public_web",
    }))
    .select("*")
    .single();

  if (error) throwSupabaseError("Could not submit listing", error);

  await addReportEvent(data.id, {
    event_type: "submitted",
    new_status: data.status,
    note: "Listing submitted through the public portal.",
    actor: "public",
  });

  return data as Report;
}

export async function updateReport(id: string, input: ReportUpdate): Promise<Report> {
  const existing = await getAdminReportById(id);
  if (!existing) throw new Error("Listing not found");

  const parsed = reportUpdateSchema.parse(input);
  const statusChanged = parsed.status && parsed.status !== existing.status;
  const timestamps = statusChanged ? timestampForStatus(parsed.status) : {};

  const { data, error } = await adminClient()
    .from("reports")
    .update(stripUndefined({
      ...parsed,
      ...timestamps,
    }))
    .eq("id", id)
    .select("*")
    .single();

  if (error) throwSupabaseError("Could not update listing", error);

  await addReportEvent(id, {
    event_type: statusChanged ? "status_changed" : "updated",
    old_status: existing.status,
    new_status: (data as Report).status,
    note: statusChanged ? `Status changed to ${(data as Report).status}.` : "Listing details updated.",
  });

  return data as Report;
}

export async function approveReport(id: string) {
  return updateStatus(id, "verified", "Listing approved and verified.");
}

export async function rejectReport(id: string, note?: string) {
  return updateStatus(id, "rejected", note || "Listing rejected during review.");
}

/** @deprecated Use resolveAsClaimedReport instead */
export async function resolveReport(id: string) {
  return updateStatus(id, "resolved_claimed", "Listing marked closed.");
}

export async function resolveAsClaimedReport(
  id: string,
  note: string,
  proofImageUrl?: string,
): Promise<Report> {
  if (!note || !note.trim()) {
    throw new Error("A note is required to mark a listing as closed.");
  }

  const report = await getAdminReportById(id);
  if (!report) throw new Error("Listing not found");

  const now = new Date().toISOString();
  const { data, error } = await adminClient()
    .from("reports")
    .update({
      status: "resolved_claimed",
      resolved_claimed_at: now,
    })
    .eq("id", id)
    .select("*")
    .single();

  if (error) throwSupabaseError("Could not mark listing as closed", error);

  await addReportEvent(id, {
    event_type: "resolved_claimed",
    old_status: report.status,
    new_status: "resolved_claimed",
    note: note.trim(),
    actor: "admin",
    proof_image_url: proofImageUrl,
  });

  return data as Report;
}

export async function citizenVerifyResolved(id: string): Promise<Report> {
  const report = await getAdminReportById(id);
  if (!report) throw new Error("Listing not found");

  const now = new Date().toISOString();
  const { data, error } = await adminClient()
    .from("reports")
    .update({
      status: "citizen_verified_resolved",
      citizen_verified_at: now,
    })
    .eq("id", id)
    .select("*")
    .single();

  if (error) throwSupabaseError("Could not mark listing as community verified closed", error);

  await addReportEvent(id, {
    event_type: "citizen_verified_resolved",
    old_status: report.status,
    new_status: "citizen_verified_resolved",
    note: "Community member confirmed the vendor is no longer at this spot.",
    actor: "citizen",
  });

  return data as Report;
}

export async function reopenReport(
  id: string,
  reason: string,
  note?: string,
  proofImageUrl?: string,
): Promise<Report> {
  if (!reason || !reason.trim()) {
    throw new Error("A reason is required to reopen a listing.");
  }

  const report = await getAdminReportById(id);
  if (!report) throw new Error("Listing not found");

  const now = new Date().toISOString();
  const { data, error } = await adminClient()
    .from("reports")
    .update({
      status: "reopened",
      reopened_at: now,
    })
    .eq("id", id)
    .select("*")
    .single();

  if (error) throwSupabaseError("Could not reopen listing", error);

  const eventNote = [reason.trim(), note?.trim()].filter(Boolean).join(" — ");

  await addReportEvent(id, {
    event_type: "reopened",
    old_status: report.status,
    new_status: "reopened",
    note: eventNote,
    actor: "citizen",
    proof_image_url: proofImageUrl,
  });

  return data as Report;
}

export async function markDuplicate(id: string, duplicateOfId: string) {
  const report = await getAdminReportById(id);
  if (!report) throw new Error("Listing not found");

  const { data, error } = await adminClient()
    .from("reports")
    .update({
      status: "duplicate",
      duplicate_of: duplicateOfId,
    })
    .eq("id", id)
    .select("*")
    .single();

  if (error) throwSupabaseError("Could not mark duplicate", error);

  await addReportEvent(id, {
    event_type: "duplicate",
    old_status: report.status,
    new_status: "duplicate",
    note: `Marked duplicate of ${duplicateOfId}.`,
  });

  return data as Report;
}

export async function updateStatus(id: string, status: ReportStatus, note: string) {
  const report = await getAdminReportById(id);
  if (!report) throw new Error("Listing not found");

  const { data, error } = await adminClient()
    .from("reports")
    .update({
      status,
      ...timestampForStatus(status),
    })
    .eq("id", id)
    .select("*")
    .single();

  if (error) throwSupabaseError(`Could not set listing status to ${status}`, error);

  await addReportEvent(id, {
    event_type: status,
    old_status: report.status,
    new_status: status,
    note,
  });

  return data as Report;
}

function timestampForStatus(status?: ReportStatus) {
  const now = new Date().toISOString();
  if (status === "approved") return { approved_at: now, rejected_at: null };
  if (status === "verified") return { approved_at: now, rejected_at: null };
  if (status === "rejected") return { rejected_at: now };
  if (status === "resolved") return { resolved_at: now };
  if (status === "resolved_claimed") return { resolved_claimed_at: now };
  if (status === "citizen_verified_resolved") return { citizen_verified_at: now };
  if (status === "reopened") return { reopened_at: now };
  if (status === "sent_to_amc") return { sent_to_amc_at: now };
  if (status === "in_progress") return {};
  if (status === "amc_acknowledged") return {};
  return {};
}

export async function addReportEvent(
  reportId: string,
  event: {
    event_type: string;
    old_status?: ReportStatus | null;
    new_status?: ReportStatus | null;
    note?: string | null;
    actor?: string | null;
    proof_image_url?: string | null;
  },
) {
  const { error } = await adminClient().from("report_events").insert({
    report_id: reportId,
    actor: event.actor || "admin",
    ...event,
  });

  if (error) throwSupabaseError("Could not record listing event", error);
}

export async function getNearbyReports(
  latitude: number,
  longitude: number,
  issueType: IssueType,
  excludeId: string,
  radiusMeters = 100,
): Promise<Report[]> {
  const { data, error } = await adminClient()
    .from("reports")
    .select("*")
    .eq("issue_type", issueType)
    .neq("id", excludeId)
    .in("status", PUBLIC_STATUSES);

  if (error) throwSupabaseError("Could not load nearby listings", error);

  const point = { latitude, longitude };
  return ((data || []) as Report[]).filter(
    (r) => distanceMeters(point, { latitude: r.latitude, longitude: r.longitude }) <= radiusMeters,
  );
}

export async function getLeaderboard(): Promise<LeaderboardRow[]> {
  const { data, error } = await publicClient()
    .from("reports")
    .select("issue_type, status, area, district")
    .in("status", PUBLIC_STATUSES);

  if (error) throwSupabaseError("Could not load leaderboard", error);

  const RESOLVED_STATUSES: ReportStatus[] = [
    "resolved",
    "resolved_claimed",
    "citizen_verified_resolved",
  ];
  const OPEN_STATUSES: ReportStatus[] = [
    "approved",
    "verified",
    "in_progress",
    "sent_to_amc",
    "amc_acknowledged",
    "reopened",
  ];

  const groups = new Map<
    string,
    {
      area: string;
      district: string;
      open_count: number;
      resolved_count: number;
      issueCounts: Map<IssueType, number>;
    }
  >();

  for (const report of (data || []) as Pick<
    Report,
    "issue_type" | "status" | "area" | "district"
  >[]) {
    const area = report.area || "Unknown area";
    const district = report.district || "Ahmedabad";
    const key = `${area}__${district}`;
    const group =
      groups.get(key) ||
      {
        area,
        district,
        open_count: 0,
        resolved_count: 0,
        issueCounts: new Map<IssueType, number>(),
      };

    if (RESOLVED_STATUSES.includes(report.status as ReportStatus)) group.resolved_count += 1;
    if (OPEN_STATUSES.includes(report.status as ReportStatus)) group.open_count += 1;
    group.issueCounts.set(report.issue_type, (group.issueCounts.get(report.issue_type) || 0) + 1);
    groups.set(key, group);
  }

  return [...groups.values()]
    .sort((a, b) => b.open_count - a.open_count || b.resolved_count - a.resolved_count)
    .map((group, index) => ({
      rank: index + 1,
      area: group.area,
      district: group.district,
      open_count: group.open_count,
      resolved_count: group.resolved_count,
      top_issue_type:
        [...group.issueCounts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] || "other",
    }));
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const [approved, verified, pending, resolved, rejected, recent, publicReports] = await Promise.all([
    countReports("approved"),
    countReports("verified"),
    countReports("pending"),
    countReports("resolved"),
    countReports("rejected"),
    adminClient()
      .from("reports")
      .select("id", { count: "exact", head: true })
      .gte("created_at", subDays(new Date(), 7).toISOString()),
    publicClient()
      .from("reports")
      .select("issue_type, area, district")
      .in("status", ["approved", "verified"]),
  ]);

  if (recent.error) throwSupabaseError("Could not count recent listings", recent.error);
  if (publicReports.error) {
    throwSupabaseError("Could not load dashboard breakdown", publicReports.error);
  }

  const issueCounts = new Map<IssueType, number>();
  const locationCounts = new Map<string, number>();
  for (const report of (publicReports.data || []) as Pick<
    Report,
    "issue_type" | "area" | "district"
  >[]) {
    issueCounts.set(report.issue_type, (issueCounts.get(report.issue_type) || 0) + 1);
    const location = [report.area, report.district].filter(Boolean).join(", ");
    if (location) locationCounts.set(location, (locationCounts.get(location) || 0) + 1);
  }

  return {
    totalApproved: approved + verified,
    pending,
    resolved,
    rejected,
    reportsThisWeek: recent.count || 0,
    topIssueType: [...issueCounts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] || null,
    topDistrictArea:
      [...locationCounts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] || null,
  };
}

export async function getPublicDashboardStats(): Promise<DashboardStats> {
  const [approved, resolved, recent, publicReports] = await Promise.all([
    countPublicReports(["approved", "verified"]),
    countPublicReports(["resolved", "resolved_claimed", "citizen_verified_resolved"]),
    publicClient()
      .from("reports")
      .select("id", { count: "exact", head: true })
      .in("status", PUBLIC_STATUSES)
      .gte("created_at", subDays(new Date(), 7).toISOString()),
    publicClient()
      .from("reports")
      .select("issue_type, area, district")
      .in("status", ["approved", "verified"]),
  ]);

  if (recent.error) throwSupabaseError("Could not count recent public listings", recent.error);
  if (publicReports.error) {
    throwSupabaseError("Could not load public stats breakdown", publicReports.error);
  }

  const issueCounts = new Map<IssueType, number>();
  const locationCounts = new Map<string, number>();
  for (const report of (publicReports.data || []) as Pick<
    Report,
    "issue_type" | "area" | "district"
  >[]) {
    issueCounts.set(report.issue_type, (issueCounts.get(report.issue_type) || 0) + 1);
    const location = [report.area, report.district].filter(Boolean).join(", ");
    if (location) locationCounts.set(location, (locationCounts.get(location) || 0) + 1);
  }

  return {
    totalApproved: approved,
    pending: 0,
    resolved,
    rejected: 0,
    reportsThisWeek: recent.count || 0,
    topIssueType: [...issueCounts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] || null,
    topDistrictArea:
      [...locationCounts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] || null,
  };
}

async function countReports(status: ReportStatus) {
  const { count, error } = await adminClient()
    .from("reports")
    .select("id", { count: "exact", head: true })
    .eq("status", status);

  if (error) throwSupabaseError(`Could not count ${status} listings`, error);
  return count || 0;
}

async function countPublicReports(statuses: ReportStatus[]) {
  const { count, error } = await publicClient()
    .from("reports")
    .select("id", { count: "exact", head: true })
    .in("status", statuses);

  if (error) throwSupabaseError(`Could not count public listings`, error);
  return count || 0;
}

export async function getIssueTypeCounts() {
  const reports = await getPublicReports({ status: "approved" });
  const counts = new Map<IssueType, number>();
  for (const report of reports) {
    counts.set(report.issue_type, (counts.get(report.issue_type) || 0) + 1);
  }
  return [...counts.entries()]
    .map(([issue_type, count]) => ({ issue_type, count }))
    .sort((a, b) => b.count - a.count);
}
