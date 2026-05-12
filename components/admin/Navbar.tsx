import { Bell, Search, Menu } from "lucide-react";

export function Navbar({ onMenuClick }: { onMenuClick?: () => void }) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-zinc-200 bg-white px-4 dark:border-zinc-800 dark:bg-zinc-950 sm:px-5 md:gap-4 md:px-6">
      <button
        onClick={onMenuClick}
        className="rounded-md p-2 text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-900 dark:hover:text-zinc-100 md:hidden"
      >
        <Menu className="h-6 w-6" />
        <span className="sr-only">Toggle Sidebar</span>
      </button>

      <div className="flex min-w-0 flex-1 items-center gap-4 md:gap-8">
        <form className="hidden flex-1 sm:block md:flex-initial">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-zinc-500 dark:text-zinc-400" />
            <input
              type="search"
              placeholder="Search orders, customers, or items..."
              className="h-9 w-full rounded-md border border-zinc-200 bg-zinc-50 pl-9 pr-4 text-sm outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 md:w-[300px] lg:w-[400px] dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 dark:focus:border-yellow-500"
            />
          </div>
        </form>
      </div>

      <div className="flex items-center gap-3 md:gap-4">
        <button className="relative rounded-md p-2 text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-900 dark:hover:text-zinc-100">
          <Bell className="h-5 w-5" />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500"></span>
          <span className="sr-only">Notifications</span>
        </button>

        <div className="flex items-center gap-3 border-l border-zinc-200 pl-3 dark:border-zinc-800 md:pl-4">
          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-yellow-100 font-bold text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">
            A
          </div>
          <div className="hidden md:flex flex-col">
            <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100 leading-none">Admin User</span>
            <span className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">Super Admin</span>
          </div>
        </div>
      </div>
    </header>
  );
}
