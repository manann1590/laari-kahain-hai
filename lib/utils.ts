import { clsx, type ClassValue } from "clsx";
import { format, formatDistanceToNowStrict, parseISO } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatDate(value: string | null | undefined) {
  if (!value) return "Not set";
  return format(parseISO(value), "dd MMM yyyy");
}

export function formatDateTime(value: string | null | undefined) {
  if (!value) return "Not set";
  return format(parseISO(value), "dd MMM yyyy, h:mm a");
}

export function timeAgo(value: string | null | undefined) {
  if (!value) return "Unknown";
  return `${formatDistanceToNowStrict(parseISO(value))} ago`;
}

export function titleFromLocation(area?: string | null, district?: string | null) {
  return [area, district].filter(Boolean).join(", ") || "Location under review";
}

export function safeNumber(value: FormDataEntryValue | null) {
  if (typeof value !== "string" || value.trim() === "") return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

export function safeString(value: FormDataEntryValue | null) {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}
