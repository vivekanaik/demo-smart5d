// components/ChefHeader.tsx
"use client";

import React, { useState, useEffect, useRef } from "react";
import useSWR from "swr";
import { usePathname } from "next/navigation"; 
import { useTheme } from "@/components/ThemeProvider";
import { Bell, Volume2, VolumeX, X } from "lucide-react";
import { getServiceRequests, markRequestsAsResolved } from "@/actions/requests";

interface ServiceRequest {
  id: number;
  tableNumber: number;
  createdAt: string | Date;
  status: string;
}

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="relative flex items-center w-12 h-6 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-full backdrop-blur-xl cursor-pointer transition-colors duration-500 hover:bg-black/10 dark:hover:bg-white/10 focus:outline-none"
      aria-label="Toggle theme"
    >
      <div
        className={`absolute left-1 w-4 h-4 rounded-full flex items-center justify-center transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] shadow-sm ${
          theme === "light" ? "translate-x-0 bg-black" : "translate-x-6 bg-white"
        }`}
      >
        <div className={`w-1.5 h-1.5 rounded-full ${theme === "light" ? "bg-white" : "bg-black"}`}></div>
      </div>
    </button>
  );
}

export default function ChefHeader({ subtitle = "Chef Console" }: { subtitle?: string }) {
  const pathname = usePathname(); 

  const { data: serviceRequests = [], mutate: mutateRequests } = useSWR<ServiceRequest[]>(
    "serviceRequests",
    getServiceRequests,
    { refreshInterval: 3000, fallbackData: [] }
  );

  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [latestToast, setLatestToast] = useState<number | null>(null);
  const [notifiedIds, setNotifiedIds] = useState<Set<string>>(new Set());

  const [soundEnabled, setSoundEnabled] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      audioRef.current = new Audio("/ring.mp3");
    }

    const unlockAudio = () => {
      if (audioRef.current && audioRef.current.paused) {
        audioRef.current.volume = 0;
        audioRef.current.play().then(() => {
          audioRef.current!.pause();
          audioRef.current!.currentTime = 0;
          audioRef.current!.volume = 1;
        }).catch(() => {});
      }
      document.removeEventListener('click', unlockAudio);
      document.removeEventListener('keydown', unlockAudio);
    };

    document.addEventListener('click', unlockAudio);
    document.addEventListener('keydown', unlockAudio);

    return () => {
      document.removeEventListener('click', unlockAudio);
      document.removeEventListener('keydown', unlockAudio);
    };
  }, []);

  const pendingCount = serviceRequests.filter(req => req.status === 'pending').length;

  useEffect(() => {
    if (!serviceRequests || serviceRequests.length === 0) return;

    let hasNew = false;
    let latestTable: number | null = null;

    serviceRequests.forEach(req => {
      const reqIdStr = req.id.toString();
      if (req.status === 'pending' && !notifiedIds.has(reqIdStr)) {
        hasNew = true;
        latestTable = req.tableNumber;
        setNotifiedIds(prev => new Set(prev).add(reqIdStr));
      }
    });

    if (hasNew && latestTable !== null) {
      if (soundEnabled && audioRef.current) {
        audioRef.current.currentTime = 0; 
        audioRef.current.play().catch(e => console.log("Audio blocked:", e));
      }

      setLatestToast(latestTable);
      setTimeout(() => setLatestToast(null), 15000);
    }
  }, [serviceRequests, notifiedIds, soundEnabled]);

  const toggleNotifications = async () => {
    setIsNotifOpen(!isNotifOpen);
    if (!isNotifOpen && pendingCount > 0) {
      mutateRequests(serviceRequests.map(req => ({ ...req, status: 'resolved' })), false);
      try {
        await markRequestsAsResolved();
        mutateRequests();
      } catch (error) {
        console.error("Failed to mark requests as resolved:", error);
      }
    }
  };

  return (
    <>
      <header className="h-16 flex items-center justify-between px-4 sm:px-10 border-b border-black/5 dark:border-white/5 bg-white/40 dark:bg-black/40 backdrop-blur-md sticky top-0 z-50 transition-colors duration-500">
        <div className="flex items-center space-x-2 sm:space-x-4">
          <span className="uppercase tracking-[0.2em] sm:tracking-[0.3em] text-[10px] sm:text-xs font-bold text-black dark:text-white">
            The Obsidian Palace
          </span>
          <span className="text-black/20 dark:text-white/20">|</span>
          <span className="uppercase tracking-[0.1em] text-[8px] sm:text-[10px] text-black/60 dark:text-white/60">
            {subtitle}
          </span>
        </div>

        <div className="flex items-center gap-3 sm:gap-4 relative">
          
          {/* ✅ Smart Navigation Toggle */}
          {pathname === "/chef/settings" ? (
            <a href="/chef" className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-[10px] uppercase tracking-widest text-black/60 dark:text-white/60 hover:text-gold transition">
              Dashboard
            </a>
          ) : (
            <a href="/chef/settings" className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-[10px] uppercase tracking-widest text-black/60 dark:text-white/60 hover:text-gold transition">
              Settings
            </a>
          )}

          {/* NOTIFICATION BELL */}
          <div className="relative">
            <button 
              onClick={toggleNotifications} 
              className="relative p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition text-black/80 dark:text-white/80 focus:outline-none"
            >
              <Bell size={18} />
              {pendingCount > 0 && (
                <span className="absolute top-1 right-1 flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                </span>
              )}
            </button>

            {isNotifOpen && (
              <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-[#111] border border-black/10 dark:border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden">
                <div className="p-3 border-b border-black/5 dark:border-white/5 bg-gray-50 dark:bg-[#1a1a1a] flex justify-between items-center">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-black/80 dark:text-white/80">Waiter Requests</h4>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSoundEnabled(!soundEnabled);
                    }}
                    className={`p-1.5 rounded-md transition-colors focus:outline-none ${
                      soundEnabled
                        ? "bg-green-500/10 text-green-600 dark:text-green-400"
                        : "bg-red-500/10 text-red-600 dark:text-red-400"
                    }`}
                    title={soundEnabled ? "Mute alerts" : "Unmute alerts"}
                  >
                    {soundEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
                  </button>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {serviceRequests.length === 0 ? (
                    <div className="p-4 text-center text-xs text-black/50 dark:text-white/50">
                      No recent requests
                    </div>
                  ) : (
                    serviceRequests.slice(0, 5).map((req) => (
                      <div key={req.id} className={`p-3 border-b border-black/5 dark:border-white/5 hover:bg-black/5 dark:hover:bg-white/5 transition flex justify-between items-center ${req.status === 'pending' ? 'bg-gold/5 dark:bg-gold/10' : ''}`}>
                        <div>
                          <p className="text-sm font-bold text-black dark:text-white">Table {req.tableNumber}</p>
                          <p className="text-[10px] text-black/50 dark:text-white/50">Needs assistance</p>
                        </div>
                        <span className="text-[10px] text-black/40 dark:text-white/40">
                          {new Date(req.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          <ThemeToggle />
        </div>
      </header>

      {/* GLOBAL TOAST NOTIFICATION POPUP */}
      {latestToast !== null && (
        <div className="fixed top-6 right-4 sm:top-20 sm:right-10 z-[100] animate-in slide-in-from-right-8 fade-in duration-500">
          <div className="relative overflow-hidden bg-white/95 dark:bg-[#111]/95 backdrop-blur-xl border border-black/10 dark:border-white/10 shadow-2xl rounded-2xl w-80">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-gold"></div>
            <div className="p-4 sm:p-5 flex items-start gap-4">
              <div className="relative shrink-0 mt-0.5">
                <div className="absolute inset-0 bg-gold/30 rounded-full animate-ping"></div>
                <div className="relative bg-gradient-to-br from-gold to-amber-600 p-2.5 rounded-full shadow-lg shadow-gold/20">
                  <Bell size={20} className="text-white" />
                </div>
              </div>
              <div className="flex-1 pr-6">
                <h4 className="text-sm sm:text-base font-bold text-black dark:text-white tracking-wide">Service Request</h4>
                <p className="text-xs text-black/60 dark:text-white/60 mt-1 leading-relaxed">
                  Guest requires a waiter at
                </p>
                <div className="mt-2.5 inline-flex items-center justify-center bg-gold/10 border border-gold/30 px-3 py-1 rounded-lg">
                  <span className="text-xs font-bold uppercase tracking-widest text-gold">Table {latestToast}</span>
                </div>
              </div>
              <button 
                onClick={() => setLatestToast(null)} 
                className="absolute top-3 right-3 p-1.5 rounded-full text-black/40 dark:text-white/40 hover:bg-black/10 dark:hover:bg-white/10 hover:text-black dark:hover:text-white transition-colors focus:outline-none"
              >
                <X size={14} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}