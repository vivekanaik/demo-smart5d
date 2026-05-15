"use client";

import { WifiOff, RefreshCw } from "lucide-react";

interface Props {
  title?: string;
  description?: string;
  /** If true, also show a Reload button */
  showReload?: boolean;
}

/**
 * A graceful offline page — shown inside any admin section
 * when the page loaded but has no data because DB was unreachable.
 */
export function OfflineFallback({
  title = "Page Not Synced",
  description = "This page hasn't been cached for offline use yet. Please connect to the internet to load and sync it first.",
  showReload = true,
}: Props) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
      <div className="relative mb-6">
        {/* Pulsing ring */}
        <div className="absolute inset-0 animate-ping rounded-full bg-yellow-500/20" />
        <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-yellow-500/10 border border-yellow-500/20">
          <WifiOff className="h-9 w-9 text-yellow-600 dark:text-yellow-400" />
        </div>
      </div>

      <h2 className="mb-2 text-xl font-bold text-zinc-900 dark:text-zinc-50">
        {title}
      </h2>
      <p className="mb-8 max-w-sm text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
        {description}
      </p>

      {showReload && (
        <button
          onClick={() => window.location.reload()}
          className="flex items-center gap-2 rounded-lg bg-zinc-900 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          <RefreshCw className="h-4 w-4" />
          Retry Connection
        </button>
      )}

      <p className="mt-6 text-xs text-zinc-400 dark:text-zinc-600">
        Billing and Kitchen are still available offline.
      </p>
    </div>
  );
}
