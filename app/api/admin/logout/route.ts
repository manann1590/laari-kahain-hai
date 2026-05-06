import { NextResponse } from "next/server";
import { clearAdminCookie } from "@/lib/data/admin";

export async function POST() {
  await clearAdminCookie();
  return NextResponse.json({ ok: true });
}
