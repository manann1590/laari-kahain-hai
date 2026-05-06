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
      {label ? <span className="text-sm font-bold text-white">{label}</span> : null}
      <select
        id={selectId}
        className={cn(
          "h-11 w-full rounded-lg border border-civic-line bg-[#090f1c] px-3 text-base text-white outline-none transition focus:border-civic-teal focus:ring-2 focus:ring-civic-teal/20 sm:text-sm",
          error && "border-red-300 focus:border-red-500 focus:ring-red-100",
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
      {error ? <p className="text-xs text-red-700">{error}</p> : null}
    </label>
  );
}
