import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "success" | "outline";
  size?: "sm" | "md" | "lg";
  href?: string;
  loading?: boolean;
  children: ReactNode;
};

const variants = {
  primary:
    "border border-civic-orange bg-civic-orange text-white shadow-[0_8px_18px_rgba(15,118,110,0.18)] hover:bg-civic-hover focus:ring-civic-orange",
  secondary:
    "border border-civic-line bg-white text-civic-text shadow-sm hover:border-civic-orange/50 hover:bg-civic-bg focus:ring-civic-orange",
  ghost:
    "border border-transparent bg-transparent text-civic-text hover:bg-civic-orange/10 focus:ring-civic-orange",
  danger:
    "border border-civic-red bg-civic-red text-white shadow-sm hover:bg-red-700 focus:ring-civic-red",
  success:
    "border border-civic-success bg-civic-success text-white shadow-sm hover:bg-green-700 focus:ring-civic-success",
  outline:
    "border border-civic-orange/60 bg-white text-civic-orange shadow-sm hover:bg-civic-orange/10 focus:ring-civic-orange",
};

const sizes = {
  sm: "min-h-9 px-3 text-xs",
  md: "min-h-10 px-4 text-sm",
  lg: "min-h-11 px-5 text-base",
};

export function Button({
  className,
  variant = "primary",
  size = "md",
  href,
  loading = false,
  children,
  disabled,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;
  const classes = cn(
    "inline-flex min-w-0 max-w-full items-center justify-center gap-2 rounded-lg px-3 text-center font-bold leading-tight transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-civic-bg disabled:cursor-not-allowed disabled:opacity-50",
    variants[variant],
    sizes[size],
    className,
  );

  if (href) {
    return (
      <Link
        className={cn(classes, isDisabled && "pointer-events-none opacity-50")}
        href={href}
        aria-disabled={isDisabled}
      >
        {loading ? (
          <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
        ) : null}
        {children}
      </Link>
    );
  }

  return (
    <button className={classes} disabled={isDisabled} {...props}>
      {loading ? (
        <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
      ) : null}
      {children}
    </button>
  );
}
