"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, MapPinned, ShieldCheck, Camera } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { getCopy, type Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export function Header({ locale }: { locale: Locale }) {
  const pathname = usePathname();
  const t = getCopy(locale);
  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  const nav = [
    { href: "/", label: t.common.home, icon: Home },
    { href: "/partner", label: t.common.submit, icon: Camera },
    { href: "/map", label: t.common.publicMap, icon: MapPinned },
  ];
  const utilityNav = [
    { href: "/admin", label: t.common.admin, icon: ShieldCheck },
  ];

  return (
    <>
      {/* Top accent stripe */}
      <div className="h-1 ticket-edge" aria-hidden="true" />

      <header className="sticky top-1 z-30 border-b border-civic-line bg-white/95 shadow-card backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl min-w-0 items-center justify-between gap-3 px-4 py-2.5 sm:px-6 lg:px-8">

          {/* Logo */}
          <Link href="/" className="flex min-w-0 shrink-0 items-center gap-2.5">
            <span className="flex h-11 w-36 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-civic-line bg-white px-2 shadow-card sm:w-44">
              <Image
                src="/brand/foodradar-logo.png"
                alt="FoodRadar"
                width={900}
                height={238}
                className="h-full w-full object-contain"
              />
            </span>
            <span className="hidden min-w-0 leading-none xl:block">
              <span className="block truncate text-sm font-black">
                <span className="text-civic-orange">Food</span>
                <span className="text-civic-text">Radar</span>
              </span>
              <span className="hidden text-[10px] font-semibold text-civic-muted sm:block">
                Find Food. Live Now.
              </span>
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-0.5 md:flex" aria-label="Primary">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "inline-flex min-h-9 items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-civic-muted transition-all duration-150 hover:bg-civic-orange/10 hover:text-civic-orange focus:outline-none focus:ring-2 focus:ring-civic-orange/30",
                  isActive(item.href) &&
                    "bg-civic-orange/10 text-civic-orange ring-1 ring-civic-orange/25",
                )}
              >
                <item.icon className="h-4 w-4" aria-hidden="true" />
                {item.label}
              </Link>
            ))}

            <span className="mx-1.5 h-4 w-px bg-civic-line" aria-hidden="true" />

            {utilityNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "inline-flex min-h-9 items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-civic-muted/70 transition-all duration-150 hover:bg-civic-bg hover:text-civic-text focus:outline-none focus:ring-2 focus:ring-civic-line",
                  isActive(item.href) && "bg-civic-bg text-civic-text",
                )}
              >
                <item.icon className="h-4 w-4" aria-hidden="true" />
                {item.label}
              </Link>
            ))}
          </nav>

          {/* CTA */}
          <div className="flex min-w-0 items-center gap-2">
            <Button href="/partner" size="sm" className="hidden md:inline-flex">
              {t.common.submitIssue}
            </Button>
            <Button href="/partner" size="sm" variant="secondary" className="hidden sm:inline-flex md:hidden">
              {t.common.submit}
            </Button>
          </div>
        </div>
      </header>

      {/* Mobile bottom nav */}
      <nav
        className="fixed inset-x-0 bottom-0 z-40 border-t border-civic-line bg-white/95 px-2 pb-[calc(env(safe-area-inset-bottom)+0.4rem)] pt-2 shadow-[0_-4px_20px_rgba(49,46,129,0.12)] backdrop-blur-lg md:hidden"
        aria-label="Mobile primary"
      >
        <div className="mx-auto grid max-w-md grid-cols-3 gap-1">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex min-h-[52px] min-w-0 flex-col items-center justify-center gap-1 rounded-lg px-1 text-[10px] font-bold leading-tight text-civic-muted transition-all duration-150 hover:bg-civic-orange/10 hover:text-civic-orange focus:outline-none",
                isActive(item.href) &&
                  "bg-civic-orange text-white shadow-glow hover:bg-civic-orange hover:text-white",
              )}
            >
              <item.icon className="h-[18px] w-[18px]" aria-hidden="true" />
              <span className="w-full truncate text-center">{item.label}</span>
            </Link>
          ))}
        </div>
      </nav>
    </>
  );
}
