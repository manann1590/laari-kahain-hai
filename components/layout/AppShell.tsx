import type { ReactNode } from "react";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import type { Locale } from "@/lib/i18n";
import { isAdminAuthenticated } from "@/lib/data/admin";

export async function AppShell({ children, locale }: { children: ReactNode; locale: Locale }) {
  const isAdmin = await isAdminAuthenticated();

  return (
    <div className="flex min-h-screen min-w-0 flex-col overflow-x-clip">
      <Header locale={locale} isAdmin={isAdmin} />
      <main className="min-w-0 flex-1 pb-28 md:pb-0">{children}</main>
      <Footer locale={locale} />
    </div>
  );
}
