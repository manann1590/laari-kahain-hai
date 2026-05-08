import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Vendor Access",
};

export default function PartnerPage() {
  redirect("/partner/login");
}
