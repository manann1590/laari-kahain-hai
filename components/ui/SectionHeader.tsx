import type { ReactNode } from "react";

export function SectionHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-6 flex min-w-0 flex-col gap-4 sm:mb-8 md:flex-row md:items-end md:justify-between">
      <div className="min-w-0">
        {eyebrow ? (
          <p className="text-xs font-black uppercase tracking-normal text-civic-teal">{eyebrow}</p>
        ) : null}
        <h2 className="mt-2 text-2xl font-black leading-tight tracking-normal text-civic-text sm:text-3xl">
          {title}
        </h2>
        {description ? <p className="mt-3 max-w-3xl leading-7 text-civic-muted">{description}</p> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
