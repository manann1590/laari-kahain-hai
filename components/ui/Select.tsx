import type { SelectHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type Option = {
  value: string;
  label: string;
};

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string;
  options: Option[];
  error?: string;
  helperText?: string;
};

export function Select({
  label,
  options,
  error,
  helperText,
  className,
  id,
  ...props
}: SelectProps) {
  const selectId = id || props.name;
  return (
    <label className="block space-y-1.5" htmlFor={selectId}>
      {label ? <span className="text-sm font-bold text-civic-text">{label}</span> : null}
      <select
        id={selectId}
        className={cn(
          "h-11 w-full min-w-0 rounded-lg border border-civic-line bg-white px-3 text-base text-civic-text outline-none transition focus:border-civic-orange focus:ring-2 focus:ring-civic-orange/20 sm:text-sm",
          error && "border-civic-error focus:border-civic-error focus:ring-civic-error/20",
          className,
        )}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {helperText ? <p className="text-xs text-civic-muted">{helperText}</p> : null}
      {error ? <p className="text-xs text-civic-red">{error}</p> : null}
    </label>
  );
}
