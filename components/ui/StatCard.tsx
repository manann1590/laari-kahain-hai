import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const tones = {
  blue:   { ring: "ring-blue-100",          icon: "bg-blue-50 text-civic-blue", value: "text-civic-blue" },
  orange: { ring: "ring-teal-100",          icon: "bg-teal-50 text-civic-orange", value: "text-civic-orange" },
  green:  { ring: "ring-green-100",         icon: "bg-green-50 text-civic-leaf",  value: "text-civic-leaf" },
  amber:  { ring: "ring-amber-100",         icon: "bg-amber-50 text-civic-amber", value: "text-civic-amber" },
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
          <p className={cn("mt-2 break-words text-3xl font-black leading-none", t.value)}>{value}</p>
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
    "min-w-0 rounded-lg border border-civic-line bg-white p-5 shadow-card ring-1",
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
