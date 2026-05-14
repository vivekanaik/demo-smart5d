"use client";

import React, { useState, useEffect, useRef } from "react";
import useSWR from "swr";
import { Bell, VolumeX, Volume2 } from "lucide-react";
import { getServiceRequests } from "@/actions/requests";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { useAdminLanguage } from "@/components/admin/AdminLanguageProvider";

export function AdminNotificationBell() {
  const [isMuted, setIsMuted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const previousRequestIdsRef = useRef<Set<number>>(new Set());
  const [hasNewNotifications, setHasNewNotifications] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const isInitialLoad = useRef(true);
  const { t } = useAdminLanguage();

  const { data: requests = [] } = useSWR("admin-service-requests", getServiceRequests, {
    refreshInterval: 3000,
  });

  const pendingRequests = requests.filter(r => r.status === 'pending');
  const latestRequests = pendingRequests.slice(0, 5); // show latest 5 in dropdown

  useEffect(() => {
    audioRef.current = new Audio("/ring.mp3");

    // Browser audio unlock
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
    const currentPendingIds = new Set(pendingRequests.map(r => r.id));
    
    // Check for genuinely new requests
    const newIds = [...currentPendingIds].filter(id => !previousRequestIdsRef.current.has(id));

    if (newIds.length > 0) {
      // Only ring if this is NOT the very first fetch of the session
      if (!isInitialLoad.current) {
        setHasNewNotifications(true);
        if (!isMuted && audioRef.current) {
          audioRef.current.currentTime = 0;
          audioRef.current.play().catch(console.error);
        }
      }
    }

    previousRequestIdsRef.current = currentPendingIds;
    if (requests.length > 0 || isInitialLoad.current) {
      isInitialLoad.current = false;
    }
  }, [pendingRequests, isMuted, requests.length]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setHasNewNotifications(false); // clear red dot when opening
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={toggleDropdown}
        className="relative rounded-md p-2 text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-900 dark:hover:text-zinc-100"
      >
        <Bell className="h-5 w-5" />
        {pendingRequests.length > 0 && (
          <span className={`absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500 ${hasNewNotifications ? 'animate-pulse' : ''}`}></span>
        )}
        <span className="sr-only">{t("Notifications")}</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 rounded-xl border border-zinc-200 bg-white shadow-lg dark:border-zinc-800 dark:bg-zinc-950 z-50 overflow-hidden">
          <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 px-4 py-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100">
              {t("Waiter Requests")}
            </h3>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsMuted(!isMuted);
              }}
              className="rounded p-1 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-900 dark:hover:text-zinc-100 transition-colors"
              title={isMuted ? t("Unmute sound") : t("Mute sound")}
            >
              {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </button>
          </div>
          
          <div className="max-h-80 overflow-y-auto">
            {latestRequests.length > 0 ? (
              <div className="divide-y divide-zinc-100 dark:divide-zinc-800/50">
                {latestRequests.map((req) => (
                  <div key={req.id} className="px-4 py-3 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{t("Table")} {req.tableNumber}</p>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">{t("Needs assistance")}</p>
                      </div>
                      <span className="text-[10px] text-zinc-400 dark:text-zinc-500">
                        {formatDistanceToNow(new Date(req.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="px-4 py-8 text-center text-sm text-zinc-500 dark:text-zinc-400">
                {t("No new requests.")}
              </div>
            )}
          </div>

          <div className="border-t border-zinc-200 dark:border-zinc-800 p-2">
            <Link 
              href="/admin/notifications"
              onClick={() => setIsOpen(false)}
              className="block w-full text-center rounded-md py-2 text-xs font-medium text-zinc-900 hover:bg-zinc-100 dark:text-zinc-100 dark:hover:bg-zinc-900 transition-colors"
            >
              {t("View all notifications")}
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
