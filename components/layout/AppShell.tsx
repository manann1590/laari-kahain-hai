import type { ReactNode } from "react";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import type { Locale } from "@/lib/i18n";

export function AppShell({ children, locale }: { children: ReactNode; locale: Locale }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header locale={locale} />
      <main className="flex-1 pb-28 md:pb-0">{children}</main>
      <Footer locale={locale} />
    </div>
  );
}
