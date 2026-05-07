"use client";

import { useRouter } from "next/navigation";
import { Languages } from "lucide-react";
import {
  LANGUAGE_LABELS,
  LOCALE_COOKIE,
  LOCALES,
  type Locale,
} from "@/lib/i18n";
import { cn } from "@/lib/utils";

export function LanguageSwitcher({ locale, label }: { locale: Locale; label: string }) {
  const router = useRouter();

  function changeLanguage(nextLocale: Locale) {
    document.cookie = `${LOCALE_COOKIE}=${nextLocale}; path=/; max-age=31536000; samesite=lax`;
    document.documentElement.lang = nextLocale;
    router.refresh();
  }

  return (
    <div
      className="flex items-center gap-1 rounded-xl border border-civic-line bg-white p-1 shadow-sm"
      aria-label={label}
    >
      <Languages className="ml-1.5 hidden h-4 w-4 text-civic-muted sm:block" aria-hidden="true" />
      {LOCALES.map((item) => (
        <button
          key={item}
          type="button"
          onClick={() => changeLanguage(item)}
          className={cn(
            "h-8 min-w-8 rounded-lg px-2 text-xs font-bold transition focus:outline-none focus:ring-2 focus:ring-civic-orange/30",
            locale === item
              ? "bg-civic-orange text-white"
              : "text-civic-muted hover:bg-civic-soft hover:text-civic-ink",
          )}
          aria-pressed={locale === item}
          title={LANGUAGE_LABELS[item].label}
        >
          {LANGUAGE_LABELS[item].short}
        </button>
      ))}
    </div>
  );
}
