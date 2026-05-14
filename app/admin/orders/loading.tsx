// Orders page skeleton
export default function OrdersLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-2">
          <div className="h-8 w-52 rounded-lg bg-zinc-200 dark:bg-zinc-800" />
          <div className="h-4 w-56 rounded bg-zinc-200 dark:bg-zinc-800" />
        </div>
        <div className="h-9 w-24 rounded-lg bg-zinc-200 dark:bg-zinc-800" />
      </div>

      {/* Table header */}
      <div className="rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950 overflow-hidden">
        <div className="flex items-center gap-4 border-b border-zinc-200 dark:border-zinc-800 px-4 py-3">
          {[20, 15, 12, 12, 10, 10].map((w, i) => (
            <div key={i} className={`h-3 w-${w} rounded bg-zinc-200 dark:bg-zinc-800 flex-shrink-0`} />
          ))}
        </div>

        {/* Rows */}
        {[...Array(8)].map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-4 py-3.5 border-b border-zinc-100 dark:border-zinc-900 last:border-0">
            <div className="h-4 w-24 rounded bg-zinc-200 dark:bg-zinc-800" />
            <div className="h-4 w-16 rounded bg-zinc-200 dark:bg-zinc-800" />
            <div className="h-5 w-20 rounded-full bg-zinc-200 dark:bg-zinc-800" />
            <div className="h-4 w-20 rounded bg-zinc-200 dark:bg-zinc-800" />
            <div className="h-4 w-16 rounded bg-zinc-200 dark:bg-zinc-800" />
            <div className="h-4 w-16 rounded bg-zinc-200 dark:bg-zinc-800 ml-auto" />
            <div className="h-8 w-16 rounded-lg bg-zinc-200 dark:bg-zinc-800" />
          </div>
        ))}
      </div>
    </div>
  );
}
