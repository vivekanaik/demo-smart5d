"use client";

import { Search, Menu, Sun, Moon, Globe } from "lucide-react";
import { AdminNotificationBell } from "./AdminNotificationBell";
import { useTheme } from "@/components/ThemeProvider";
import { useAdminLanguage } from "@/components/admin/AdminLanguageProvider";
import { ADMIN_LANGUAGES, AdminLanguage } from "@/lib/admin-i18n";
import { useState, useRef, useEffect } from "react";

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const { t } = useAdminLanguage();
  const isLight = theme === "light";

  return (
    <button
      onClick={toggleTheme}
      className="relative flex h-7 w-12 items-center rounded-full border border-zinc-200 bg-white px-0.5 text-zinc-500 shadow-sm transition-colors duration-300 hover:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-500/30 dark:border-zinc-700 dark:bg-zinc-900"
      aria-label={t("Toggle theme")}
      title={isLight ? t("Switch to Dark Mode") : t("Switch to Light Mode")}
    >
      <Sun className="absolute left-1.5 h-3.5 w-3.5 text-yellow-500" />
      <Moon className="absolute right-1.5 h-3.5 w-3.5 text-zinc-400 dark:text-zinc-300" />
      <div
        className={`absolute left-0.5 flex h-6 w-6 items-center justify-center rounded-full shadow-sm ring-1 ring-black/5 transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
          isLight
            ? "translate-x-0 bg-yellow-50 text-yellow-600"
            : "translate-x-5 bg-zinc-950 text-yellow-300 ring-white/10"
        }`}
      >
        {isLight ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
      </div>
    </button>
  );
}

function LangDropdown({
  language,
  setLanguage,
}: {
  language: AdminLanguage;
  setLanguage: (language: AdminLanguage) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { t } = useAdminLanguage();
  const current = ADMIN_LANGUAGES.find((l) => l.code === language) ?? ADMIN_LANGUAGES[0];

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        title={t("Change language")}
        className="flex items-center gap-1.5 h-8 px-2.5 rounded-md text-xs font-bold uppercase tracking-wider border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:border-yellow-500 dark:hover:border-yellow-500 hover:text-yellow-600 dark:hover:text-yellow-400 transition-all"
      >
        <Globe className="w-3.5 h-3.5" />
        {current.short}
      </button>

      {open && (
        <div className="absolute top-full right-0 mt-1.5 z-50 w-36 overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-xl">
          {ADMIN_LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              onClick={() => {
                setLanguage(lang.code);
                setOpen(false);
              }}
              className={`w-full text-left px-3 py-2 text-xs font-medium transition-colors ${
                language === lang.code
                  ? "bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 font-bold"
                  : "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-900"
              }`}
            >
              {lang.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function Navbar({
  onMenuClick,
}: {
  onMenuClick?: () => void;
}) {
  const { language, setLanguage, t } = useAdminLanguage();

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-zinc-200 bg-white px-4 dark:border-zinc-800 dark:bg-zinc-950 sm:px-5 md:gap-4 md:px-6">
      <button
        onClick={onMenuClick}
        className="rounded-md p-2 text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-900 dark:hover:text-zinc-100 md:hidden"
      >
        <Menu className="h-6 w-6" />
        <span className="sr-only">{t("Toggle Sidebar")}</span>
      </button>

      <div className="flex min-w-0 flex-1 items-center gap-4 md:gap-8">
        <form className="hidden flex-1 sm:block md:flex-initial">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-zinc-500 dark:text-zinc-400" />
            <input
              type="search"
              placeholder={t("Search orders, customers, or items...")}
              className="h-9 w-full rounded-md border border-zinc-200 bg-zinc-50 pl-9 pr-4 text-sm outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 md:w-[300px] lg:w-[400px] dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 dark:focus:border-yellow-500"
            />
          </div>
        </form>
      </div>

      <div className="flex items-center gap-2 md:gap-3">
        {/* Language Toggle */}
        <LangDropdown language={language} setLanguage={setLanguage} />

        {/* Dark/Light Toggle */}
        <ThemeToggle />

        {/* Notification Bell */}
        <AdminNotificationBell />

        {/* Admin Avatar */}
        <div className="flex items-center gap-3 border-l border-zinc-200 pl-3 dark:border-zinc-800 md:pl-4">
          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-yellow-100 font-bold text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">
            A
          </div>
          <div className="hidden md:flex flex-col">
            <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100 leading-none">{t("Admin User")}</span>
            <span className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">{t("Super Admin")}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
