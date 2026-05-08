"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { createPublicReport } from "@/lib/data/reports";
import { createAdminSupabaseClient } from "@/lib/supabase/server";
import { safeNumber, safeString } from "@/lib/utils";
import {
  ACCEPTED_UPLOAD_IMAGE_LABEL,
  detectUploadImageFile,
  MAX_UPLOAD_IMAGE_BYTES,
  MAX_UPLOAD_IMAGE_LABEL,
} from "@/lib/image-upload";
import {
  ACCEPTED_MENU_LABEL,
  detectMenuFile,
  MAX_MENU_FILE_BYTES,
  MAX_MENU_FILE_LABEL,
} from "@/lib/menu-upload";
import type { FoodCategory, ReportInsert } from "@/lib/supabase/types";
import { reportCreateSchema } from "@/lib/validators/report";

const SUBMISSION_COOLDOWN_SECONDS = 30;
const PUBLIC_SUBMISSION_COOKIE = "foodradar_last_vendor_submission";

async function uploadPublicImage(formData: FormData): Promise<{
  image_path?: string;
  image_url?: string;
  hasImage: boolean;
}> {
  const file = formData.get("image_file");

  if (!(file instanceof File) || file.size === 0) {
    return { hasImage: false };
  }

  if (file.size > MAX_UPLOAD_IMAGE_BYTES) {
    throw new Error(`Image must be ${MAX_UPLOAD_IMAGE_LABEL} or smaller.`);
  }

  const imageFormat = await detectUploadImageFile(file);
  if (!imageFormat) {
    throw new Error(`Only ${ACCEPTED_UPLOAD_IMAGE_LABEL} image uploads are supported.`);
  }

  const path = `public-submissions/${crypto.randomUUID()}.${imageFormat.extension}`;
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
    hasImage: true,
  };
}

async function uploadPublicMenuFile(formData: FormData): Promise<{
  menu_image_path?: string;
  menu_image_url?: string;
}> {
  const file = formData.get("menu_file");
  if (!(file instanceof File) || file.size === 0) return {};

  if (file.size > MAX_MENU_FILE_BYTES) {
    throw new Error(`Menu file must be ${MAX_MENU_FILE_LABEL} or smaller.`);
  }

  const format = await detectMenuFile(file);
  if (!format) {
    throw new Error(`Only ${ACCEPTED_MENU_LABEL} are accepted for the menu.`);
  }

  const path = `menus/public/${crypto.randomUUID()}.${format.extension}`;
  const supabase = createAdminSupabaseClient();
  const { error } = await supabase.storage.from("vendor-images").upload(path, file, {
    contentType: format.mimeType,
    upsert: false,
  });

  if (error) throw new Error(`Menu upload failed: ${error.message}`);

  const { data } = supabase.storage.from("vendor-images").getPublicUrl(path);
  return {
    menu_image_path: path,
    menu_image_url: data.publicUrl,
  };
}

export async function submitPublicReportAction(formData: FormData) {
  throw new Error("FoodRadar listings can only be submitted from an approved partner account.");

  if (safeString(formData.get("company_website"))) {
    throw new Error("Submission rejected.");
  }

  const cookieStore = await cookies();
  const lastSubmission = Number(cookieStore.get(PUBLIC_SUBMISSION_COOKIE)?.value || 0);
  const now = Date.now();
  if (lastSubmission && now - lastSubmission < SUBMISSION_COOLDOWN_SECONDS * 1000) {
    throw new Error("Please wait a moment before submitting another vendor listing.");
  }

  const input = {
    category: safeString(formData.get("category")) as FoodCategory,
    title: safeString(formData.get("title")),
    description: safeString(formData.get("description")),
    menu_text: safeString(formData.get("menu_text")) || safeString(formData.get("description")),
    vendor_phone: safeString(formData.get("vendor_phone")),
    vendor_whatsapp: safeString(formData.get("vendor_whatsapp")) || safeString(formData.get("vendor_phone")),
    vendor_website: safeString(formData.get("vendor_website")),
    cuisine_tags: safeString(formData.get("cuisine_tags")),
    price_range: safeString(formData.get("price_range")),
    hours_text: safeString(formData.get("hours_text")),
    latitude: safeNumber(formData.get("latitude")),
    longitude: safeNumber(formData.get("longitude")),
    address_text: safeString(formData.get("address_text")),
    area: safeString(formData.get("area")),
    district: safeString(formData.get("district")),
    city: safeString(formData.get("city")),
    severity: "medium",
  } as ReportInsert;

  reportCreateSchema.parse(input);

  const { hasImage, ...uploaded } = await uploadPublicImage(formData);
  if (!hasImage) {
    throw new Error("Please add a fresh camera photo of your food spot, menu, or stall.");
  }

  const menuUploaded = await uploadPublicMenuFile(formData);

  const report = await createPublicReport({
    ...input,
    ...uploaded,
    ...menuUploaded,
    stall_photo_url: uploaded.image_url,
    stall_photo_path: uploaded.image_path,
    verification_level: "medium",
  } as ReportInsert);

  cookieStore.set(PUBLIC_SUBMISSION_COOKIE, String(now), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: SUBMISSION_COOLDOWN_SECONDS,
    path: "/",
  });

  revalidatePath("/admin");
  redirect(`/reports/new?submitted=1&id=${report.id}`);
}
