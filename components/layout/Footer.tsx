import Link from "next/link";
import Image from "next/image";
import { MapPinned, Trophy, Camera, ShieldCheck } from "lucide-react";
import { getCopy, type Locale } from "@/lib/i18n";

export function Footer({ locale }: { locale: Locale }) {
  const t = getCopy(locale);

  const links = [
    { href: "/reports/new", label: t.common.submit, icon: Camera },
    { href: "/map", label: t.common.publicMap, icon: MapPinned },
    { href: "/leaderboard", label: t.common.leaderboard, icon: Trophy },
    { href: "/admin", label: t.common.admin, icon: ShieldCheck },
  ];

  return (
    <footer className="border-t border-civic-line bg-civic-brown text-white">
      <div className="h-1 ticket-edge" aria-hidden="true" />

      <div className="mx-auto max-w-7xl px-4 pb-24 pt-8 sm:px-6 md:pb-8 lg:px-8">
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">

          {/* Brand */}
          <div className="max-w-sm">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white shadow-card">
                <Image
                  src="/logo-lkh.png"
                  alt="Laari Kahain Hai"
                  width={40}
                  height={40}
                  className="h-full w-full object-contain"
                />
              </span>
              <div className="leading-none">
                <p className="text-sm font-black text-white">Laari Kahain Hai?</p>
                <p className="mt-0.5 text-xs text-white/55">Ahmedabad street food, live</p>
              </div>
            </div>
            <p className="mt-4 text-sm leading-6 text-white/65">
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
          <nav className="flex flex-wrap gap-x-6 gap-y-3" aria-label="Footer">
            {links.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-1.5 text-sm text-white/55 transition-colors hover:text-white"
              >
                <item.icon className="h-3.5 w-3.5" aria-hidden="true" />
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="mt-8 border-t border-white/10 pt-5 text-xs text-white/30">
          Laari Kahain Hai &mdash; Ahmedabad street food directory. All listings verified before publishing.
        </div>
      </div>
    </footer>
  );
}
