import type { Metadata } from "next";
import "leaflet/dist/leaflet.css";
import "./globals.css";
import { AppShell } from "@/components/layout/AppShell";
import { getRequestLocale } from "@/lib/i18n-server";

export const metadata: Metadata = {
  title: {
    default: "Laari Kahain Hai — Ahmedabad Street Food Map",
    template: "%s | Laari Kahain Hai",
  },
  description:
    "Find food trucks, laris, carts, and pop-ups in Ahmedabad — live locations, menus, photos, and direct contact. Where's the laari?",
  openGraph: {
    title: "Laari Kahain Hai — Ahmedabad Street Food Map",
    description:
      "Find food trucks, laris, carts, and pop-ups in Ahmedabad — live locations, menus, photos, and direct contact.",
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
