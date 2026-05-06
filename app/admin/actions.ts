"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createAdminSupabaseClient } from "@/lib/supabase/server";
import { requireAdmin, clearAdminCookie } from "@/lib/data/admin";
import {
  approveReport,
  citizenVerifyResolved,
  createReport,
  markDuplicate,
  rejectReport,
  resolveAsClaimedReport,
  updateReport,
  updateStatus,
} from "@/lib/data/reports";
import { safeNumber, safeString } from "@/lib/utils";
import {
  ACCEPTED_UPLOAD_IMAGE_LABEL,
  detectUploadImageFile,
  MAX_UPLOAD_IMAGE_BYTES,
  MAX_UPLOAD_IMAGE_LABEL,
} from "@/lib/image-upload";
import type { IssueType, Severity, ReportInsert, ReportStatus } from "@/lib/supabase/types";

async function uploadImage(formData: FormData, fieldName = "image_file", storagePath = "manual") {
  const file = formData.get(fieldName);
  if (!(file instanceof File) || file.size === 0) return {};

  if (file.size > MAX_UPLOAD_IMAGE_BYTES) {
    throw new Error(`Image must be ${MAX_UPLOAD_IMAGE_LABEL} or smaller.`);
  }

  const imageFormat = await detectUploadImageFile(file);
  if (!imageFormat) {
    throw new Error(`Only ${ACCEPTED_UPLOAD_IMAGE_LABEL} image uploads are supported.`);
  }

  const path = `${storagePath}/${crypto.randomUUID()}.${imageFormat.extension}`;
  const supabase = createAdminSupabaseClient();
  const { error } = await supabase.storage.from("report-images").upload(path, file, {
    contentType: imageFormat.mimeType,
    upsert: false,
  });

  if (error) throw new Error(`Image upload failed: ${error.message}`);

  const { data } = supabase.storage.from("report-images").getPublicUrl(path);
  return {
    image_path: path,
    image_url: data.publicUrl,
  };
}

async function uploadProofImage(formData: FormData, fieldName = "proof_image_file"): Promise<string | undefined> {
  const file = formData.get(fieldName);
  if (!(file instanceof File) || file.size === 0) return undefined;

  if (file.size > MAX_UPLOAD_IMAGE_BYTES) {
    throw new Error(`Proof image must be ${MAX_UPLOAD_IMAGE_LABEL} or smaller.`);
  }

  const imageFormat = await detectUploadImageFile(file);
  if (!imageFormat) {
    throw new Error(`Only ${ACCEPTED_UPLOAD_IMAGE_LABEL} image uploads are supported.`);
  }

  const path = `proof-images/${crypto.randomUUID()}.${imageFormat.extension}`;
  const supabase = createAdminSupabaseClient();
  const { error } = await supabase.storage.from("report-images").upload(path, file, {
    contentType: imageFormat.mimeType,
    upsert: false,
  });

  if (error) throw new Error(`Proof image upload failed: ${error.message}`);

  const { data } = supabase.storage.from("report-images").getPublicUrl(path);
  return data.publicUrl;
}

function reportInputFromForm(formData: FormData) {
  return {
    issue_type: safeString(formData.get("issue_type")) as IssueType,
    title: safeString(formData.get("title")),
    description: safeString(formData.get("description")),
    menu_text: safeString(formData.get("menu_text")) || safeString(formData.get("description")),
    vendor_phone: safeString(formData.get("vendor_phone")),
    vendor_whatsapp: safeString(formData.get("vendor_whatsapp")) || safeString(formData.get("vendor_phone")),
    cuisine_tags: safeString(formData.get("cuisine_tags")),
    price_range: safeString(formData.get("price_range")),
    hours_text: safeString(formData.get("hours_text")),
    latitude: safeNumber(formData.get("latitude")),
    longitude: safeNumber(formData.get("longitude")),
    address_text: safeString(formData.get("address_text")),
    area: safeString(formData.get("area")),
    district: safeString(formData.get("district")),
    city: safeString(formData.get("city")),
    image_url: safeString(formData.get("image_url")),
    severity: safeString(formData.get("severity")) as Severity,
    reporter_phone_hash: safeString(formData.get("reporter_phone_hash")),
    admin_notes: safeString(formData.get("admin_notes")),
  };
}

export async function createReportAction(formData: FormData) {
  await requireAdmin();
  const uploaded = await uploadImage(formData);
  const report = await createReport({
    ...reportInputFromForm(formData),
    ...uploaded,
  } as ReportInsert);
  revalidatePath("/admin");
  redirect(`/admin/reports/${report.id}`);
}

export async function updateReportAction(id: string, formData: FormData) {
  await requireAdmin();
  const uploaded = await uploadImage(formData);
  await updateReport(id, {
    ...reportInputFromForm(formData),
    ...uploaded,
    status: safeString(formData.get("status")) as ReportStatus,
    duplicate_of: safeString(formData.get("duplicate_of")),
  });
  revalidatePath("/admin");
  revalidatePath(`/admin/reports/${id}`);
  revalidatePath("/map");
  redirect(`/admin/reports/${id}?saved=1`);
}

export async function approveReportAction(id: string) {
  await requireAdmin();
  await approveReport(id);
  revalidatePath("/admin");
  revalidatePath("/map");
  revalidatePath(`/reports/${id}`);
}

export async function rejectReportAction(id: string, formData: FormData) {
  await requireAdmin();
  await rejectReport(id, safeString(formData.get("rejection_note")));
  revalidatePath("/admin");
  revalidatePath("/map");
}

export async function resolveAsClaimedAction(id: string, formData: FormData) {
  await requireAdmin();
  const note = safeString(formData.get("resolution_note"));
  if (!note) throw new Error("A resolution note is required.");
  const proofImageUrl = await uploadProofImage(formData, "proof_image_file");
  await resolveAsClaimedReport(id, note, proofImageUrl);
  revalidatePath("/admin");
  revalidatePath("/map");
  revalidatePath(`/reports/${id}`);
}

/** @deprecated Use resolveAsClaimedAction instead */
export async function resolveReportAction(id: string, formData: FormData) {
  return resolveAsClaimedAction(id, formData);
}

export async function markInProgressAction(id: string) {
  await requireAdmin();
  await updateStatus(id, "in_progress", "Listing marked as in progress.");
  revalidatePath("/admin");
  revalidatePath("/map");
  revalidatePath(`/reports/${id}`);
}

export async function adminConfirmResolvedAction(id: string) {
  await requireAdmin();
  await citizenVerifyResolved(id);
  revalidatePath("/admin");
  revalidatePath("/map");
  revalidatePath(`/reports/${id}`);
}

export async function markDuplicateAction(id: string, formData: FormData) {
  await requireAdmin();
  const duplicateOfId = safeString(formData.get("duplicate_of"));
  if (!duplicateOfId) throw new Error("Duplicate listing ID is required.");
  await markDuplicate(id, duplicateOfId);
  revalidatePath("/admin");
  revalidatePath("/map");
}

export async function logoutAction() {
  await clearAdminCookie();
  redirect("/admin/login");
}
