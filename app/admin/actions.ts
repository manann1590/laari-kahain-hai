"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createAdminSupabaseClient } from "@/lib/supabase/server";
import { requireAdmin, clearAdminCookie } from "@/lib/data/admin";
import {
  approveReport,
  createReport,
  markDuplicate,
  rejectReport,
  updateReport,
} from "@/lib/data/reports";
import { safeNumber, safeString } from "@/lib/utils";
import {
  ACCEPTED_UPLOAD_IMAGE_LABEL,
  detectUploadImageFile,
  MAX_UPLOAD_IMAGE_BYTES,
  MAX_UPLOAD_IMAGE_LABEL,
} from "@/lib/image-upload";
import type { FoodCategory, Severity, ReportInsert, ReportStatus } from "@/lib/supabase/types";

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
  const { error } = await supabase.storage.from("vendor-images").upload(path, file, {
    contentType: imageFormat.mimeType,
    upsert: false,
  });

  if (error) throw new Error(`Image upload failed: ${error.message}`);

  const { data } = supabase.storage.from("vendor-images").getPublicUrl(path);
  return {
    image_path: path,
    image_url: data.publicUrl,
  };
}

function reportInputFromForm(formData: FormData) {
  return {
    category: safeString(formData.get("category")) as FoodCategory,
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
