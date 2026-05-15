"use client";

import { useCallback, useEffect, useState } from "react";
import { OrdersTable, Order } from "@/components/admin/OrdersTable";
import { OrderDetailsModal } from "@/components/admin/OrderDetailsModal";
import { getAdminOrders } from "@/actions/adminOrders";
import { RefreshCw } from "lucide-react";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";
import { getDb } from "@/lib/db-local";

export default function AdminOrdersClient({
  initialOrders,
}: {
  initialOrders: Order[];
}) {
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const isOnline = useNetworkStatus();

  const applyOrders = useCallback((nextOrders: Order[]) => {
    setOrders(nextOrders);
    setSelectedOrder((current) => {
      if (!current) return current;
      return nextOrders.find(o => o.id === current.id) ?? current;
    });
  }, []);

  const fetchOrders = async () => {
    setIsRefreshing(true);
    
    if (!isOnline) {
      try {
        const db = await getDb();
        if (db) {
          const localOrders = await db.table('activeOrders').toArray();
          applyOrders(localOrders as Order[]);
        }
      } catch (err) {
        console.error("Offline read failed", err);
      }
    } else {
      const result = await getAdminOrders();
      if (result.success && result.orders) {
        applyOrders(result.orders as Order[]);
      }
    }
    
    setIsRefreshing(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 md:text-3xl">Order Management</h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-1">View and manage live kitchen orders.</p>
        </div>
        
        <button 
          onClick={fetchOrders}
          disabled={isRefreshing}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-medium transition-colors hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:bg-zinc-900 sm:w-auto"
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      <OrdersTable 
        initialOrders={orders} 
        onViewOrder={(order) => setSelectedOrder(order)} 
      />

      <OrderDetailsModal 
        order={selectedOrder} 
        onClose={() => setSelectedOrder(null)} 
        onUpdate={fetchOrders}
      />
    </div>
  );
}
