import type { ReactNode } from "react";
import { SearchX } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export function EmptyState({
  title,
  description,
  icon: Icon = SearchX,
  action,
  secondaryAction,
}: {
  title: string;
  description: string;
  icon?: LucideIcon;
  action?: ReactNode;
  secondaryAction?: ReactNode;
}) {
  return (
    <div className="flex min-h-64 flex-col items-center justify-center rounded-lg border border-dashed border-civic-line bg-civic-soft/80 p-8 text-center shadow-sm">
      <span className="flex h-14 w-14 items-center justify-center rounded-lg bg-civic-teal/10 text-civic-teal">
        <Icon className="h-7 w-7" aria-hidden="true" />
      </span>
      <h2 className="mt-5 text-xl font-black tracking-normal text-white">{title}</h2>
      <p className="mt-2 max-w-lg text-sm leading-6 text-civic-muted">{description}</p>
      {action || secondaryAction ? (
        <div className="mt-6 flex w-full max-w-sm flex-col gap-3 sm:w-auto sm:max-w-none sm:flex-row sm:justify-center">
          {action}
          {secondaryAction}
        </div>
      ) : null}
    </div>
  );
}
