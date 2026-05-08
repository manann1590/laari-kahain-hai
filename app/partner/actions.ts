"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
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
import {
  activatePartner,
  clearPartnerCookie,
  createPartnerRequest,
  getSafePartnerRedirectPath,
  requireActivePartner,
  setPartnerCookie,
  verifyPartnerLogin,
} from "@/lib/data/partners";
import { createPartnerReport, updatePartnerReport } from "@/lib/data/reports";
import { createAdminSupabaseClient } from "@/lib/supabase/server";
import type { FoodCategory, ReportInsert } from "@/lib/supabase/types";
import { reportCreateSchema } from "@/lib/validators/report";
import { safeNumber, safeString } from "@/lib/utils";

async function uploadImage(formData: FormData): Promise<{
  image_path?: string;
  image_url?: string;
  hasImage: boolean;
}> {
  const file = formData.get("image_file");
  if (!(file instanceof File) || file.size === 0) return { hasImage: false };

  if (file.size > MAX_UPLOAD_IMAGE_BYTES) {
    throw new Error(`Image must be ${MAX_UPLOAD_IMAGE_LABEL} or smaller.`);
  }

  const imageFormat = await detectUploadImageFile(file);
  if (!imageFormat) {
    throw new Error(`Only ${ACCEPTED_UPLOAD_IMAGE_LABEL} image uploads are supported.`);
  }

  const path = `partner-submissions/${crypto.randomUUID()}.${imageFormat.extension}`;
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

async function uploadMenuFile(formData: FormData): Promise<{
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

  const path = `menus/partner/${crypto.randomUUID()}.${format.extension}`;
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

export async function requestPartnerAction(formData: FormData) {
  const password = safeString(formData.get("password")) || "";
  const confirmPassword = safeString(formData.get("confirm_password")) || "";
  if (password !== confirmPassword) throw new Error("Passwords do not match.");

  const partner = await createPartnerRequest({
    businessName: safeString(formData.get("business_name")) || "",
    ownerName: safeString(formData.get("owner_name")),
    mobile: safeString(formData.get("mobile")) || "",
    password,
    whatsapp: safeString(formData.get("whatsapp")),
    area: safeString(formData.get("area")),
    district: safeString(formData.get("district")),
    addressText: safeString(formData.get("address_text")),
  });

  await setPartnerCookie(partner.id);
  redirect("/partner/dashboard?requested=1");
}

export async function setupPartnerAction(formData: FormData) {
  const password = safeString(formData.get("password")) || "";
  const confirmPassword = safeString(formData.get("confirm_password")) || "";
  if (password !== confirmPassword) throw new Error("Passwords do not match.");

  await activatePartner({
    token: safeString(formData.get("token")) || "",
    mobile: safeString(formData.get("mobile")) || "",
    password,
    area: safeString(formData.get("area")),
    district: safeString(formData.get("district")),
    addressText: safeString(formData.get("address_text")),
  });

  redirect("/partner/dashboard?setup=1");
}

export async function loginPartnerAction(formData: FormData) {
  const next = getSafePartnerRedirectPath(safeString(formData.get("next")));
  let partner: Awaited<ReturnType<typeof verifyPartnerLogin>> | null = null;
  try {
    partner = await verifyPartnerLogin(
      safeString(formData.get("mobile")) || "",
      safeString(formData.get("password")) || "",
    );
  } catch (error) {
    if (!(error instanceof Error) || !error.message.includes("valid mobile")) throw error;
  }

  if (!partner) {
    const loginUrl = new URL("/partner/login", "https://foodradar.local");
    loginUrl.searchParams.set("error", "invalid");
    loginUrl.searchParams.set("next", next);
    redirect(`${loginUrl.pathname}${loginUrl.search}`);
  }

  await setPartnerCookie(partner.id);
  redirect(next);
}

export async function logoutPartnerAction() {
  await clearPartnerCookie();
  redirect("/partner/login");
}

function partnerListingInputFromForm(formData: FormData, partnerId: string) {
  return {
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
    partner_id: partnerId,
  } as ReportInsert;
}

export async function createPartnerListingAction(formData: FormData) {
  const partner = await requireActivePartner();

  if (safeString(formData.get("company_website"))) {
    throw new Error("Submission rejected.");
  }

  const input = partnerListingInputFromForm(formData, partner.id);

  reportCreateSchema.parse(input);

  const { hasImage, ...uploaded } = await uploadImage(formData);
  if (!hasImage) {
    throw new Error("Please add a fresh camera photo of your food spot, menu, or stall.");
  }

  const menuUploaded = await uploadMenuFile(formData);
  await createPartnerReport({
    ...input,
    ...uploaded,
    ...menuUploaded,
    stall_photo_url: uploaded.image_url,
    stall_photo_path: uploaded.image_path,
    verification_level: "medium",
  } as ReportInsert);

  revalidatePath("/admin");
  revalidatePath("/partner/dashboard");
  redirect("/partner/dashboard?submitted=1");
}

export async function updatePartnerListingAction(reportId: string, formData: FormData) {
  const partner = await requireActivePartner();

  if (safeString(formData.get("company_website"))) {
    throw new Error("Submission rejected.");
  }

  const [uploaded, menuUploaded] = await Promise.all([
    uploadImage(formData),
    uploadMenuFile(formData),
  ]);

  const imageFields = uploaded.hasImage
    ? {
        image_path: uploaded.image_path,
        image_url: uploaded.image_url,
        stall_photo_url: uploaded.image_url,
        stall_photo_path: uploaded.image_path,
      }
    : {};

  await updatePartnerReport(partner.id, reportId, {
    ...partnerListingInputFromForm(formData, partner.id),
    ...imageFields,
    ...menuUploaded,
    verification_level: "medium",
  } as ReportInsert);

  revalidatePath("/admin");
  revalidatePath("/partner/dashboard");
  revalidatePath("/map");
  revalidatePath(`/reports/${reportId}`);
  redirect("/partner/dashboard?updated=1");
}
