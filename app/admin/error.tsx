"use client";

import { WifiOff, RefreshCw, AlertTriangle } from "lucide-react";
import { useEffect } from "react";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Only log genuinely unexpected errors (not connection issues)
    if (!error.message?.includes("fetch") && !error.message?.includes("network")) {
      console.error("[Admin Error]", error);
    }
  }, [error]);

  const isOffline = typeof navigator !== "undefined" && !navigator.onLine;

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
      <div className="relative mb-6">
        <div className="absolute inset-0 animate-ping rounded-full bg-yellow-500/20" />
        <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-yellow-500/10 border border-yellow-500/20">
          {isOffline ? (
            <WifiOff className="h-9 w-9 text-yellow-600 dark:text-yellow-400" />
          ) : (
            <AlertTriangle className="h-9 w-9 text-yellow-600 dark:text-yellow-400" />
          )}
        </div>
      </div>

      <h2 className="mb-2 text-xl font-bold text-zinc-900 dark:text-zinc-50">
        {isOffline ? "Page Not Synced" : "Something Went Wrong"}
      </h2>
      <p className="mb-8 max-w-sm text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
        {isOffline
          ? "This page hasn't been cached for offline use yet. Please connect to the internet to load and sync it first. Billing and Kitchen are still fully available."
          : "An unexpected error occurred. You can try again or navigate to another page."}
      </p>

      <div className="flex items-center gap-3">
        <button
          onClick={reset}
          className="flex items-center gap-2 rounded-lg bg-zinc-900 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          <RefreshCw className="h-4 w-4" />
          Retry Connection
        </button>
        <a
          href="/admin/billing"
          className="flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-5 py-2.5 text-sm font-semibold text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300 dark:hover:bg-zinc-900"
        >
          Go to Billing
        </a>
      </div>

      <p className="mt-6 text-xs text-zinc-400 dark:text-zinc-600">
        Billing and Kitchen work fully offline.
      </p>
    </div>
  );
}
