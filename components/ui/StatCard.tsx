import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const tones = {
  blue:   { ring: "ring-blue-200",          icon: "bg-blue-50   text-blue-600",   value: "text-blue-600" },
  orange: { ring: "ring-orange-200",         icon: "bg-orange-50 text-civic-orange", value: "text-civic-orange" },
  green:  { ring: "ring-green-200",          icon: "bg-green-50  text-green-600",  value: "text-green-600" },
  amber:  { ring: "ring-amber-200",          icon: "bg-amber-50  text-amber-600",  value: "text-amber-600" },
  slate:  { ring: "ring-civic-line",         icon: "bg-civic-bg  text-civic-muted", value: "text-civic-text" },
};

export function StatCard({
  icon: Icon,
  value,
  label,
  helperText,
  tone = "blue",
  href,
  className,
}: {
  icon: LucideIcon;
  value: string | number;
  label: string;
  helperText?: string;
  tone?: "blue" | "orange" | "green" | "amber" | "slate";
  href?: string;
  className?: string;
}) {
  const t = tones[tone];

  const inner = (
    <>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-widest text-civic-muted">{label}</p>
          <p className={cn("mt-2 text-3xl font-black leading-none", t.value)}>{value}</p>
        </div>
        <span className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl", t.icon)}>
          <Icon className="h-5 w-5" aria-hidden="true" />
        </span>
      </div>
      {helperText ? (
        <p className="mt-3 text-xs leading-5 text-civic-muted">{helperText}</p>
      ) : null}
    </>
  );

  const baseClass = cn(
    "rounded-2xl border border-civic-line bg-white p-5 shadow-card ring-1",
    t.ring,
    href && "cursor-pointer transition-shadow hover:shadow-md hover:ring-2",
    className,
  );

  if (href) {
    return (
      <Link href={href} className={baseClass}>
        {inner}
      </Link>
    );
  }

  return (
    <div className={baseClass}>
      {inner}
    </div>
  );
}
