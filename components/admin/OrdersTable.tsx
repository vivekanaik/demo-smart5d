"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Search, Eye, Filter } from "lucide-react";
import { cn } from "@/lib/utils";

// Define local types based on what we get from the DB
export type OrderItem = {
  id: number;
  orderId: string;
  name: string;
  quantity: number;
  price: number;
  note?: string | null;
  status: "pending" | "served";
};

export type Order = {
  id: string;
  guestName: string;
  tableNumber: string;
  total: number;
  status: "active" | "completed" | "cancelled";
  createdAt: Date;
  items: OrderItem[];
};

interface OrdersTableProps {
  initialOrders: Order[];
  onViewOrder: (order: Order) => void;
}

export function OrdersTable({ initialOrders, onViewOrder }: OrdersTableProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "completed" | "cancelled">("all");

  const filteredOrders = initialOrders.filter((order) => {
    const matchesSearch = 
      order.id.toLowerCase().includes(search.toLowerCase()) ||
      order.guestName.toLowerCase().includes(search.toLowerCase()) ||
      order.tableNumber.includes(search);
      
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Search by ID, name, or table..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-10 w-full rounded-md border border-zinc-200 bg-white pl-9 pr-4 text-sm outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:focus:border-yellow-500"
          />
        </div>
        
        <div className="flex w-full items-center gap-2 sm:w-auto">
          <Filter className="h-4 w-4 flex-shrink-0 text-zinc-500" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="admin-select h-10 w-full rounded-md border border-zinc-200 bg-white px-3 text-sm outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:focus:border-yellow-500 sm:w-auto"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <div className="hidden overflow-x-auto md:block">
          <table className="w-full text-sm text-left">
            <thead className="bg-zinc-50 dark:bg-zinc-900/50 text-zinc-500 dark:text-zinc-400 border-b border-zinc-200 dark:border-zinc-800">
              <tr>
                <th className="px-6 py-4 font-medium">Order ID</th>
                <th className="px-6 py-4 font-medium">Date & Time</th>
                <th className="px-6 py-4 font-medium">Guest & Table</th>
                <th className="px-6 py-4 font-medium">Items</th>
                <th className="px-6 py-4 font-medium">Total</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-zinc-500">
                    No orders found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors">
                    <td className="px-6 py-4 font-mono text-zinc-900 dark:text-zinc-300">
                      #{order.id.slice(0, 8)}
                    </td>
                    <td className="px-6 py-4 text-zinc-500 dark:text-zinc-400">
                      {format(new Date(order.createdAt), "MMM d, h:mm a")}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-zinc-900 dark:text-zinc-100">{order.guestName}</div>
                      <div className="text-xs text-zinc-500 dark:text-zinc-400">Table {order.tableNumber}</div>
                    </td>
                    <td className="px-6 py-4 text-zinc-500 dark:text-zinc-400">
                      {order.items.length} items
                    </td>
                    <td className="px-6 py-4 font-medium text-zinc-900 dark:text-zinc-100">
                      ₹{order.total}
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
                        order.status === "active" && "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
                        order.status === "completed" && "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
                        order.status === "cancelled" && "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                      )}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => onViewOrder(order)}
                        className="inline-flex items-center justify-center rounded-md p-2 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-zinc-100 transition-colors"
                      >
                        <Eye className="h-4 w-4" />
                        <span className="sr-only">View Details</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="divide-y divide-zinc-200 dark:divide-zinc-800 md:hidden">
          {filteredOrders.length === 0 ? (
            <div className="px-4 py-12 text-center text-sm text-zinc-500">
              No orders found matching your criteria.
            </div>
          ) : (
            filteredOrders.map((order) => (
              <div key={order.id} className="space-y-4 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-mono text-sm font-medium text-zinc-900 dark:text-zinc-100">
                      #{order.id.slice(0, 8)}
                    </p>
                    <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                      {format(new Date(order.createdAt), "MMM d, h:mm a")}
                    </p>
                  </div>
                  <span className={cn(
                    "inline-flex flex-shrink-0 items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
                    order.status === "active" && "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
                    order.status === "completed" && "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
                    order.status === "cancelled" && "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                  )}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Guest</p>
                    <p className="mt-1 font-medium text-zinc-900 dark:text-zinc-100">{order.guestName}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Table</p>
                    <p className="mt-1 font-medium text-zinc-900 dark:text-zinc-100">{order.tableNumber}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Items</p>
                    <p className="mt-1 text-zinc-700 dark:text-zinc-300">{order.items.length} items</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Total</p>
                    <p className="mt-1 font-semibold text-zinc-900 dark:text-zinc-100">₹{order.total}</p>
                  </div>
                </div>

                <button
                  onClick={() => onViewOrder(order)}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-md border border-zinc-200 px-3 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-900"
                >
                  <Eye className="h-4 w-4" />
                  View Details
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
