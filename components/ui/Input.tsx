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
      {label ? <span className="text-sm font-bold text-white">{label}</span> : null}
      <input
        id={inputId}
        className={cn(
          "w-full rounded-lg border border-civic-line bg-[#090f1c] px-3 text-base text-white outline-none transition placeholder:text-slate-500 focus:border-civic-teal focus:ring-2 focus:ring-civic-teal/20 sm:text-sm",
          isFile
            ? "min-h-11 py-2 file:mr-3 file:rounded-md file:border-0 file:bg-civic-green file:px-3 file:py-1.5 file:text-sm file:font-black file:text-civic-ink"
            : "h-11",
          error && "border-red-300 focus:border-red-500 focus:ring-red-100",
          className,
        )}
        {...props}
      />
      {helperText ? <p className="text-xs text-civic-muted">{helperText}</p> : null}
      {error ? <p className="text-xs text-red-700">{error}</p> : null}
    </label>
  );
}
