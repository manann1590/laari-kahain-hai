import type { Metadata } from "next";
import "leaflet/dist/leaflet.css";
import "./globals.css";
import { AppShell } from "@/components/layout/AppShell";
import { getRequestLocale } from "@/lib/i18n-server";

export const metadata: Metadata = {
  title: {
    default: "FoodRadar - Ahmedabad Street Food Map",
    template: "%s | FoodRadar",
  },
  description:
    "Find verified Ahmedabad street-food vendors with menus, photos, phone, WhatsApp, directions, and live location.",
  openGraph: {
    title: "FoodRadar - Ahmedabad Street Food Map",
    description:
      "Verified street-food listings, live discovery, menus, and direct vendor contact in Ahmedabad.",
    type: "website",
  },
  icons: {
    icon: "/brand/foodradar-icon.png",
    apple: "/brand/foodradar-icon.png",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getRequestLocale();

  return (
    <html lang={locale}>
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
