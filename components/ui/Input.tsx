import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
  helperText?: string;
};

export function Input({ label, error, helperText, className, id, ...props }: InputProps) {
  const inputId = id || props.name;
  const isFile = props.type === "file";
  return (
    <label className="block space-y-1.5" htmlFor={inputId}>
      {label ? <span className="text-sm font-bold text-civic-text">{label}</span> : null}
      <input
        id={inputId}
        className={cn(
          "w-full min-w-0 rounded-lg border border-civic-line bg-white px-3 text-base text-civic-text outline-none transition placeholder:text-civic-muted/75 focus:border-civic-orange focus:ring-2 focus:ring-civic-orange/20 sm:text-sm",
          isFile
            ? "min-h-11 py-2 file:mr-3 file:rounded-md file:border-0 file:bg-civic-orange file:px-3 file:py-1.5 file:text-sm file:font-black file:text-white"
            : "h-11",
          error && "border-civic-error focus:border-civic-error focus:ring-civic-error/20",
          className,
        )}
        {...props}
      />
      {helperText ? <p className="text-xs text-civic-muted">{helperText}</p> : null}
      {error ? <p className="text-xs text-civic-red">{error}</p> : null}
    </label>
  );
}
