"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/data/admin";
import {
  createAmcBatch,
  addReportsToBatch,
  generateBatchEmailBody,
  markBatchSent,
} from "@/lib/data/amc";

export async function createAmcBatchAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const weekStart = formData.get("week_start");
  const weekEnd = formData.get("week_end");
  if (typeof weekStart !== "string" || !weekStart.trim()) {
    throw new Error("Week start date is required.");
  }
  if (typeof weekEnd !== "string" || !weekEnd.trim()) {
    throw new Error("Week end date is required.");
  }
  const batch = await createAmcBatch(weekStart.trim(), weekEnd.trim());
  revalidatePath("/admin/amc");
  redirect(`/admin/amc?batch=${batch.id}`);
}

export async function addReportsToBatchAction(
  batchId: string,
  formData: FormData,
): Promise<void> {
  await requireAdmin();
  const reportIds: string[] = [];
  for (const [key, value] of formData.entries()) {
    if (key === "report_id" && typeof value === "string" && value.trim()) {
      reportIds.push(value.trim());
    }
  }
  if (reportIds.length === 0) {
    throw new Error("Select at least one listing to add.");
  }
  await addReportsToBatch(batchId, reportIds);
  revalidatePath("/admin/amc");
  redirect(`/admin/amc?batch=${batchId}`);
}

export async function generateEmailBodyAction(batchId: string): Promise<string> {
  await requireAdmin();
  const body = await generateBatchEmailBody(batchId);
  revalidatePath("/admin/amc");
  return body;
}

export async function markBatchSentAction(
  batchId: string,
  formData: FormData,
): Promise<void> {
  await requireAdmin();
  const sentTo = formData.get("sent_to");
  const cc = formData.get("cc");
  const subject = formData.get("subject");
  if (typeof sentTo !== "string" || !sentTo.trim()) {
    throw new Error("Recipient email (sent_to) is required.");
  }
  await markBatchSent(
    batchId,
    sentTo.trim(),
    typeof cc === "string" && cc.trim() ? cc.trim() : undefined,
    typeof subject === "string" && subject.trim() ? subject.trim() : undefined,
  );
  revalidatePath("/admin/amc");
  redirect(`/admin/amc?batch=${batchId}`);
}
