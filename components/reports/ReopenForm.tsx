"use client";

import { useState, useTransition } from "react";
import { RefreshCw, X } from "lucide-react";
import { reopenReportAction } from "@/app/reports/[id]/actions";
import { getCopy, type Locale } from "@/lib/i18n";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import { Card } from "@/components/ui/Card";

export function ReopenForm({ reportId, locale = "en" }: { reportId: string; locale?: Locale }) {
  const t = getCopy(locale);
  const [expanded, setExpanded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      try {
        await reopenReportAction(formData);
        setExpanded(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      }
    });
  }

  return (
    <Card title={t.reportDetail.reopenIssue}>
      {!expanded ? (
        <div>
          <p className="mb-4 text-sm leading-6 text-civic-muted">
            {t.reportDetail.reopenCopy}
          </p>
          <Button
            type="button"
            variant="secondary"
            onClick={() => setExpanded(true)}
          >
            <RefreshCw className="h-4 w-4" aria-hidden="true" />
            {t.reportDetail.reopenIssue}
          </Button>
        </div>
      ) : (
        <form action={handleSubmit} className="space-y-4">
          <input type="hidden" name="id" value={reportId} />

          <Textarea
            label={t.reportDetail.reason}
            name="reason"
            required
            placeholder={t.reportDetail.reasonPlaceholder}
            helperText={t.reportDetail.reasonHelp}
          />

          <Textarea
            label={t.reportDetail.extraNote}
            name="note"
            placeholder={t.reportDetail.extraNotePlaceholder}
          />

          <label className="block space-y-1.5">
            <span className="text-sm font-bold text-white">{t.reportDetail.supportingPhoto}</span>
            <input
              type="file"
              name="proof_image_file"
              accept="image/*"
              className="min-h-11 w-full rounded-lg border border-civic-line bg-[#090f1c] px-3 py-2 text-base text-white outline-none transition placeholder:text-slate-500 focus:border-civic-teal focus:ring-2 focus:ring-civic-teal/20 file:mr-3 file:rounded-md file:border-0 file:bg-civic-green file:px-3 file:py-1.5 file:text-sm file:font-black file:text-civic-ink sm:text-sm"
            />
          </label>

          {error ? (
            <p className="rounded-lg border border-civic-red/40 bg-civic-red/10 px-4 py-3 text-sm text-civic-red">
              {error}
            </p>
          ) : null}

          <div className="flex flex-col gap-2 sm:flex-row">
            <Button type="submit" variant="primary" loading={isPending}>
              <RefreshCw className="h-4 w-4" aria-hidden="true" />
              {t.reportDetail.submitReopen}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setExpanded(false);
                setError(null);
              }}
              disabled={isPending}
            >
              <X className="h-4 w-4" aria-hidden="true" />
              {t.common.cancel}
            </Button>
          </div>
        </form>
      )}
    </Card>
  );
}
