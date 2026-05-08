import type { ReactNode } from "react";
import { Header } from "@/components/layout/Header";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen min-w-0 flex-col overflow-x-clip">
      <Header />
      <main className="min-w-0 flex-1">{children}</main>
    </div>
  );
}
