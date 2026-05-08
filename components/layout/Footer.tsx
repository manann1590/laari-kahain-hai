import Image from "next/image";
import Link from "next/link";
import { MapPinned } from "lucide-react";
import { getCopy, type Locale } from "@/lib/i18n";

export function Footer({ locale }: { locale: Locale }) {
  const t = getCopy(locale);

  const links = [
    { href: "/map", label: t.common.publicMap, icon: MapPinned },
  ];

  return (
    <footer className="border-t border-civic-line bg-civic-brown text-white">
      <div className="h-1 ticket-edge" aria-hidden="true" />

      <div className="mx-auto max-w-7xl min-w-0 px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex min-w-0 flex-col gap-8 md:flex-row md:items-start md:justify-between">

          {/* Brand */}
          <div className="max-w-sm min-w-0">
            <div className="flex min-w-0 items-center gap-3">
              <span className="flex h-12 w-40 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-white/10 bg-white px-2 shadow-card sm:w-44">
                <Image
                  src="/brand/foodradar-logo.png"
                  alt="FoodRadar"
                  width={900}
                  height={238}
                  className="h-full w-full object-contain"
                />
              </span>
              <div className="hidden leading-none sm:block">
                <p className="text-sm font-black">
                  <span className="text-civic-orange">Food</span>
                  <span className="text-white">Radar</span>
                </p>
                <p className="mt-0.5 text-xs text-white/60">Find Food. Live Now.</p>
              </div>
            </div>
            <p className="mt-4 text-sm leading-6 text-white/70">
              {t.footer.copy}
            </p>
            <p className="mt-3 text-xs text-white/40">
              {t.footer.createdBy}{" "}
              <Link
                href="https://www.linkedin.com/in/manann-agarwal/"
                className="font-semibold text-civic-yellow hover:text-civic-hover transition-colors"
              >
                Manann Agarwal
              </Link>
            </p>
          </div>

          {/* Nav */}
          <nav className="flex flex-wrap gap-x-5 gap-y-3" aria-label="Footer">
            {links.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-1.5 text-sm text-white/60 transition-colors hover:text-white"
              >
                <item.icon className="h-3.5 w-3.5" aria-hidden="true" />
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="mt-8 border-t border-white/10 pt-5 text-xs text-white/30">
          FoodRadar &mdash; Ahmedabad street food directory. All listings verified before publishing.
        </div>
      </div>
    </footer>
  );
}
