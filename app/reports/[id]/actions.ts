"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { createAdminSupabaseClient } from "@/lib/supabase/server";
import { reopenReport, citizenVerifyResolved } from "@/lib/data/reports";
import { safeString } from "@/lib/utils";
import {
  ACCEPTED_UPLOAD_IMAGE_LABEL,
  detectUploadImageFile,
  MAX_UPLOAD_IMAGE_BYTES,
  MAX_UPLOAD_IMAGE_LABEL,
} from "@/lib/image-upload";

const REOPEN_COOLDOWN_SECONDS = 60;
const REOPEN_COOKIE = "lari_local_last_reopen";

async function uploadReopenImage(formData: FormData): Promise<string | undefined> {
  const file = formData.get("proof_image_file");
  if (!(file instanceof File) || file.size === 0) return undefined;

  if (file.size > MAX_UPLOAD_IMAGE_BYTES) {
    throw new Error(`Proof image must be ${MAX_UPLOAD_IMAGE_LABEL} or smaller.`);
  }

  const imageFormat = await detectUploadImageFile(file);
  if (!imageFormat) {
    throw new Error(`Only ${ACCEPTED_UPLOAD_IMAGE_LABEL} image uploads are supported.`);
  }

  const path = `reopen-images/${crypto.randomUUID()}.${imageFormat.extension}`;
  const supabase = createAdminSupabaseClient();
  const { error } = await supabase.storage.from("report-images").upload(path, file, {
    contentType: imageFormat.mimeType,
    upsert: false,
  });

  if (error) throw new Error(`Image upload failed: ${error.message}`);

  const { data } = supabase.storage.from("report-images").getPublicUrl(path);
  return data.publicUrl;
}

export async function reopenReportAction(formData: FormData) {
  const id = safeString(formData.get("id"));
  if (!id) throw new Error("Listing ID is required.");

  const reason = safeString(formData.get("reason"));
  if (!reason) throw new Error("A reason is required to reopen a listing.");

  const note = safeString(formData.get("note"));

  const cookieStore = await cookies();
  const lastReopen = Number(cookieStore.get(REOPEN_COOKIE)?.value || 0);
  const now = Date.now();
  if (lastReopen && now - lastReopen < REOPEN_COOLDOWN_SECONDS * 1000) {
    throw new Error("Please wait before submitting another reopen request.");
  }

  const proofImageUrl = await uploadReopenImage(formData);

  await reopenReport(id, reason, note, proofImageUrl);

  cookieStore.set(REOPEN_COOKIE, String(now), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: REOPEN_COOLDOWN_SECONDS,
    path: "/",
  });

  revalidatePath(`/reports/${id}`);
}

export async function citizenConfirmResolvedAction(formData: FormData) {
  const id = safeString(formData.get("id"));
  if (!id) throw new Error("Listing ID is required.");

  await citizenVerifyResolved(id);
  revalidatePath(`/reports/${id}`);
}
