import type { Metadata } from "next";
import "leaflet/dist/leaflet.css";
import "./globals.css";
import { AppShell } from "@/components/layout/AppShell";
import { getRequestLocale } from "@/lib/i18n-server";

export const metadata: Metadata = {
  title: {
    default: "FoodRadar — Ahmedabad Street Food Map",
    template: "%s | FoodRadar",
  },
  description:
    "Find food trucks, carts, and street food spots in Ahmedabad — live locations, menus, photos, and direct contact. Find Food. Live Now.",
  openGraph: {
    title: "FoodRadar — Ahmedabad Street Food Map",
    description:
      "Find food trucks, carts, and street food spots in Ahmedabad — live locations, menus, photos, and direct contact.",
    type: "website",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getRequestLocale();

  return (
    <html lang="en">
      <body>
        <AppShell locale={locale}>{children}</AppShell>
      </body>
    </html>
  );
}
