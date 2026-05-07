import "server-only";
import { subDays } from "date-fns";
import { createAdminSupabaseClient, createServerSupabaseClient } from "@/lib/supabase/server";
import type {
  DashboardStats,
  FoodCategory,
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

const PUBLIC_STATUSES: ReportStatus[] = ["approved", "verified"];

const PUBLIC_REPORT_COLUMNS = [
  "id",
  "tracking_id",
  "category",
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
  "menu_image_url",
  "menu_image_path",
  "cuisine_tags",
  "price_range",
  "hours_text",
  "stall_photo_url",
  "stall_photo_path",
  "status",
  "severity",
  "verification_level",
  "partner_id",
  "confirmation_count",
  "created_at",
  "updated_at",
  "approved_at",
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
    .from("vendors")
    .select(PUBLIC_REPORT_COLUMNS)
    .in("status", PUBLIC_STATUSES)
    .order("created_at", { ascending: false })
    .limit(300);

  if (filters?.category && filters.category !== "all") {
    query = query.eq("category", filters.category);
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
  if (filters?.search) {
    const search = filters.search.replace(/[,%()]/g, " ").trim();
    if (search) {
      query = query.or(
        `title.ilike.%${search}%,area.ilike.%${search}%,district.ilike.%${search}%,address_text.ilike.%${search}%,description.ilike.%${search}%,menu_text.ilike.%${search}%,cuisine_tags.ilike.%${search}%`,
      );
    }
  }

  const { data, error } = await query;
  if (error) throwSupabaseError("Could not load public listings", error);
  return (data || []) as unknown as PublicReport[];
}

export async function getPublicReportById(id: string): Promise<PublicReport | null> {
  const { data, error } = await publicClient()
    .from("vendors")
    .select(PUBLIC_REPORT_COLUMNS)
    .eq("id", id)
    .in("status", PUBLIC_STATUSES)
    .maybeSingle();

  if (error) throwSupabaseError("Could not load listing", error);
  return data as unknown as PublicReport | null;
}

export async function getAdminReports(filters?: ReportFilters): Promise<Report[]> {
  let query = adminClient()
    .from("vendors")
    .select("*")
    .order("created_at", { ascending: false });

  if (filters?.status && filters.status !== "all") {
    query = query.eq("status", filters.status);
  }
  if (filters?.category && filters.category !== "all") {
    query = query.eq("category", filters.category);
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
    .from("vendors")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throwSupabaseError("Could not load admin listing", error);
  return data as Report | null;
}

export async function getReportEvents(reportId: string): Promise<ReportEvent[]> {
  const { data, error } = await adminClient()
    .from("vendor_events")
    .select("*")
    .eq("vendor_id", reportId)
    .order("created_at", { ascending: false });

  if (error) throwSupabaseError("Could not load listing events", error);
  return (data || []) as ReportEvent[];
}

export async function createReport(input: ReportInsert): Promise<Report> {
  const parsed = reportCreateSchema.parse(input);
  const { data, error } = await adminClient()
    .from("vendors")
    .insert(stripUndefined({
      ...parsed,
      status: "pending",
      source: "manual_admin",
    }))
    .select("*")
    .single();

  if (error) throwSupabaseError("Could not create listing", error);

  await addVendorEvent(data.id, {
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
    .from("vendors")
    .insert(stripUndefined({
      category: parsed.category,
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
      partner_id: parsed.partner_id,
      severity: parsed.severity || "medium",
      verification_level: parsed.verification_level || "low",
      status: "pending",
      source: "public_web",
    }))
    .select("*")
    .single();

  if (error) throwSupabaseError("Could not submit listing", error);

  await addVendorEvent(data.id, {
    event_type: "submitted",
    new_status: data.status,
    note: "Listing submitted through the public portal.",
    actor: "public",
  });

  return data as Report;
}

export async function createPartnerReport(input: ReportInsert): Promise<Report> {
  const parsed = reportCreateSchema.parse(input);
  const { data, error } = await adminClient()
    .from("vendors")
    .insert(stripUndefined({
      category: parsed.category,
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
      menu_image_url: parsed.menu_image_url,
      menu_image_path: parsed.menu_image_path,
      cuisine_tags: parsed.cuisine_tags,
      price_range: parsed.price_range,
      hours_text: parsed.hours_text,
      stall_photo_url: parsed.stall_photo_url,
      stall_photo_path: parsed.stall_photo_path,
      partner_id: parsed.partner_id,
      severity: parsed.severity || "medium",
      verification_level: parsed.verification_level || "medium",
      status: "pending",
      source: "partner_portal",
    }))
    .select("*")
    .single();

  if (error) throwSupabaseError("Could not submit partner listing", error);

  await addVendorEvent(data.id, {
    event_type: "submitted",
    new_status: data.status,
    note: "Listing submitted through the partner portal.",
    actor: "partner",
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
    .from("vendors")
    .update(stripUndefined({
      ...parsed,
      ...timestamps,
    }))
    .eq("id", id)
    .select("*")
    .single();

  if (error) throwSupabaseError("Could not update listing", error);

  await addVendorEvent(id, {
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

export async function markDuplicate(id: string, duplicateOfId: string) {
  const report = await getAdminReportById(id);
  if (!report) throw new Error("Listing not found");

  const { data, error } = await adminClient()
    .from("vendors")
    .update({
      status: "duplicate",
      duplicate_of: duplicateOfId,
    })
    .eq("id", id)
    .select("*")
    .single();

  if (error) throwSupabaseError("Could not mark duplicate", error);

  await addVendorEvent(id, {
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
    .from("vendors")
    .update({
      status,
      ...timestampForStatus(status),
    })
    .eq("id", id)
    .select("*")
    .single();

  if (error) throwSupabaseError(`Could not set listing status to ${status}`, error);

  await addVendorEvent(id, {
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
  return {};
}

export async function addVendorEvent(
  vendorId: string,
  event: {
    event_type: string;
    old_status?: ReportStatus | null;
    new_status?: ReportStatus | null;
    note?: string | null;
    actor?: string | null;
    proof_image_url?: string | null;
  },
) {
  const { error } = await adminClient().from("vendor_events").insert({
    vendor_id: vendorId,
    actor: event.actor || "admin",
    ...event,
  });

  if (error) throwSupabaseError("Could not record listing event", error);
}

export async function getNearbyReports(
  latitude: number,
  longitude: number,
  category: FoodCategory,
  excludeId: string,
  radiusMeters = 100,
): Promise<Report[]> {
  const { data, error } = await adminClient()
    .from("vendors")
    .select("*")
    .eq("category", category)
    .neq("id", excludeId)
    .in("status", PUBLIC_STATUSES);

  if (error) throwSupabaseError("Could not load nearby listings", error);

  const point = { latitude, longitude };
  return ((data || []) as Report[]).filter(
    (r) => distanceMeters(point, { latitude: r.latitude, longitude: r.longitude }) <= radiusMeters,
  );
}

export async function getPartnerReports(partnerId: string): Promise<Report[]> {
  const { data, error } = await adminClient()
    .from("vendors")
    .select("*")
    .eq("partner_id", partnerId)
    .order("created_at", { ascending: false });

  if (error) throwSupabaseError("Could not load partner listings", error);
  return (data || []) as Report[];
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const [approved, verified, pending, rejected, recent, publicReports] = await Promise.all([
    countReports("approved"),
    countReports("verified"),
    countReports("pending"),
    countReports("rejected"),
    adminClient()
      .from("vendors")
      .select("id", { count: "exact", head: true })
      .gte("created_at", subDays(new Date(), 7).toISOString()),
    publicClient()
      .from("vendors")
      .select("category, area, district")
      .in("status", ["approved", "verified"]),
  ]);

  if (recent.error) throwSupabaseError("Could not count recent listings", recent.error);
  if (publicReports.error) {
    throwSupabaseError("Could not load dashboard breakdown", publicReports.error);
  }

  const categoryCounts = new Map<FoodCategory, number>();
  const locationCounts = new Map<string, number>();
  for (const report of (publicReports.data || []) as Pick<Report, "category" | "area" | "district">[]) {
    categoryCounts.set(report.category, (categoryCounts.get(report.category) || 0) + 1);
    const location = [report.area, report.district].filter(Boolean).join(", ");
    if (location) locationCounts.set(location, (locationCounts.get(location) || 0) + 1);
  }

  return {
    totalApproved: approved + verified,
    pending,
    rejected,
    reportsThisWeek: recent.count || 0,
    topCategory: [...categoryCounts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] || null,
    topDistrictArea: [...locationCounts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] || null,
  };
}

export async function getPublicDashboardStats(): Promise<DashboardStats> {
  const [approved, recent, publicReports] = await Promise.all([
    countPublicReports(["approved", "verified"]),
    publicClient()
      .from("vendors")
      .select("id", { count: "exact", head: true })
      .in("status", PUBLIC_STATUSES)
      .gte("created_at", subDays(new Date(), 7).toISOString()),
    publicClient()
      .from("vendors")
      .select("category, area, district")
      .in("status", ["approved", "verified"]),
  ]);

  if (recent.error) throwSupabaseError("Could not count recent public listings", recent.error);
  if (publicReports.error) {
    throwSupabaseError("Could not load public stats breakdown", publicReports.error);
  }

  const categoryCounts = new Map<FoodCategory, number>();
  const locationCounts = new Map<string, number>();
  for (const report of (publicReports.data || []) as Pick<Report, "category" | "area" | "district">[]) {
    categoryCounts.set(report.category, (categoryCounts.get(report.category) || 0) + 1);
    const location = [report.area, report.district].filter(Boolean).join(", ");
    if (location) locationCounts.set(location, (locationCounts.get(location) || 0) + 1);
  }

  return {
    totalApproved: approved,
    pending: 0,
    rejected: 0,
    reportsThisWeek: recent.count || 0,
    topCategory: [...categoryCounts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] || null,
    topDistrictArea: [...locationCounts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] || null,
  };
}

async function countReports(status: ReportStatus) {
  const { count, error } = await adminClient()
    .from("vendors")
    .select("id", { count: "exact", head: true })
    .eq("status", status);

  if (error) throwSupabaseError(`Could not count ${status} listings`, error);
  return count || 0;
}

async function countPublicReports(statuses: ReportStatus[]) {
  const { count, error } = await publicClient()
    .from("vendors")
    .select("id", { count: "exact", head: true })
    .in("status", statuses);

  if (error) throwSupabaseError("Could not count public listings", error);
  return count || 0;
}

export async function getCategoryCounts() {
  const reports = await getPublicReports({ status: "approved" });
  const counts = new Map<FoodCategory, number>();
  for (const report of reports) {
    counts.set(report.category, (counts.get(report.category) || 0) + 1);
  }
  return [...counts.entries()]
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count);
}
