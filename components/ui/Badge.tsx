import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Badge({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex max-w-full items-center rounded-md border px-2.5 py-1 text-xs font-bold leading-tight",
        className,
      )}
    >
      {children}
    </span>
  );
}
