import { cn } from "@/lib/utils";

export function Loading({ label = "Loading", className }: { label?: string; className?: string }) {
  return (
    <div className={cn("flex items-center gap-3 text-sm text-civic-muted", className)}>
      <span className="h-4 w-4 animate-spin rounded-full border-2 border-civic-line border-t-civic-orange" />
      {label ? <span>{label}</span> : null}
    </div>
  );
}
