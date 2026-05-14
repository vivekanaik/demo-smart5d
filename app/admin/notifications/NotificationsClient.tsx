"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import useSWR from "swr";
import { getDynamicNotifications, NotificationItem } from "@/actions/notifications";
import { markRequestAsResolved } from "@/actions/requests";
import { format } from "date-fns";
import { BellRing, Clock, MoreVertical, Check as CheckIcon, Package, Calendar, CreditCard, SlidersHorizontal, Settings, ArrowUpRight, UserX, ChevronDown } from "lucide-react";
import type { AdminRole } from "@/actions/adminAuth";
import Link from "next/link";
import { useAdminLanguage } from "@/components/admin/AdminLanguageProvider";

export default function NotificationsClient({ role }: { role: AdminRole }) {
  const [isResolving, setIsResolving] = useState<string | null>(null);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  const { t } = useAdminLanguage();
  // Preferences mapping
  const [prefs, setPrefs] = useState({
    service: true,
    inventory: true,
    booking: true,
    payment: true,
    leave: true,
  });

  const settingsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem("notification_prefs");
    if (saved) {
      try {
        // Merge with defaults so newly added keys are never undefined
        setPrefs(prev => ({ ...prev, ...JSON.parse(saved) }));
      } catch (e) {}
    }
    
    const handleClickOutside = (e: MouseEvent) => {
      if (settingsRef.current && !settingsRef.current.contains(e.target as Node)) {
        setIsSettingsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handlePrefChange = (key: keyof typeof prefs) => {
    const newPrefs = { ...prefs, [key]: !prefs[key] };
    setPrefs(newPrefs);
    localStorage.setItem("notification_prefs", JSON.stringify(newPrefs));
  };

  const { data: allNotifications = [], mutate } = useSWR("admin-dynamic-notifications", getDynamicNotifications, {
    refreshInterval: 5000,
  });

  // Filter based on role and preferences
  const filteredNotifications = useMemo(() => {
    return allNotifications.filter(n => {
      // Role-based filtering
      if (role === "waiter" && n.type === "inventory") return false;
      
      // Preferences filtering
      if (n.type === "service" && !prefs.service) return false;
      if (n.type === "inventory" && !prefs.inventory) return false;
      if (n.type === "booking" && !prefs.booking) return false;
      if (n.type === "payment" && !prefs.payment) return false;
      if (n.type === "leave" && !prefs.leave) return false;

      return true;
    }).sort((a, b) => {
      const timeA = new Date(a.timestamp).getTime();
      const timeB = new Date(b.timestamp).getTime();
      return sortOrder === "newest" ? timeB - timeA : timeA - timeB;
    });
  }, [allNotifications, role, prefs, sortOrder]);

  const handleResolveOne = async (id: string, dbId?: number | string) => {
    if (!dbId) return;
    setIsResolving(id);
    try {
      if (id.startsWith("service-")) {
        await markRequestAsResolved(Number(dbId));
      }
      await mutate();
    } catch (error) {
      console.error("Failed to resolve request:", error);
    } finally {
      setIsResolving(null);
      setActiveMenu(null);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'service': return <BellRing className="h-5 w-5" />;
      case 'inventory': return <Package className="h-5 w-5" />;
      case 'booking': return <Calendar className="h-5 w-5" />;
      case 'payment': return <CreditCard className="h-5 w-5" />;
      case 'leave': return <UserX className="h-5 w-5" />;
      default: return <BellRing className="h-5 w-5" />;
    }
  };

  const getColorClass = (type: string) => {
    switch (type) {
      case 'service': return 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-500 border-yellow-200 dark:border-yellow-900/50';
      case 'inventory': return 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-500 border-red-200 dark:border-red-900/50';
      case 'booking': return 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-500 border-blue-200 dark:border-blue-900/50';
      case 'payment': return 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-500 border-green-200 dark:border-green-900/50';
      case 'leave': return 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-500 border-purple-200 dark:border-purple-900/50';
      default: return 'bg-zinc-100 text-zinc-600 dark:bg-zinc-900/30 dark:text-zinc-500';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif text-zinc-900 dark:text-zinc-100">{t("Notifications")}</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            {t("System alerts and operational requests.")}
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="relative">
            <select 
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as "newest" | "oldest")}
              className="h-10 appearance-none rounded-lg border border-zinc-200 bg-white pl-3 pr-10 py-2 text-sm font-medium text-zinc-700 outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300 transition-all cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-900/50 shadow-sm"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none text-zinc-400" />
          </div>

          <div className="relative" ref={settingsRef}>
            <button 
              onClick={() => setIsSettingsOpen(!isSettingsOpen)}
              className="flex items-center justify-center h-10 w-10 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-600 transition-colors dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400 dark:hover:bg-zinc-900"
            >
              <SlidersHorizontal className="h-4 w-4" />
            </button>

            {isSettingsOpen && (
              <div className="absolute right-0 mt-2 w-64 rounded-xl border border-zinc-200 bg-white shadow-xl dark:border-zinc-800 dark:bg-zinc-950 z-20 overflow-hidden p-3">
                <div className="mb-2 pb-2 border-b border-zinc-100 dark:border-zinc-900 flex items-center gap-2">
                  <Settings className="h-4 w-4 text-zinc-500" />
                  <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{t("Preferences")}</span>
                </div>
                <div className="space-y-1">
                  <label className="flex items-center justify-between p-2 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-900/50 cursor-pointer transition-colors">
                    <div className="flex items-center gap-2">
                      <BellRing className="h-4 w-4 text-yellow-500" />
                      <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{t("Waiter Requests")}</span>
                    </div>
                    <input type="checkbox" checked={prefs.service} onChange={() => handlePrefChange('service')} className="accent-yellow-500 w-4 h-4" />
                  </label>
                  {role !== "waiter" && (
                    <label className="flex items-center justify-between p-2 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-900/50 cursor-pointer transition-colors">
                      <div className="flex items-center gap-2">
                        <Package className="h-4 w-4 text-red-500" />
                        <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{t("Inventory Alerts")}</span>
                      </div>
                      <input type="checkbox" checked={prefs.inventory} onChange={() => handlePrefChange('inventory')} className="accent-yellow-500 w-4 h-4" />
                    </label>
                  )}
                  <label className="flex items-center justify-between p-2 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-900/50 cursor-pointer transition-colors">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-blue-500" />
                      <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{t("Upcoming Bookings")}</span>
                    </div>
                    <input type="checkbox" checked={prefs.booking} onChange={() => handlePrefChange('booking')} className="accent-yellow-500 w-4 h-4" />
                  </label>
                  <label className="flex items-center justify-between p-2 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-900/50 cursor-pointer transition-colors">
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4 text-green-500" />
                      <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{t("Payments Due")}</span>
                    </div>
                    <input type="checkbox" checked={prefs.payment} onChange={() => handlePrefChange('payment')} className="accent-yellow-500 w-4 h-4" />
                  </label>
                  {role !== "waiter" && (
                    <label className="flex items-center justify-between p-2 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-900/50 cursor-pointer transition-colors">
                      <div className="flex items-center gap-2">
                        <UserX className="h-4 w-4 text-purple-500" />
                        <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{t("Staff on Leave")}</span>
                      </div>
                      <input type="checkbox" checked={prefs.leave} onChange={() => handlePrefChange('leave')} className="accent-yellow-500 w-4 h-4" />
                    </label>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950 overflow-hidden">
        {filteredNotifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <div className="rounded-full bg-zinc-100 p-4 dark:bg-zinc-900 mb-4">
              <BellRing className="h-8 w-8 text-zinc-400" />
            </div>
            <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-100">{t("All caught up!")}</h3>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400 max-w-sm">
              {t("There are no new notifications matching your current filters.")}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {filteredNotifications.map((notification) => (
              <div 
                key={notification.id} 
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 md:p-5 transition-colors bg-zinc-50/50 dark:bg-zinc-900/20"
              >
                <div className="flex items-start gap-4 flex-1">
                  <div className={`mt-0.5 rounded-full p-2 border ${getColorClass(notification.type)}`}>
                    {getIcon(notification.type)}
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                      {t(notification.title)}
                    </h4>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-0.5">
                      {t(notification.message)}
                    </p>
                    <div className="flex items-center gap-1.5 mt-2 text-xs text-zinc-400 dark:text-zinc-500 font-medium">
                      <Clock className="h-3.5 w-3.5" />
                      {format(new Date(notification.timestamp), "PPp")}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 ml-12 sm:ml-0 shrink-0">
                  <Link 
                    href={notification.link}
                    className="inline-flex items-center justify-center gap-1 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 py-1.5 text-xs font-semibold text-zinc-700 dark:text-zinc-300 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-900"
                  >
                    {t("View")}
                    <ArrowUpRight className="h-3 w-3 opacity-70" />
                  </Link>

                  {notification.isResolvable && (
                    <div className="relative">
                      <button 
                        onClick={() => setActiveMenu(activeMenu === notification.id ? null : notification.id)}
                        className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
                      >
                        <MoreVertical className="h-5 w-5" />
                      </button>
                      
                      {activeMenu === notification.id && (
                        <div className="absolute right-0 mt-2 w-48 rounded-lg border border-zinc-200 bg-white shadow-xl dark:border-zinc-800 dark:bg-zinc-950 z-10 overflow-hidden">
                          <button
                            onClick={() => handleResolveOne(notification.id, notification.dbId)}
                            disabled={isResolving === notification.id}
                            className="flex items-center gap-2 w-full px-4 py-2.5 text-sm font-medium text-green-600 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors disabled:opacity-50"
                          >
                            <CheckIcon className="h-4 w-4" />
                            {isResolving === notification.id ? t("Resolving...") : t("Mark as Resolved")}
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
