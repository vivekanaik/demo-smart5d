"use client";

import Link from "next/link";
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
  LogOut
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

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-screen w-64 flex-col bg-zinc-950 text-zinc-100 border-r border-zinc-800">
      <div className="flex h-16 items-center px-6 border-b border-zinc-800">
        <span className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
          <img src="/esvalo.png" alt="Esvalo Logo" className="h-6 w-auto object-contain" />
          Esvalo <span className="font-light text-zinc-400">POS</span>
        </span>
      </div>

      <div className="flex-1 overflow-y-auto py-4">
        <nav className="space-y-1 px-3">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            // Exact match for /admin to avoid highlighting dashboard on all routes
            const actuallyActive = item.href === "/admin" ? pathname === "/admin" : isActive;
            
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                  actuallyActive
                    ? "bg-zinc-800/80 text-yellow-400"
                    : "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-100"
                )}
              >
                <item.icon className={cn("h-5 w-5", actuallyActive ? "text-yellow-400" : "text-zinc-500")} />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="p-4 border-t border-zinc-800">
        <button className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-red-400 hover:bg-red-500/10 transition-colors">
          <LogOut className="h-5 w-5" />
          Logout
        </button>
      </div>
    </div>
  );
}
