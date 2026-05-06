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
    "bg-civic-orange text-white shadow-[0_0_0_1px_rgba(249,115,22,0.30),0_4px_16px_rgba(249,115,22,0.28)] hover:bg-orange-500 focus:ring-civic-orange",
  secondary:
    "border border-civic-line bg-white text-civic-text shadow-card hover:border-civic-orange/50 hover:bg-civic-bg focus:ring-civic-orange",
  ghost:
    "bg-transparent text-civic-text hover:bg-civic-orange/10 focus:ring-civic-orange",
  danger:
    "bg-civic-red text-white shadow-card hover:bg-red-700 focus:ring-civic-red",
  success:
    "bg-civic-success text-white shadow-card hover:bg-green-600 focus:ring-civic-success",
  outline:
    "border border-civic-orange/60 bg-transparent text-civic-orange shadow-card hover:bg-civic-orange/10 focus:ring-civic-orange",
};

const sizes = {
  sm: "min-h-9 px-3 text-xs",
  md: "min-h-10 px-4 text-sm",
  lg: "min-h-11 px-5 text-sm",
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
    "inline-flex min-w-0 items-center justify-center gap-2 rounded-xl font-bold uppercase tracking-wide transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-civic-bg disabled:cursor-not-allowed disabled:opacity-50",
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
