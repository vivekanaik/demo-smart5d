"use client";

import { X, CheckCircle, Clock, Trash2 } from "lucide-react";
import { Order } from "./OrdersTable";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { updateOrderStatus, updateOrderItemStatus } from "@/actions/adminOrders";
import { useState } from "react";

interface OrderDetailsModalProps {
  order: Order | null;
  onClose: () => void;
  onUpdate: () => void; // Trigger a refresh
}

export function OrderDetailsModal({ order, onClose, onUpdate }: OrderDetailsModalProps) {
  const [isUpdating, setIsUpdating] = useState(false);

  if (!order) return null;

  const handleStatusChange = async (newStatus: "active" | "completed" | "cancelled") => {
    setIsUpdating(true);
    await updateOrderStatus(order.id, newStatus);
    setIsUpdating(false);
    onUpdate();
  };

  const handleItemStatusChange = async (itemId: number, newStatus: "pending" | "served") => {
    setIsUpdating(true);
    await updateOrderItemStatus(itemId, newStatus);
    setIsUpdating(false);
    onUpdate();
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md transform flex-col border-l border-zinc-200 bg-white shadow-2xl transition-transform duration-300 dark:border-zinc-800 dark:bg-zinc-950">
        
        {/* Header */}
        <div className="flex items-center justify-between gap-3 border-b border-zinc-200 px-4 py-4 dark:border-zinc-800 sm:px-6">
          <div className="min-w-0">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Order #{order.id.slice(0, 8)}</h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              {format(new Date(order.createdAt), "MMM d, yyyy h:mm a")}
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-full text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 space-y-6 overflow-y-auto p-4 sm:p-6">
          
          {/* Info Cards */}
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 p-4 bg-zinc-50 dark:bg-zinc-900/50">
              <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">Guest</p>
              <p className="mt-1 font-semibold text-zinc-900 dark:text-zinc-100">{order.guestName}</p>
            </div>
            <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 p-4 bg-zinc-50 dark:bg-zinc-900/50">
              <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">Table</p>
              <p className="mt-1 font-semibold text-zinc-900 dark:text-zinc-100">{order.tableNumber}</p>
            </div>
          </div>

          {/* Items List */}
          <div>
            <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-4">Order Items</h3>
            <div className="space-y-3">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center justify-between gap-3 rounded-lg border border-zinc-200 p-3 dark:border-zinc-800">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded bg-zinc-100 font-medium text-zinc-500 dark:bg-zinc-900">
                      {item.quantity}x
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-zinc-900 dark:text-zinc-100">{item.name}</p>
                      <p className="text-xs text-zinc-500">₹{item.price}</p>
                    </div>
                  </div>
                  
                  <div className="flex flex-shrink-0 items-center gap-2">
                    <span className={cn(
                      "text-xs px-2 py-1 rounded-full border",
                      item.status === "pending" 
                        ? "border-amber-200 text-amber-700 bg-amber-50 dark:border-amber-900/50 dark:text-amber-400 dark:bg-amber-900/20"
                        : "border-yellow-200 text-yellow-700 bg-yellow-50 dark:border-yellow-900/50 dark:text-yellow-400 dark:bg-yellow-900/20"
                    )}>
                      {item.status}
                    </span>
                    
                    {order.status === "active" && item.status === "pending" && (
                      <button
                        disabled={isUpdating}
                        onClick={() => handleItemStatusChange(item.id, "served")}
                        className="p-1.5 text-yellow-600 hover:bg-yellow-50 rounded-md transition-colors dark:text-yellow-500 dark:hover:bg-yellow-900/30"
                        title="Mark as Served"
                      >
                        <CheckCircle className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="space-y-4 border-t border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900/50 sm:p-6">
          <div className="flex items-center justify-between text-lg font-bold">
            <span className="text-zinc-900 dark:text-zinc-100">Total</span>
            <span className="text-yellow-600 dark:text-yellow-400">₹{order.total}</span>
          </div>

          <div className="flex gap-3">
            {order.status === "active" ? (
              <>
                <button
                  disabled={isUpdating}
                  onClick={() => handleStatusChange("completed")}
                  className="flex-1 bg-yellow-600 hover:bg-yellow-700 text-white font-medium py-2.5 rounded-lg transition-colors flex justify-center items-center gap-2 disabled:opacity-50"
                >
                  <CheckCircle className="h-4 w-4" />
                  Close Order
                </button>
                <button
                  disabled={isUpdating}
                  onClick={() => handleStatusChange("cancelled")}
                  className="px-4 bg-white dark:bg-zinc-900 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 border border-zinc-200 dark:border-zinc-800 font-medium py-2.5 rounded-lg transition-colors flex justify-center items-center disabled:opacity-50"
                  title="Cancel Order"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </>
            ) : (
              <div className="w-full text-center py-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 text-zinc-500 dark:text-zinc-400 font-medium flex items-center justify-center gap-2">
                {order.status === "completed" ? <CheckCircle className="h-4 w-4" /> : <X className="h-4 w-4" />}
                Order {order.status}
              </div>
            )}
          </div>
        </div>

      </div>
    </>
  );
}
