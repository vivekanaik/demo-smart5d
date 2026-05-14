"use client";

import { ReactNode, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/admin/Sidebar";
import { Navbar } from "@/components/admin/Navbar";
import { AdminLanguageProvider } from "@/components/admin/AdminLanguageProvider";

export function AdminShell({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const isStandalonePage = pathname === "/admin/login";

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
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <Navbar onMenuClick={() => setSidebarOpen(true)} />
          <main data-admin-translate-root className="flex-1 overflow-y-auto px-4 py-5 sm:px-5 md:p-8">
            <div className="mx-auto w-full max-w-7xl">{children}</div>
          </main>
        </div>
      </div>
    </AdminLanguageProvider>
  );
}
