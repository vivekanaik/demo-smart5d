"use client";

import React, { useState } from "react";
import useSWR from "swr";
import { getServiceRequests, markRequestsAsResolved, markRequestAsResolved } from "@/actions/requests";
import { format } from "date-fns";
import { CheckCircle2, Clock, BellRing, CheckCircle, MoreVertical, Check as CheckIcon } from "lucide-react";

export default function NotificationsClient() {
  const [isResolving, setIsResolving] = useState(false);
  const [activeMenu, setActiveMenu] = useState<number | null>(null);
  const { data: requests = [], mutate } = useSWR("admin-service-requests", getServiceRequests, {
    refreshInterval: 5000,
  });

  const pendingCount = requests.filter((r) => r.status === "pending").length;

  const handleResolveAll = async () => {
    setIsResolving(true);
    try {
      await markRequestsAsResolved();
      await mutate();
    } catch (error) {
      console.error("Failed to resolve requests:", error);
    } finally {
      setIsResolving(false);
    }
  };

  const handleResolveOne = async (id: number) => {
    try {
      await markRequestAsResolved(id);
      await mutate();
      setActiveMenu(null);
    } catch (error) {
      console.error("Failed to resolve request:", error);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif text-zinc-900 dark:text-zinc-100">Waiter Requests</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Manage table assistance requests and notifications.
          </p>
        </div>
        
        {pendingCount > 0 && (
          <button
            onClick={handleResolveAll}
            disabled={isResolving}
            className="flex items-center justify-center gap-2 rounded-lg bg-yellow-500 px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 dark:focus:ring-offset-zinc-950 disabled:opacity-50"
          >
            <CheckCircle2 className="h-4 w-4" />
            {isResolving ? "Resolving..." : `Resolve All (${pendingCount})`}
          </button>
        )}
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950 overflow-hidden">
        {requests.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <div className="rounded-full bg-zinc-100 p-4 dark:bg-zinc-900 mb-4">
              <BellRing className="h-8 w-8 text-zinc-400" />
            </div>
            <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-100">No requests yet</h3>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400 max-w-sm">
              When customers request a waiter from the menu, they will appear here.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {requests.map((request) => (
              <div 
                key={request.id} 
                className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 md:p-5 transition-colors ${
                  request.status === 'pending' ? 'bg-zinc-50/50 dark:bg-zinc-900/20' : ''
                }`}
              >
                <div className="flex items-start gap-4 flex-1">
                  <div className={`mt-0.5 rounded-full p-2 ${
                    request.status === 'pending' 
                      ? 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-500' 
                      : 'bg-zinc-100 text-zinc-500 dark:bg-zinc-900 dark:text-zinc-400'
                  }`}>
                    {request.status === 'pending' ? <BellRing className="h-5 w-5" /> : <CheckCircle className="h-5 w-5" />}
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                      Table {request.tableNumber}
                    </h4>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
                      Requested assistance
                    </p>
                    <div className="flex items-center gap-1.5 mt-2 text-xs text-zinc-400 dark:text-zinc-500 font-medium">
                      <Clock className="h-3.5 w-3.5" />
                      {format(new Date(request.createdAt), "PPp")}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 ml-12 sm:ml-0">
                  <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold uppercase tracking-wider ${
                    request.status === 'pending'
                      ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-500 border border-yellow-200 dark:border-yellow-900/50'
                      : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-900 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800'
                  }`}>
                    {request.status}
                  </span>

                  {request.status === 'pending' && (
                    <div className="relative">
                      <button 
                        onClick={() => setActiveMenu(activeMenu === request.id ? null : request.id)}
                        className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
                      >
                        <MoreVertical className="h-5 w-5" />
                      </button>
                      
                      {activeMenu === request.id && (
                        <div className="absolute right-0 mt-2 w-48 rounded-lg border border-zinc-200 bg-white shadow-xl dark:border-zinc-800 dark:bg-zinc-950 z-10 overflow-hidden">
                          <button
                            onClick={() => handleResolveOne(request.id)}
                            className="flex items-center gap-2 w-full px-4 py-2.5 text-sm font-medium text-green-600 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors"
                          >
                            <CheckIcon className="h-4 w-4" />
                            Mark as Resolved
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
