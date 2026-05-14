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
  X,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { adminLogout, type AdminRole } from "@/actions/adminAuth";
import { useRouter } from "next/navigation";

// Routes hidden for each restricted role
const MANAGER_HIDDEN = ["/admin/employees", "/admin/leaves", "/admin/customers"];
const WAITER_ALLOWED = ["/admin/pos", "/admin/tables"];

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
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [role, setRole] = useState<AdminRole | null>(null);
  const router = useRouter();

  useEffect(() => {
    const saved = localStorage.getItem("adminSidebarCollapsed");
    if (saved === "true") setIsCollapsed(true);
    // Read role from cookie in browser
    const match = document.cookie.match(/admin_auth=([^;]+)/);
    if (match) setRole(match[1] as AdminRole);
  }, []);

  const toggleCollapse = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    localStorage.setItem("adminSidebarCollapsed", String(newState));
  };

  const handleLogout = async () => {
    await adminLogout();
    router.push("/admin/login");
    router.refresh();
  };

  // Filter nav items based on role
  const visibleNavItems = navItems.filter((item) => {
    if (!role || role === "owner") return true;
    if (role === "manager") return !MANAGER_HIDDEN.includes(item.href);
    if (role === "waiter") return WAITER_ALLOWED.includes(item.href);
    return false;
  });

  // Role badge config
  const roleBadge = role === "owner"
    ? { label: "Owner", cls: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20" }
    : role === "manager"
    ? { label: "Manager", cls: "text-blue-400 bg-blue-500/10 border-blue-500/20" }
    : { label: "Waiter", cls: "text-green-400 bg-green-500/10 border-green-500/20" };

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
          "fixed inset-y-0 left-0 z-50 flex h-dvh max-w-[85vw] flex-col border-r border-zinc-200 bg-white text-zinc-900 shadow-2xl transition-all duration-300 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 md:sticky md:top-0 md:z-20 md:h-screen md:max-w-none md:translate-x-0 md:shadow-none",
          open ? "translate-x-0 w-72" : "-translate-x-full w-72",
          isCollapsed ? "md:w-20" : "md:w-64"
        )}
      >
        <div className={cn("flex h-16 items-center border-b border-zinc-200 px-5 transition-all dark:border-zinc-800", isCollapsed ? "justify-center px-0" : "justify-between md:px-6")}>
          {!isCollapsed && (
            <span className="flex items-center gap-2 text-xl font-bold tracking-tight text-zinc-950 transition-opacity dark:text-white">
              <Image src="/esvalo.png" alt="Esvalo Logo" width={96} height={32} className="h-6 w-auto object-contain" />
              Esvalo <span className="font-light text-zinc-500 dark:text-zinc-400">POS</span>
            </span>
          )}
          {isCollapsed && (
            <Image src="/esvalo.png" alt="Esvalo Logo" width={32} height={32} className="h-6 w-auto object-contain mx-auto" />
          )}
          <button
            onClick={onClose}
            className="rounded-md p-2 text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-950 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-100 md:hidden"
          >
            <X className="h-5 w-5" />
            <span className="sr-only">Close sidebar</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-4">
          {/* Role badge */}
          {!isCollapsed && role && (
            <div className="px-4 mb-3">
              <span className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border ${roleBadge.cls}`}>
                {roleBadge.label}
              </span>
            </div>
          )}
          <nav className="space-y-1 px-3">
            {visibleNavItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
              const actuallyActive = item.href === "/admin" ? pathname === "/admin" : isActive;

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={onClose}
                  className={cn(
                    "flex items-center rounded-md text-sm font-medium transition-colors md:py-2.5",
                    actuallyActive
                      ? "bg-yellow-50 text-yellow-700 dark:bg-zinc-800/80 dark:text-yellow-400"
                      : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-100",
                    isCollapsed ? "justify-center px-0 py-3" : "gap-3 px-3 py-3"
                  )}
                  title={isCollapsed ? item.name : undefined}
                >
                  <item.icon className={cn("flex-shrink-0", isCollapsed ? "h-6 w-6" : "h-5 w-5", actuallyActive ? "text-yellow-500" : "text-zinc-500")} />
                  {!isCollapsed && <span className="truncate">{item.name}</span>}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="border-t border-zinc-200 p-4 flex flex-col gap-2 dark:border-zinc-800">
          <button 
             onClick={toggleCollapse}
             className={cn("hidden md:flex items-center rounded-md text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-950 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-100 py-2.5", isCollapsed ? "justify-center w-full" : "gap-3 px-3 w-full")}
             title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
             {isCollapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
             {!isCollapsed && <span>Collapse</span>}
          </button>
          <button
            onClick={handleLogout}
            className={cn("flex items-center rounded-md text-sm font-medium text-red-500 transition-colors hover:bg-red-500/10 dark:text-red-400 md:py-2.5", isCollapsed ? "justify-center py-3 w-full" : "gap-3 px-3 py-3 w-full")}
            title={isCollapsed ? "Logout" : undefined}
          >
            <LogOut className="h-5 w-5" />
            {!isCollapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
