import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createAdminSupabaseClient } from "@/lib/supabase/server";
import { serverConfig } from "@/lib/server-config";
import type { PartnerAccount, PartnerStatus } from "@/lib/supabase/types";

export const PARTNER_COOKIE_NAME = "foodradar_partner";

const PARTNER_REDIRECT_BASE = "https://foodradar.local";
const PASSWORD_ITERATIONS = 150_000;

function bytesToBase64(bytes: Uint8Array) {
  return Buffer.from(bytes).toString("base64");
}

function base64ToBytes(value: string) {
  return new Uint8Array(Buffer.from(value, "base64"));
}

function constantTimeEqual(left: string, right: string) {
  const length = Math.max(left.length, right.length);
  let mismatch = left.length ^ right.length;

  for (let index = 0; index < length; index += 1) {
    const leftCode = index < left.length ? left.charCodeAt(index) : 0;
    const rightCode = index < right.length ? right.charCodeAt(index) : 0;
    mismatch |= leftCode ^ rightCode;
  }

  return mismatch === 0;
}

async function sha256(value: string) {
  const hash = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return [...new Uint8Array(hash)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

function normalizeMobile(value: string) {
  return value.replace(/\D/g, "");
}

async function mobileHash(mobile: string) {
  const normalized = normalizeMobile(mobile);
  if (normalized.length < 10) throw new Error("Enter a valid mobile number.");
  return sha256(normalized);
}

function encryptionSecret() {
  const secret =
    process.env.PARTNER_FIELD_SECRET ||
    serverConfig.adminPassword ||
    serverConfig.supabaseServiceRoleKey;
  if (!secret) throw new Error("Missing PARTNER_FIELD_SECRET, ADMIN_PASSWORD, or SUPABASE_SERVICE_ROLE_KEY.");
  return secret;
}

async function encryptionKey() {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(encryptionSecret()));
  return crypto.subtle.importKey("raw", digest, "AES-GCM", false, ["encrypt"]);
}

async function encryptText(value?: string) {
  if (!value) return undefined;
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await encryptionKey();
  const cipher = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    new TextEncoder().encode(value),
  );
  return `${bytesToBase64(iv)}.${bytesToBase64(new Uint8Array(cipher))}`;
}

async function passwordDigest(password: string, salt = crypto.getRandomValues(new Uint8Array(16))) {
  if (password.length < 8) throw new Error("Password must be at least 8 characters.");
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", hash: "SHA-256", salt, iterations: PASSWORD_ITERATIONS },
    key,
    256,
  );
  return {
    salt: bytesToBase64(salt),
    hash: bytesToBase64(new Uint8Array(bits)),
  };
}

async function verifyPassword(password: string, hash: string, salt: string) {
  const digest = await passwordDigest(password, base64ToBytes(salt));
  return constantTimeEqual(digest.hash, hash);
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

export function getSafePartnerRedirectPath(value: string | null | undefined) {
  if (!value) return "/partner/dashboard";

  try {
    const url = new URL(value, PARTNER_REDIRECT_BASE);
    const isSameOrigin = url.origin === PARTNER_REDIRECT_BASE;
    const isPartnerPath = url.pathname === "/partner" || url.pathname.startsWith("/partner/");
    const isAuthPath = url.pathname === "/partner/login" || url.pathname.startsWith("/partner/setup");

    if (!isSameOrigin || !isPartnerPath || isAuthPath) return "/partner/dashboard";
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return "/partner/dashboard";
  }
}

async function partnerSessionValue(partnerId: string) {
  return `${partnerId}.${await sha256(`${partnerId}:${encryptionSecret()}`)}`;
}

export async function setPartnerCookie(partnerId: string) {
  const cookieStore = await cookies();
  cookieStore.set(PARTNER_COOKIE_NAME, await partnerSessionValue(partnerId), {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 30,
    path: "/",
  });
}

export async function clearPartnerCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(PARTNER_COOKIE_NAME);
}

export async function getPartnerSession() {
  const cookieStore = await cookies();
  const value = cookieStore.get(PARTNER_COOKIE_NAME)?.value;
  const partnerId = value?.split(".")[0];
  if (!partnerId || !constantTimeEqual(value || "", await partnerSessionValue(partnerId))) return null;

  const { data, error } = await adminClient()
    .from("partner_accounts")
    .select("*")
    .eq("id", partnerId)
    .eq("status", "active")
    .maybeSingle();

  if (error) throwSupabaseError("Could not load partner session", error);
  return data as PartnerAccount | null;
}

export async function requirePartner() {
  const partner = await getPartnerSession();
  if (!partner) redirect("/partner/login");
  return partner;
}

export async function createPartnerRequest(input: {
  businessName: string;
  ownerName?: string;
  mobile: string;
  whatsapp?: string;
  area?: string;
  district?: string;
  addressText?: string;
}) {
  const hash = await mobileHash(input.mobile);
  const { data: existing, error: existingError } = await adminClient()
    .from("partner_accounts")
    .select("*")
    .eq("mobile_hash", hash)
    .maybeSingle();

  if (existingError) throwSupabaseError("Could not check partner request", existingError);
  if (existing) throw new Error("A partner request already exists for this mobile number.");

  const { data, error } = await adminClient()
    .from("partner_accounts")
    .insert({
      business_name: input.businessName,
      owner_name: input.ownerName,
      mobile_hash: hash,
      mobile_encrypted: await encryptText(normalizeMobile(input.mobile)),
      whatsapp_encrypted: await encryptText(input.whatsapp ? normalizeMobile(input.whatsapp) : undefined),
      area: input.area,
      district: input.district || "Ahmedabad",
      address_text: input.addressText,
      city: "Ahmedabad",
      status: "pending",
    })
    .select("*")
    .single();

  if (error) throwSupabaseError("Could not create partner request", error);
  return data as PartnerAccount;
}

export async function getPartnerRequests(status?: PartnerStatus | "all") {
  let query = adminClient()
    .from("partner_accounts")
    .select("*")
    .order("created_at", { ascending: false });

  if (status && status !== "all") query = query.eq("status", status);

  const { data, error } = await query;
  if (error) throwSupabaseError("Could not load partner requests", error);
  return (data || []) as PartnerAccount[];
}

export async function approvePartnerRequest(partnerId: string) {
  const token = `${crypto.randomUUID()}-${bytesToBase64(crypto.getRandomValues(new Uint8Array(18)))}`;
  const { data, error } = await adminClient()
    .from("partner_accounts")
    .update({
      status: "approved",
      onboarding_token_hash: await sha256(token),
      approved_at: new Date().toISOString(),
      rejected_at: null,
      rejection_note: null,
    })
    .eq("id", partnerId)
    .select("*")
    .single();

  if (error) throwSupabaseError("Could not approve partner", error);
  return { partner: data as PartnerAccount, token };
}

export async function rejectPartnerRequest(partnerId: string, note?: string) {
  const { data, error } = await adminClient()
    .from("partner_accounts")
    .update({
      status: "rejected",
      rejection_note: note,
      rejected_at: new Date().toISOString(),
    })
    .eq("id", partnerId)
    .select("*")
    .single();

  if (error) throwSupabaseError("Could not reject partner", error);
  return data as PartnerAccount;
}

export async function getPartnerBySetupToken(token: string) {
  if (!token) return null;
  const { data, error } = await adminClient()
    .from("partner_accounts")
    .select("*")
    .eq("onboarding_token_hash", await sha256(token))
    .eq("status", "approved")
    .maybeSingle();

  if (error) throwSupabaseError("Could not load partner setup request", error);
  return data as PartnerAccount | null;
}

export async function activatePartner(input: {
  token: string;
  mobile: string;
  password: string;
  area?: string;
  district?: string;
  addressText?: string;
}) {
  const partner = await getPartnerBySetupToken(input.token);
  if (!partner) throw new Error("This setup link is invalid or expired.");
  const hash = await mobileHash(input.mobile);
  if (!constantTimeEqual(hash, partner.mobile_hash)) {
    throw new Error("Mobile number does not match this approved partner request.");
  }

  const password = await passwordDigest(input.password);
  const { data, error } = await adminClient()
    .from("partner_accounts")
    .update({
      password_hash: password.hash,
      password_salt: password.salt,
      mobile_encrypted: await encryptText(normalizeMobile(input.mobile)),
      area: input.area || partner.area,
      district: input.district || partner.district || "Ahmedabad",
      address_text: input.addressText || partner.address_text,
      status: "active",
      onboarding_token_hash: null,
      activated_at: new Date().toISOString(),
    })
    .eq("id", partner.id)
    .select("*")
    .single();

  if (error) throwSupabaseError("Could not activate partner account", error);
  await setPartnerCookie(partner.id);
  return data as PartnerAccount;
}

export async function verifyPartnerLogin(mobile: string, password: string) {
  const hash = await mobileHash(mobile);
  const { data, error } = await adminClient()
    .from("partner_accounts")
    .select("*")
    .eq("mobile_hash", hash)
    .eq("status", "active")
    .maybeSingle();

  if (error) throwSupabaseError("Could not verify partner login", error);
  const partner = data as PartnerAccount | null;
  if (!partner?.password_hash || !partner.password_salt) return null;
  if (!(await verifyPassword(password, partner.password_hash, partner.password_salt))) return null;
  return partner;
}
