"use client";

import { ReactNode, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/admin/Sidebar";
import { Navbar } from "@/components/admin/Navbar";
import { AdminLanguageProvider } from "@/components/admin/AdminLanguageProvider";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";
import { useOfflineSync } from "@/hooks/useOfflineSync";
import { usePendingOrderSync } from "@/hooks/usePendingOrderSync";
import { usePendingBookingSync } from "@/hooks/usePendingBookingSync";
import { WifiOff } from "lucide-react";

export function AdminShell({ children, role }: { children: ReactNode, role?: "owner" | "manager" | "waiter" }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const isStandalonePage = pathname === "/admin/login";
  const isOnline = useNetworkStatus();
  
  // Trigger background offline sync when online
  useOfflineSync();
  // Drain any queued offline orders when internet returns
  usePendingOrderSync();
  // Drain any queued offline bookings when internet returns
  usePendingBookingSync();

  useEffect(() => {
    document.body.style.overflow = sidebarOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [sidebarOpen]);

  if (isStandalonePage) {
    return <>{children}</>;
  }

  return (
    <AdminLanguageProvider>
      <div className="flex min-h-screen w-full bg-zinc-50 font-sans text-zinc-950 selection:bg-yellow-500/30 dark:bg-black dark:text-zinc-50">
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} role={role} />
        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <Navbar onMenuClick={() => setSidebarOpen(true)} role={role} />
          {!isOnline && (
            <div className="bg-yellow-500/10 border-b border-yellow-500/20 text-yellow-600 dark:text-yellow-500 px-4 py-2 flex items-center justify-center gap-2 text-sm font-medium">
              <WifiOff className="h-4 w-4" />
              Working Offline: Changes will sync when internet is restored
            </div>
          )}
          <main data-admin-translate-root className="flex-1 overflow-y-auto px-4 py-5 sm:px-5 md:p-8">
            <div className="mx-auto w-full max-w-7xl">{children}</div>
          </main>
        </div>
      </div>
    </AdminLanguageProvider>
  );
}
