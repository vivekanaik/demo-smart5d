"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  ShoppingCart,
  ShoppingBag,
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
  ChevronRight,
  Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect, useRef } from "react";
import { getActiveOrders } from "@/actions/orders";
import { adminLogout, type AdminRole } from "@/actions/adminAuth";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import { getDynamicNotifications } from "@/actions/notifications";

// Routes hidden for each restricted role
const MANAGER_HIDDEN = ["/admin/employees", "/admin/leaves", "/admin/customers"];
const WAITER_ALLOWED = ["/admin/billing", "/admin/tables", "/admin", "/admin/kitchen", "/admin/notifications"];

const navItems = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Orders", href: "/admin/orders", icon: ShoppingBag },
  { name: "Billing", href: "/admin/billing", icon: Receipt },
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
  role?: "owner" | "manager" | "waiter";
};

export function Sidebar({ open = false, onClose, role }: SidebarProps) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const router = useRouter();

  // Fetch notifications to show red dot on Sidebar
  const { data: allNotifications = [] } = useSWR("admin-dynamic-notifications", getDynamicNotifications, {
    refreshInterval: 5000,
  });

  const { data: activeOrders = [] } = useSWR("adminActiveOrders", getActiveOrders, {
    refreshInterval: 5000,
  });

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const previousOrderIdsRef = useRef<Set<string>>(new Set());
  const previousNotificationIdsRef = useRef<Set<string>>(new Set());
  const isInitialLoad = useRef(true);

  const [hasSeenKitchen, setHasSeenKitchen] = useState(false);
  const [hasSeenNotifications, setHasSeenNotifications] = useState(false);

  useEffect(() => {
    if (pathname === "/admin/kitchen") setHasSeenKitchen(true);
    if (pathname === "/admin/notifications") setHasSeenNotifications(true);
  }, [pathname]);

  useEffect(() => {
    audioRef.current = new Audio("/ring.mp3");
    const unlockAudio = () => {
      if (audioRef.current) {
        audioRef.current.play().then(() => {
          audioRef.current!.pause();
          audioRef.current!.currentTime = 0;
        }).catch(() => {});
      }
      window.removeEventListener('click', unlockAudio);
    };
    window.addEventListener('click', unlockAudio);
    return () => window.removeEventListener('click', unlockAudio);
  }, []);

  useEffect(() => {
    const currentIds = new Set(activeOrders.map(o => o.id));
    const newIds = [...currentIds].filter(id => !previousOrderIdsRef.current.has(id));

    if (newIds.length > 0 && !isInitialLoad.current) {
      const isMuted = localStorage.getItem("notification_sound_muted") === "true";
      if (!isMuted && audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(() => {});
      }
      if (pathname !== "/admin/kitchen") {
        setHasSeenKitchen(false);
      }
    }

    previousOrderIdsRef.current = currentIds;
    if (activeOrders.length > 0 || isInitialLoad.current) {
      isInitialLoad.current = false;
    }
  }, [activeOrders, pathname]);

  const [prefs, setPrefs] = useState({
    service: true,
    inventory: true,
    booking: true,
    payment: true,
    leave: true,
  });

  useEffect(() => {
    const saved = localStorage.getItem("notification_prefs");
    if (saved) {
      try {
        setPrefs(prev => ({ ...prev, ...JSON.parse(saved) }));
      } catch (e) {}
    }
  }, []);

  const filteredNotifications = allNotifications.filter(n => {
    if (role === "waiter" && n.type === "inventory") return false;
    if (role === "waiter" && n.type === "leave") return false;
    if (n.type === "service" && !prefs.service) return false;
    if (n.type === "inventory" && !prefs.inventory) return false;
    if (n.type === "booking" && !prefs.booking) return false;
    if (n.type === "payment" && !prefs.payment) return false;
    if (n.type === "leave" && !prefs.leave) return false;
    return true;
  });

  useEffect(() => {
    const currentIds = new Set(filteredNotifications.map(n => n.id));
    const newIds = [...currentIds].filter(id => !previousNotificationIdsRef.current.has(id));

    if (newIds.length > 0 && !isInitialLoad.current) {
      if (pathname !== "/admin/notifications") {
        setHasSeenNotifications(false);
      }
    }
    
    previousNotificationIdsRef.current = currentIds;
  }, [filteredNotifications, pathname]);

  useEffect(() => {
    const saved = localStorage.getItem("adminSidebarCollapsed");
    if (saved === "true") setIsCollapsed(true);
  }, []);

  const toggleCollapse = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    localStorage.setItem("adminSidebarCollapsed", String(newState));
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await adminLogout();
    router.push("/admin/login");
    router.refresh();
  };

  // Determine visibility and blur for each item
  const getNavStatus = (href: string) => {
    if (!role || role === "owner") return { visible: true, allowed: true };
    if (role === "manager") {
      const isHidden = MANAGER_HIDDEN.includes(href);
      return { visible: true, allowed: !isHidden };
    }
    if (role === "waiter") {
      const isAllowed = WAITER_ALLOWED.includes(href);
      return { visible: true, allowed: isAllowed };
    }
    return { visible: false, allowed: false };
  };

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
            {navItems.map((item) => {
              const { visible, allowed } = getNavStatus(item.href);
              if (!visible) return null;

              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
              const actuallyActive = item.href === "/admin" ? pathname === "/admin" : isActive;

              return (
                <Link
                  key={item.name}
                  href={allowed ? item.href : "#"}
                  onClick={(e) => {
                    if (!allowed) {
                      e.preventDefault();
                      return;
                    }
                    if (onClose) onClose();
                  }}
                  className={cn(
                    "group flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-all duration-200",
                    isCollapsed ? "justify-center" : "",
                    !allowed && "opacity-40 grayscale cursor-not-allowed",
                    actuallyActive
                      ? "bg-yellow-50 text-yellow-700 shadow-sm dark:bg-yellow-500/10 dark:text-yellow-500"
                      : allowed 
                        ? "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-100"
                        : "text-zinc-600 dark:text-zinc-400"
                  )}
                  title={isCollapsed ? item.name : undefined}
                >
                  <div className="relative flex items-center justify-center">
                    <item.icon className={cn("h-5 w-5 flex-shrink-0", actuallyActive ? "text-yellow-600 dark:text-yellow-500" : "text-zinc-400 dark:text-zinc-500 group-hover:text-zinc-500 dark:group-hover:text-zinc-400")} />
                    {item.name === "Notifications" && filteredNotifications.length > 0 && !hasSeenNotifications && (
                      <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white dark:ring-zinc-950"></span>
                    )}
                    {item.name === "Kitchen" && activeOrders.length > 0 && !hasSeenKitchen && (
                      <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white dark:ring-zinc-950"></span>
                    )}
                  </div>
                  {!isCollapsed && (
                    <span className="flex-1 truncate">{item.name}</span>
                  )}
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
            disabled={isLoggingOut}
            className={cn("flex items-center rounded-md text-sm font-medium text-red-500 transition-colors hover:bg-red-500/10 dark:text-red-400 md:py-2.5 disabled:opacity-50 disabled:cursor-not-allowed", isCollapsed ? "justify-center py-3 w-full" : "gap-3 px-3 py-3 w-full")}
            title={isCollapsed ? (isLoggingOut ? "Logging out..." : "Logout") : undefined}
          >
            {isLoggingOut ? <Loader2 className="h-5 w-5 animate-spin" /> : <LogOut className="h-5 w-5" />}
            {!isCollapsed && <span>{isLoggingOut ? "Logging out..." : "Logout"}</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
