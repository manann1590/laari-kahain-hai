import type { ReactNode } from "react";

export function PageShell({
  eyebrow,
  title,
  description,
  actions,
  children,
}: {
  eyebrow?: string;
  title?: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="mx-auto w-full max-w-7xl min-w-0 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      {title || description || actions ? (
        <div className="mb-6 min-w-0 overflow-hidden rounded-lg border border-civic-line bg-white shadow-card">
          <div className="h-1 ticket-edge" aria-hidden="true" />
          <div className="flex min-w-0 flex-col gap-4 p-4 sm:p-6 md:flex-row md:items-end md:justify-between md:gap-6">
            <div className="min-w-0">
              {eyebrow ? (
                <p className="inline-flex max-w-full items-center rounded-full border border-civic-orange/30 bg-civic-orange/10 px-3 py-0.5 text-[11px] font-bold uppercase tracking-wide text-civic-orange">
                  {eyebrow}
                </p>
              ) : null}
              {title ? (
                <h1 className="mt-3 max-w-4xl text-2xl font-black leading-tight text-civic-text sm:text-4xl">
                  {title}
                </h1>
              ) : null}
              {description ? (
                <p className="mt-2 max-w-3xl text-sm leading-7 text-civic-muted">{description}</p>
              ) : null}
            </div>
            {actions ? (
              <div className="flex w-full min-w-0 flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap sm:justify-end">
                {actions}
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
      {children}
    </div>
  );
}
