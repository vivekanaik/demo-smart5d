"use client";

import { useState, useEffect } from "react";
import { Order } from "@/components/admin/OrdersTable";
import { markItemServed } from "@/actions/kitchen";
import { Clock, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export function KitchenBoard({ initialTickets }: { initialTickets: Order[] }) {
  const [tickets, setTickets] = useState<Order[]>(initialTickets);
  const [isUpdating, setIsUpdating] = useState(false);

  // Note: Real app would use websockets or SWR for polling. 
  // We'll rely on router.refresh() from the parent or manual refresh for now.
  useEffect(() => {
    setTickets(initialTickets);
  }, [initialTickets]);

  const handleMarkServed = async (itemId: number) => {
    setIsUpdating(true);
    const res = await markItemServed(itemId);
    if (res.success) {
      // Optimistic update
      setTickets(prev => prev.map(order => ({
        ...order,
        items: order.items.map(i => i.id === itemId ? { ...i, status: "served" } : i)
      })));
    }
    setIsUpdating(false);
  };

  const getWaitTime = (createdAt: Date) => {
    const minutes = Math.floor((new Date().getTime() - new Date(createdAt).getTime()) / 60000);
    return minutes;
  };

  if (tickets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-zinc-500 space-y-4 bg-zinc-50 dark:bg-zinc-900/20 rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800">
        <CheckCircle className="h-12 w-12 text-yellow-500/50" />
        <p className="text-lg font-medium">All caught up! No pending orders.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 items-start">
      {tickets.map(ticket => {
        const waitTime = getWaitTime(ticket.createdAt);
        const isUrgent = waitTime >= 15; // Urgent if older than 15 mins
        const pendingItems = ticket.items.filter(i => i.status === "pending");

        if (pendingItems.length === 0) return null; // Don't show if all served optimistically

        return (
          <div 
            key={ticket.id} 
            className={cn(
              "flex flex-col rounded-xl border shadow-sm overflow-hidden",
              isUrgent 
                ? "border-red-200 bg-red-50/50 dark:border-red-900/50 dark:bg-red-900/10" 
                : "border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950"
            )}
          >
            {/* Ticket Header */}
            <div className={cn(
              "p-4 border-b flex justify-between items-start",
              isUrgent ? "border-red-200 dark:border-red-900/50 bg-red-100/50 dark:bg-red-900/30" : "border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50"
            )}>
              <div>
                <h3 className="font-bold text-lg text-zinc-900 dark:text-zinc-100">Table {ticket.tableNumber}</h3>
                <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">#{ticket.id.slice(0, 8)} • {ticket.guestName}</p>
              </div>
              <div className={cn(
                "flex items-center gap-1.5 px-2.5 py-1 rounded-md text-sm font-bold",
                isUrgent ? "bg-red-200 text-red-800 dark:bg-red-900/80 dark:text-red-200" : "bg-zinc-200 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200"
              )}>
                <Clock className="h-4 w-4" />
                {waitTime}m
              </div>
            </div>

            {/* Ticket Items */}
            <div className="p-4 flex-1">
              <div className="space-y-3">
                {pendingItems.map(item => (
                  <div key={item.id} className="flex justify-between items-center group">
                    <div className="flex gap-3 items-start">
                      <span className="font-bold text-lg text-zinc-900 dark:text-zinc-100">{item.quantity}x</span>
                      <div>
                        <p className="font-medium text-zinc-800 dark:text-zinc-200 text-lg leading-tight">{item.name}</p>
                        {item.note && <p className="text-sm text-red-500 italic mt-0.5">Note: {item.note}</p>}
                      </div>
                    </div>
                    <button
                      disabled={isUpdating}
                      onClick={() => handleMarkServed(item.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-2 bg-yellow-100 text-yellow-700 hover:bg-yellow-200 rounded-lg dark:bg-yellow-900/30 dark:text-yellow-400 dark:hover:bg-yellow-900/50 disabled:opacity-50"
                    >
                      <CheckCircle className="h-6 w-6" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
