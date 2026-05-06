import type { TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string;
  error?: string;
  helperText?: string;
};

export function Textarea({
  label,
  error,
  helperText,
  className,
  id,
  ...props
}: TextareaProps) {
  const textareaId = id || props.name;
  return (
    <label className="block space-y-1.5" htmlFor={textareaId}>
      {label ? <span className="text-sm font-bold text-white">{label}</span> : null}
      <textarea
        id={textareaId}
        className={cn(
          "min-h-32 w-full rounded-lg border border-civic-line bg-[#090f1c] px-3 py-2.5 text-base text-white outline-none transition placeholder:text-slate-500 focus:border-civic-teal focus:ring-2 focus:ring-civic-teal/20 sm:text-sm",
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
