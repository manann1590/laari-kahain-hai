import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type CardProps = {
  title?: string;
  description?: string;
  variant?: "default" | "elevated" | "interactive" | "warning" | "success" | "mapOverlay";
  children?: ReactNode;
  className?: string;
};

const variants = {
  default:
    "border-civic-line bg-white shadow-card",
  elevated:
    "border-civic-line bg-white shadow-soft",
  interactive:
    "border-civic-line bg-white shadow-card cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:border-civic-orange/50 hover:shadow-glow",
  warning:
    "border-amber-200 bg-amber-50 shadow-card",
  success:
    "border-green-200 bg-green-50 shadow-card",
  mapOverlay:
    "border-civic-line bg-white/90 shadow-soft backdrop-blur",
};

export function Card({ title, description, variant = "default", children, className }: CardProps) {
  return (
    <section className={cn("rounded-2xl border p-5", variants[variant], className)}>
      {title || description ? (
        <div className="mb-4">
          {title ? (
            <h2 className="text-xs font-bold uppercase tracking-widest text-civic-muted">{title}</h2>
          ) : null}
          {description ? (
            <p className="mt-1 text-sm leading-6 text-civic-muted">{description}</p>
          ) : null}
        </div>
      ) : null}
      {children}
    </section>
  );
}
