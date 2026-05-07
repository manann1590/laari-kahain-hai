import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Badge({
  children,
  className,
  ...props
}: HTMLAttributes<HTMLSpanElement> & {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex max-w-full items-center rounded-md border px-2.5 py-1 text-xs font-semibold leading-tight",
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}
