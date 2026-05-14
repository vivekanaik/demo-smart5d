// Notifications page skeleton
export default function NotificationsLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-8 w-48 rounded-lg bg-zinc-200 dark:bg-zinc-800" />
          <div className="h-4 w-72 rounded bg-zinc-200 dark:bg-zinc-800" />
        </div>
        <div className="h-9 w-9 rounded-lg bg-zinc-200 dark:bg-zinc-800" />
      </div>

      {/* Category tabs */}
      <div className="flex gap-2 flex-wrap">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-8 w-28 rounded-full bg-zinc-200 dark:bg-zinc-800" />
        ))}
      </div>

      {/* Notification cards */}
      <div className="space-y-3">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
            <div className="flex items-start gap-3">
              <div className="h-9 w-9 rounded-full bg-zinc-200 dark:bg-zinc-800 flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="h-4 w-48 rounded bg-zinc-200 dark:bg-zinc-800" />
                  <div className="h-3 w-16 rounded bg-zinc-200 dark:bg-zinc-800" />
                </div>
                <div className="h-3 w-full rounded bg-zinc-200 dark:bg-zinc-800" />
                <div className="h-3 w-3/4 rounded bg-zinc-200 dark:bg-zinc-800" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
