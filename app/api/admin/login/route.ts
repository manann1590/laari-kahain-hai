import { NextResponse } from "next/server";
import {
  getSafeAdminRedirectPath,
  setAdminCookie,
  verifyAdminCredentials,
} from "@/lib/data/admin";

export async function POST(request: Request) {
  const contentType = request.headers.get("content-type") || "";
  const isJsonRequest = contentType.includes("application/json");
  let email = "";
  let password = "";
  let next = "/admin";

  if (isJsonRequest) {
    const body = await request.json().catch(() => null);
    email = typeof body?.email === "string" ? body.email : "";
    password = typeof body?.password === "string" ? body.password : "";
    next = typeof body?.next === "string" ? body.next : "/admin";
  } else {
    const formData = await request.formData().catch(() => null);
    const emailValue = formData?.get("email");
    const passwordValue = formData?.get("password");
    const nextValue = formData?.get("next");
    email = typeof emailValue === "string" ? emailValue : "";
    password = typeof passwordValue === "string" ? passwordValue : "";
    next = typeof nextValue === "string" ? nextValue : "/admin";
  }

  const safeNext = getSafeAdminRedirectPath(next);

  if (!(await verifyAdminCredentials(email, password))) {
    if (!isJsonRequest) {
      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("next", safeNext);
      loginUrl.searchParams.set("error", "invalid");
      return NextResponse.redirect(loginUrl, { status: 303 });
    }

    return NextResponse.json({ error: "Invalid admin email or password." }, { status: 401 });
  }

  await setAdminCookie();
  if (!isJsonRequest) {
    return NextResponse.redirect(new URL(safeNext, request.url), { status: 303 });
  }

  return NextResponse.json({ ok: true });
}
