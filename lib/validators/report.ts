import { z } from "zod";
import {
  FOOD_CATEGORY_VALUES,
  SEVERITY_VALUES,
  STATUS_VALUES,
} from "@/lib/constants";
import type { FoodCategory, ReportStatus, Severity } from "@/lib/supabase/types";

const optionalText = z
  .string()
  .trim()
  .transform((value) => (value.length ? value : undefined))
  .optional();

export const reportCreateSchema = z.object({
  category: z.enum(FOOD_CATEGORY_VALUES as [FoodCategory, ...FoodCategory[]]),
  title: optionalText,
  description: optionalText,
  latitude: z.coerce.number().min(-90).max(90),
  longitude: z.coerce.number().min(-180).max(180),
  address_text: optionalText,
  area: optionalText,
  district: optionalText,
  city: optionalText,
  image_url: optionalText,
  image_path: optionalText,
  vendor_phone: optionalText,
  vendor_whatsapp: optionalText,
  vendor_website: optionalText,
  menu_text: optionalText,
  menu_image_url: optionalText,
  menu_image_path: optionalText,
  cuisine_tags: optionalText,
  price_range: optionalText,
  hours_text: optionalText,
  stall_photo_url: optionalText,
  stall_photo_path: optionalText,
  severity: z.enum(SEVERITY_VALUES as [Severity, ...Severity[]]).optional(),
  reporter_phone_hash: optionalText,
  admin_notes: optionalText,
  verification_level: z.enum(["high", "medium", "low"]).optional(),
  partner_id: optionalText,
});

export const reportUpdateSchema = reportCreateSchema
  .partial()
  .extend({
    status: z.enum(STATUS_VALUES as [ReportStatus, ...ReportStatus[]]).optional(),
    duplicate_of: optionalText,
  });

export function normalizeFoodCategory(value: unknown): FoodCategory | undefined {
  if (typeof value !== "string") return undefined;
  return FOOD_CATEGORY_VALUES.includes(value as FoodCategory) ? (value as FoodCategory) : undefined;
}

export function normalizeStatus(value: unknown): ReportStatus | undefined {
  if (typeof value !== "string") return undefined;
  return STATUS_VALUES.includes(value as ReportStatus)
    ? (value as ReportStatus)
    : undefined;
}

export function isValidLatLng(latitude: number, longitude: number) {
  return latitude >= -90 && latitude <= 90 && longitude >= -180 && longitude <= 180;
}

export function parseGoogleMapsLink(input: string): { lat: number; lng: number } | null {
  const s = input.trim();

  // /@LAT,LNG,ZOOM format (standard Google Maps URL)
  const atMatch = s.match(/@(-?\d+\.?\d*),(-?\d+\.?\d*)/);
  if (atMatch) {
    const lat = Number(atMatch[1]);
    const lng = Number(atMatch[2]);
    if (isValidLatLng(lat, lng)) return { lat, lng };
  }

  // ?q=LAT,LNG or &q=LAT,LNG
  const qMatch = s.match(/[?&]q=(-?\d+\.?\d*),(-?\d+\.?\d*)/);
  if (qMatch) {
    const lat = Number(qMatch[1]);
    const lng = Number(qMatch[2]);
    if (isValidLatLng(lat, lng)) return { lat, lng };
  }

  // Plain "LAT,LNG" coordinate string
  const coordMatch = s.match(/^(-?\d{1,3}\.?\d*),\s*(-?\d{1,3}\.?\d*)$/);
  if (coordMatch) {
    const lat = Number(coordMatch[1]);
    const lng = Number(coordMatch[2]);
    if (isValidLatLng(lat, lng)) return { lat, lng };
  }

  return null;
}
