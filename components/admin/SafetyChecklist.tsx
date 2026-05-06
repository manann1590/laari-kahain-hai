"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { CheckCircle2, Circle, ShieldCheck } from "lucide-react";
import { approveReportAction } from "@/app/admin/actions";
import { cn } from "@/lib/utils";

const CHECKLIST_ITEMS = [
  "No faces or identifiable people in image",
  "No vehicle registration plates visible",
  "No private property interiors shown",
  "Food vendor, menu, or stall is clearly visible in the photo or description",
  "Location coordinates appear valid",
  "Not a duplicate of another open vendor listing",
  "Description is factual and non-abusive",
] as const;

function ApproveButton({ allChecked }: { allChecked: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={!allChecked || pending}
      className={cn(
        "inline-flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-black uppercase tracking-normal transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-civic-ink",
        allChecked && !pending
          ? "bg-civic-green text-civic-ink shadow-sm hover:bg-[#d7ff76] focus:ring-civic-green"
          : "cursor-not-allowed bg-civic-green/10 text-civic-green/45",
      )}
    >
      <ShieldCheck className="h-4 w-4" aria-hidden="true" />
      {pending ? "Approving..." : "Approve listing"}
    </button>
  );
}

export function SafetyChecklist({ reportId }: { reportId: string }) {
  const [checked, setChecked] = useState<boolean[]>(
    () => CHECKLIST_ITEMS.map(() => false),
  );

  const checkedCount = checked.filter(Boolean).length;
  const allChecked = checkedCount === CHECKLIST_ITEMS.length;

  function toggle(index: number) {
    setChecked((prev) => {
      const next = [...prev];
      next[index] = !next[index];
      return next;
    });
  }

  return (
    <div className="space-y-4">
      <ul className="space-y-2">
        {CHECKLIST_ITEMS.map((item, index) => {
          const isChecked = checked[index];
          return (
            <li key={item}>
              <label
                className={cn(
                  "flex cursor-pointer items-start gap-3 rounded-lg border p-3 text-sm transition",
                  isChecked
                    ? "border-civic-green/35 bg-civic-green/10 text-civic-green"
                    : "border-civic-amber/35 bg-civic-amber/10 text-civic-amber hover:border-civic-amber",
                )}
              >
                <span className="mt-0.5 shrink-0" aria-hidden="true">
                  {isChecked ? (
                    <CheckCircle2 className="h-4 w-4 text-civic-green" />
                  ) : (
                    <Circle className="h-4 w-4 text-civic-amber" />
                  )}
                </span>
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={isChecked}
                  onChange={() => toggle(index)}
                />
                {item}
              </label>
            </li>
          );
        })}
      </ul>

      <p className="text-xs font-medium text-civic-muted">
        {allChecked ? (
          <span className="text-civic-green">
            {CHECKLIST_ITEMS.length} / {CHECKLIST_ITEMS.length} items verified
          </span>
        ) : (
          <span>
            {checkedCount} / {CHECKLIST_ITEMS.length} items verified
          </span>
        )}
      </p>

      <form action={approveReportAction.bind(null, reportId)}>
        <ApproveButton allChecked={allChecked} />
      </form>
    </div>
  );
}
