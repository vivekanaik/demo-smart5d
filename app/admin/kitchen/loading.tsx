// Kitchen skeleton - shows instantly while server fetches active orders
export default function KitchenLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-2">
          <div className="h-8 w-52 rounded-lg bg-zinc-200 dark:bg-zinc-800" />
          <div className="h-4 w-72 rounded bg-zinc-200 dark:bg-zinc-800" />
        </div>
      </div>

      {/* View Tabs */}
      <div className="flex gap-2">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-9 w-24 rounded-lg bg-zinc-200 dark:bg-zinc-800" />
        ))}
      </div>

      {/* Order Tickets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
            {/* Ticket header */}
            <div className="flex items-start justify-between mb-4">
              <div className="space-y-2">
                <div className="h-3 w-16 rounded bg-zinc-200 dark:bg-zinc-800" />
                <div className="h-5 w-32 rounded bg-zinc-200 dark:bg-zinc-800" />
              </div>
              <div className="space-y-1.5 items-end flex flex-col">
                <div className="h-3 w-12 rounded bg-zinc-200 dark:bg-zinc-800" />
                <div className="h-7 w-8 rounded bg-zinc-200 dark:bg-zinc-800" />
              </div>
            </div>

            {/* Order meta */}
            <div className="space-y-1.5 mb-4">
              <div className="h-3 w-40 rounded bg-zinc-200 dark:bg-zinc-800" />
              <div className="h-3 w-28 rounded bg-zinc-200 dark:bg-zinc-800" />
            </div>

            {/* Divider */}
            <div className="border-t border-zinc-100 dark:border-zinc-800 mb-3" />

            {/* Items */}
            <div className="space-y-2 mb-5">
              {[...Array(3)].map((_, j) => (
                <div key={j} className="flex items-center justify-between">
                  <div className="h-4 w-40 rounded bg-zinc-200 dark:bg-zinc-800" />
                  <div className="h-5 w-8 rounded-full bg-zinc-200 dark:bg-zinc-800" />
                </div>
              ))}
            </div>

            {/* Buttons */}
            <div className="grid grid-cols-2 gap-2">
              <div className="h-9 rounded-lg bg-zinc-200 dark:bg-zinc-800" />
              <div className="h-9 rounded-lg bg-zinc-200 dark:bg-zinc-800" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
