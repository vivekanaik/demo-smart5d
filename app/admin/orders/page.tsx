"use client";

import { useEffect, useState } from "react";
import { OrdersTable, Order } from "@/components/admin/OrdersTable";
import { OrderDetailsModal } from "@/components/admin/OrderDetailsModal";
import { getAdminOrders } from "@/actions/adminOrders";
import { RefreshCw } from "lucide-react";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchOrders = async () => {
    setIsLoading(true);
    const result = await getAdminOrders();
    if (result.success && result.orders) {
      setOrders(result.orders as Order[]);
      
      // If a modal is open, update its data as well
      if (selectedOrder) {
        const updatedOrder = result.orders.find(o => o.id === selectedOrder.id);
        if (updatedOrder) {
          setSelectedOrder(updatedOrder as Order);
        }
      }
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Order Management</h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-1">View and manage live kitchen orders.</p>
        </div>
        
        <button 
          onClick={fetchOrders}
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm font-medium hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
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
