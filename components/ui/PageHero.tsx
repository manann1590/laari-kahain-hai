import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function PageHero({
  eyebrow,
  title,
  description,
  primaryAction,
  secondaryAction,
  visual,
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  primaryAction?: ReactNode;
  secondaryAction?: ReactNode;
  visual?: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("relative overflow-hidden border-b border-civic-line bg-civic-ink", className)}>
      <div className="absolute inset-0 civic-grid opacity-45" aria-hidden="true" />
      <div className="absolute inset-x-0 top-0 h-1.5 ticket-edge" aria-hidden="true" />
      <div className="relative mx-auto grid max-w-7xl min-w-0 gap-8 px-4 py-10 sm:px-6 sm:py-14 lg:grid-cols-[1.02fr_0.98fr] lg:px-8 lg:py-16">
        <div className="flex min-w-0 flex-col justify-center">
          {eyebrow ? (
            <p className="mb-4 inline-flex w-fit rounded-md border border-civic-orange/30 bg-civic-orange/10 px-3 py-1 text-xs font-black uppercase tracking-normal text-civic-orange shadow-sm">
              {eyebrow}
            </p>
          ) : null}
          <h1 className="max-w-4xl text-3xl font-black leading-tight tracking-normal text-white sm:text-5xl lg:text-6xl">
            {title}
          </h1>
          {description ? <p className="mt-5 max-w-2xl text-lg leading-8 text-civic-muted">{description}</p> : null}
          {primaryAction || secondaryAction ? (
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              {primaryAction}
              {secondaryAction}
            </div>
          ) : null}
        </div>
        {visual ? <div className="relative">{visual}</div> : null}
      </div>
    </section>
  );
}
