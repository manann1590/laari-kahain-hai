"use client";

import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="flex min-h-64 flex-col items-center justify-center rounded-lg border border-dashed border-civic-red/40 bg-white p-8 text-center shadow-sm">
        <span className="flex h-14 w-14 items-center justify-center rounded-lg bg-civic-red/10 text-civic-red">
          <AlertTriangle className="h-7 w-7" aria-hidden="true" />
        </span>
        <h2 className="mt-5 text-xl font-black tracking-normal text-civic-text">Something went wrong</h2>
        <p className="mt-2 max-w-lg text-sm leading-6 text-civic-muted">
          {error.message || "The page could not be loaded. Please try again."}
        </p>
        <Button type="button" onClick={reset} className="mt-6">
          Try again
        </Button>
      </div>
    </div>
  );
}
