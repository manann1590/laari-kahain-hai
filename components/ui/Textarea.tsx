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
      {label ? <span className="text-sm font-bold text-civic-text">{label}</span> : null}
      <textarea
        id={textareaId}
        className={cn(
          "min-h-32 w-full min-w-0 rounded-lg border border-civic-line bg-white px-3 py-2.5 text-base text-civic-text outline-none transition placeholder:text-civic-muted/75 focus:border-civic-orange focus:ring-2 focus:ring-civic-orange/20 sm:text-sm",
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
