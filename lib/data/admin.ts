import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { serverConfig } from "@/lib/server-config";

export const ADMIN_COOKIE_NAME = "foodradar_admin";
const ADMIN_REDIRECT_BASE = "https://foodradar.local";

async function sha256(value: string) {
  const bytes = new TextEncoder().encode(value);
  const hash = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(hash)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
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

export async function createAdminSessionValue() {
  if (!serverConfig.adminEmail || !serverConfig.adminPassword) return "";
  return sha256(`${serverConfig.adminEmail}:${serverConfig.adminPassword}`);
}

export async function verifyAdminCredentials(email: string, password: string) {
  if (!serverConfig.adminEmail || !serverConfig.adminPassword) return false;
  const actual = await sha256(`${email}:${password}`);
  const expected = await createAdminSessionValue();
  return constantTimeEqual(actual, expected);
}

export function getSafeAdminRedirectPath(value: string | null | undefined) {
  if (!value) return "/admin";

  try {
    const url = new URL(value, ADMIN_REDIRECT_BASE);
    const isSameOrigin = url.origin === ADMIN_REDIRECT_BASE;
    const isAdminPath = url.pathname === "/admin" || url.pathname.startsWith("/admin/");
    const isLoginPath = url.pathname === "/admin/login" || url.pathname.startsWith("/admin/login/");

    if (!isSameOrigin || !isAdminPath || isLoginPath) return "/admin";

    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return "/admin";
  }
}

export async function isAdminAuthenticated() {
  const cookieStore = await cookies();
  const value = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
  if (!value) return false;
  return constantTimeEqual(value, await createAdminSessionValue());
}

export async function requireAdmin() {
  if (!(await isAdminAuthenticated())) {
    redirect("/admin/login");
  }
}

export async function setAdminCookie() {
  const cookieStore = await cookies();
  cookieStore.set(ADMIN_COOKIE_NAME, await createAdminSessionValue(), {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 8,
    path: "/",
  });
}

export async function clearAdminCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_COOKIE_NAME);
}
