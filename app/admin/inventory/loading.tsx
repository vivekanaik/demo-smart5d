// Inventory page skeleton
export default function InventoryLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-2">
          <div className="h-8 w-40 rounded-lg bg-zinc-200 dark:bg-zinc-800" />
          <div className="h-4 w-64 rounded bg-zinc-200 dark:bg-zinc-800" />
        </div>
        <div className="h-9 w-36 rounded-lg bg-zinc-200 dark:bg-zinc-800" />
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
            <div className="h-3 w-20 rounded bg-zinc-200 dark:bg-zinc-800 mb-3" />
            <div className="h-7 w-12 rounded bg-zinc-200 dark:bg-zinc-800" />
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950 overflow-hidden">
        <div className="border-b border-zinc-200 dark:border-zinc-800 px-4 py-3 flex items-center gap-4">
          <div className="h-9 w-64 rounded-lg bg-zinc-200 dark:bg-zinc-800" />
          <div className="h-9 w-32 rounded-lg bg-zinc-200 dark:bg-zinc-800 ml-auto" />
        </div>

        {[...Array(7)].map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-4 py-3.5 border-b border-zinc-100 dark:border-zinc-900 last:border-0">
            <div className="h-9 w-9 rounded-lg bg-zinc-200 dark:bg-zinc-800 flex-shrink-0" />
            <div className="flex-1 space-y-1.5">
              <div className="h-4 w-36 rounded bg-zinc-200 dark:bg-zinc-800" />
              <div className="h-3 w-24 rounded bg-zinc-200 dark:bg-zinc-800" />
            </div>
            <div className="h-5 w-20 rounded-full bg-zinc-200 dark:bg-zinc-800" />
            <div className="h-4 w-16 rounded bg-zinc-200 dark:bg-zinc-800" />
            <div className="h-8 w-8 rounded-lg bg-zinc-200 dark:bg-zinc-800" />
          </div>
        ))}
      </div>
    </div>
  );
}
