"use client";

import { AlertTriangle } from "lucide-react";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="flex min-h-64 flex-col items-center justify-center rounded-lg border border-dashed border-civic-red/40 bg-civic-soft/80 p-8 text-center shadow-sm">
        <span className="flex h-14 w-14 items-center justify-center rounded-lg bg-civic-red/10 text-civic-red">
          <AlertTriangle className="h-7 w-7" aria-hidden="true" />
        </span>
        <h2 className="mt-5 text-xl font-black tracking-normal text-white">Something went wrong</h2>
        <p className="mt-2 max-w-lg text-sm leading-6 text-civic-muted">
          {error.message || "The page could not be loaded. Please try again."}
        </p>
        <button
          type="button"
          onClick={reset}
          className="mt-6 inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-civic-green px-4 text-sm font-black uppercase tracking-normal text-civic-ink shadow-sm transition duration-200 hover:bg-[#d7ff76] focus:outline-none focus:ring-2 focus:ring-civic-green focus:ring-offset-2 focus:ring-offset-civic-ink"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
