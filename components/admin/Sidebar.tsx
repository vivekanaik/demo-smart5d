"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Receipt, 
  Users, 
  ChefHat, 
  CalendarDays, 
  Package, 
  Armchair, 
  Bell, 
  Settings,
  LogOut,
  X
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Orders", href: "/admin/orders", icon: ShoppingCart },
  { name: "POS Billing", href: "/admin/pos", icon: Receipt },
  { name: "Employees", href: "/admin/employees", icon: Users },
  { name: "Kitchen", href: "/admin/kitchen", icon: ChefHat },
  { name: "Leaves & Holidays", href: "/admin/leaves", icon: CalendarDays },
  { name: "Inventory", href: "/admin/inventory", icon: Package },
  { name: "Tables & Bookings", href: "/admin/tables", icon: Armchair },
  { name: "Customers", href: "/admin/customers", icon: Users },
  { name: "Notifications", href: "/admin/notifications", icon: Bell },
  { name: "Settings", href: "/admin/settings", icon: Settings },
];

type SidebarProps = {
  open?: boolean;
  onClose?: () => void;
};

export function Sidebar({ open = false, onClose }: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      <div
        onClick={onClose}
        className={cn(
          "fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity md:hidden",
          open ? "opacity-100" : "pointer-events-none opacity-0"
        )}
      />

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex h-dvh w-72 max-w-[85vw] flex-col border-r border-zinc-800 bg-zinc-950 text-zinc-100 shadow-2xl transition-transform duration-300 md:sticky md:top-0 md:z-20 md:h-screen md:w-64 md:max-w-none md:translate-x-0 md:shadow-none",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-16 items-center justify-between border-b border-zinc-800 px-5 md:px-6">
          <span className="flex items-center gap-2 text-xl font-bold tracking-tight text-white">
            <Image src="/esvalo.png" alt="Esvalo Logo" width={96} height={32} className="h-6 w-auto object-contain" />
            Esvalo <span className="font-light text-zinc-400">POS</span>
          </span>
          <button
            onClick={onClose}
            className="rounded-md p-2 text-zinc-400 transition-colors hover:bg-zinc-900 hover:text-zinc-100 md:hidden"
          >
            <X className="h-5 w-5" />
            <span className="sr-only">Close sidebar</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-4">
          <nav className="space-y-1 px-3">
            {navItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
              const actuallyActive = item.href === "/admin" ? pathname === "/admin" : isActive;

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={onClose}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-3 text-sm font-medium transition-colors md:py-2.5",
                    actuallyActive
                      ? "bg-zinc-800/80 text-yellow-400"
                      : "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-100"
                  )}
                >
                  <item.icon className={cn("h-5 w-5 flex-shrink-0", actuallyActive ? "text-yellow-400" : "text-zinc-500")} />
                  <span className="truncate">{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="border-t border-zinc-800 p-4">
          <button className="flex w-full items-center gap-3 rounded-md px-3 py-3 text-sm font-medium text-red-400 transition-colors hover:bg-red-500/10 md:py-2.5">
            <LogOut className="h-5 w-5" />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}
