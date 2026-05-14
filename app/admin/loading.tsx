// Dashboard skeleton - shows instantly while server fetches data
export default function AdminDashboardLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-8 w-48 rounded-lg bg-zinc-200 dark:bg-zinc-800" />
          <div className="h-4 w-64 rounded bg-zinc-200 dark:bg-zinc-800" />
        </div>
        <div className="h-9 w-28 rounded-lg bg-zinc-200 dark:bg-zinc-800" />
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
            <div className="flex items-center justify-between mb-3">
              <div className="h-4 w-24 rounded bg-zinc-200 dark:bg-zinc-800" />
              <div className="h-8 w-8 rounded-lg bg-zinc-200 dark:bg-zinc-800" />
            </div>
            <div className="h-8 w-32 rounded bg-zinc-200 dark:bg-zinc-800 mb-2" />
            <div className="h-3 w-20 rounded bg-zinc-200 dark:bg-zinc-800" />
          </div>
        ))}
      </div>

      {/* Chart Row */}
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <div className="h-5 w-36 rounded bg-zinc-200 dark:bg-zinc-800 mb-4" />
          <div className="h-48 w-full rounded-lg bg-zinc-100 dark:bg-zinc-900" />
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <div className="h-5 w-28 rounded bg-zinc-200 dark:bg-zinc-800 mb-4" />
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-zinc-200 dark:bg-zinc-800 flex-shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3 w-full rounded bg-zinc-200 dark:bg-zinc-800" />
                  <div className="h-3 w-2/3 rounded bg-zinc-200 dark:bg-zinc-800" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Rows */}
      <div className="grid gap-4 lg:grid-cols-2">
        {[0, 1].map((i) => (
          <div key={i} className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
            <div className="h-5 w-36 rounded bg-zinc-200 dark:bg-zinc-800 mb-4" />
            <div className="space-y-3">
              {[...Array(3)].map((_, j) => (
                <div key={j} className="h-12 w-full rounded-lg bg-zinc-100 dark:bg-zinc-900" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
