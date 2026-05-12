import { Bell, Search, Menu } from "lucide-react";

export function Navbar() {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-zinc-200 bg-white px-6 dark:border-zinc-800 dark:bg-zinc-950">
      <button className="md:hidden text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100">
        <Menu className="h-6 w-6" />
        <span className="sr-only">Toggle Sidebar</span>
      </button>

      <div className="flex flex-1 items-center gap-4 md:gap-8">
        <form className="flex-1 md:flex-initial">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-zinc-500 dark:text-zinc-400" />
            <input
              type="search"
              placeholder="Search orders, customers, or items... (Cmd+K)"
              className="h-9 w-full rounded-md border border-zinc-200 bg-zinc-50 pl-9 pr-4 text-sm outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 md:w-[300px] lg:w-[400px] dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 dark:focus:border-yellow-500"
            />
          </div>
        </form>
      </div>

      <div className="flex items-center gap-4">
        <button className="relative text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
          <Bell className="h-5 w-5" />
          <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500"></span>
          <span className="sr-only">Notifications</span>
        </button>

        <div className="flex items-center gap-3 pl-4 border-l border-zinc-200 dark:border-zinc-800">
          <div className="h-8 w-8 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-700 font-bold dark:bg-yellow-900/30 dark:text-yellow-400">
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
