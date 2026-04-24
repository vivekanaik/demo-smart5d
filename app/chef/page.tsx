"use client";

import React, { useMemo, useState } from "react";
import { ThemeProvider, useTheme } from "@/components/ThemeProvider";
import {
  BarChart3,
  ChefHat,
  CheckCircle2,
  Clock3,
  ReceiptText,
  XCircle,
  LayoutGrid,
  Layers,
  Landmark,
  CalendarClock,
} from "lucide-react";

type OrderItem = {
  name: string;
  qty: number;
};

type ActiveOrder = {
  id: string;
  tableNumber: number;
  orderedAt: string;
  guestName: string;
  specialNote?: string;
  items: OrderItem[];
};

type ClosedOrder = ActiveOrder & {
  closedAt: string;
  closedStatus: "completed" | "cancelled";
};

type AnalyticsWindow = "daily" | "weekly" | "monthly" | "yearly";
type OrderView = "all" | "active" | "previous" | "cancelled";
type DashboardView = "orders" | "analytics";

const INITIAL_ACTIVE_ORDERS: ActiveOrder[] = [
  {
    id: "ORD-1041",
    tableNumber: 12,
    orderedAt: "2026-04-24T11:10:00.000Z",
    guestName: "Rohan",
    specialNote: "No onion in burger",
    items: [
      { name: "Classic Veggie Burger", qty: 2 },
      { name: "Blue Galactic Mojito", qty: 2 },
    ],
  },
  {
    id: "ORD-1042",
    tableNumber: 6,
    orderedAt: "2026-04-24T11:18:00.000Z",
    guestName: "Ananya",
    items: [
      { name: "Truffle Mushroom Pizza", qty: 1 },
      { name: "Mediterranean Feta Salad", qty: 1 },
    ],
  },
  {
    id: "ORD-1043",
    tableNumber: 3,
    orderedAt: "2026-04-24T11:21:00.000Z",
    guestName: "Kabir",
    specialNote: "Extra spicy ramen",
    items: [{ name: "Spicy Veg Ramen", qty: 3 }],
  },
  {
    id: "ORD-1044",
    tableNumber: 15,
    orderedAt: "2026-04-24T11:30:00.000Z",
    guestName: "Nisha",
    items: [
      { name: "Bombay Sandwich", qty: 2 },
      { name: "Obsidian Lava Dessert", qty: 1 },
    ],
  },
];

const ANALYTICS_DATA: Record<
  AnalyticsWindow,
  {
    revenue: string;
    completedOrders: number;
    cancelledOrders: number;
    avgPrepMinutes: number;
    occupancyRate: string;
    popularDish: string;
  }
> = {
  daily: {
    revenue: "₹38,420",
    completedOrders: 86,
    cancelledOrders: 4,
    avgPrepMinutes: 18,
    occupancyRate: "74%",
    popularDish: "Truffle Mushroom Pizza",
  },
  weekly: {
    revenue: "₹2,61,300",
    completedOrders: 578,
    cancelledOrders: 21,
    avgPrepMinutes: 19,
    occupancyRate: "79%",
    popularDish: "Spicy Veg Ramen",
  },
  monthly: {
    revenue: "₹10,82,900",
    completedOrders: 2410,
    cancelledOrders: 96,
    avgPrepMinutes: 20,
    occupancyRate: "82%",
    popularDish: "Classic Veggie Burger",
  },
  yearly: {
    revenue: "₹1,34,48,600",
    completedOrders: 29172,
    cancelledOrders: 1183,
    avgPrepMinutes: 21,
    occupancyRate: "80%",
    popularDish: "Truffle Mushroom Pizza",
  },
};

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

function formatTime(isoString: string) {
  return new Date(isoString).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function minutesSince(isoString: string) {
  const diffMs = Date.now() - new Date(isoString).getTime();
  return Math.max(0, Math.floor(diffMs / 60000));
}

function ChefContent() {
  const [dashboardView, setDashboardView] = useState<DashboardView>("orders");
  const [orderView, setOrderView] = useState<OrderView>("all");
  const [analyticsWindow, setAnalyticsWindow] = useState<AnalyticsWindow>("daily");

  const [activeOrders, setActiveOrders] = useState<ActiveOrder[]>(INITIAL_ACTIVE_ORDERS);
  const [previousOrders, setPreviousOrders] = useState<ClosedOrder[]>([]);
  const [cancelledOrders, setCancelledOrders] = useState<ClosedOrder[]>([]);

  const sortedActiveOrders = useMemo(
    () => [...activeOrders].sort((a, b) => new Date(a.orderedAt).getTime() - new Date(b.orderedAt).getTime()),
    [activeOrders],
  );

  const currentAnalytics = ANALYTICS_DATA[analyticsWindow];
  const ordersHeading =
    orderView === "all"
      ? "All Orders"
      : orderView === "active"
        ? "Active Orders"
        : orderView === "previous"
          ? "Previous Orders"
          : "Cancelled Orders";

  const closeOrder = (order: ActiveOrder, status: "completed" | "cancelled") => {
    const closed: ClosedOrder = {
      ...order,
      closedStatus: status,
      closedAt: new Date().toISOString(),
    };

    setActiveOrders((prev) => prev.filter((o) => o.id !== order.id));

    if (status === "completed") {
      setPreviousOrders((prev) => [closed, ...prev]);
      return;
    }

    setCancelledOrders((prev) => [closed, ...prev]);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <header className="h-16 flex items-center justify-between px-4 sm:px-10 border-b border-black/5 dark:border-white/5 bg-white/40 dark:bg-black/40 backdrop-blur-md sticky top-0 z-50 transition-colors duration-500">
        <div className="flex items-center space-x-2 sm:space-x-4">
          <span className="uppercase tracking-[0.2em] sm:tracking-[0.3em] text-[10px] sm:text-xs font-bold text-black dark:text-white">
            The Obsidian Palace
          </span>
          <span className="text-black/20 dark:text-white/20">|</span>
          <span className="uppercase tracking-[0.1em] text-[8px] sm:text-[10px] text-black/60 dark:text-white/60">
            Chef Console
          </span>
        </div>

        <div className="flex items-center gap-3 sm:gap-4">
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-[10px] uppercase tracking-widest text-black/60 dark:text-white/60">
            <ChefHat size={12} />
            Admin
          </div>
          <ThemeToggle />
        </div>
      </header>

      <section className="w-full px-4 sm:px-10 pt-5 pb-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
          <div className="flex items-center gap-2">
            {dashboardView === "orders" ? <LayoutGrid size={16} className="text-gold" /> : <BarChart3 size={16} className="text-gold" />}
            <h2 className="text-sm sm:text-base uppercase tracking-[0.2em] font-bold text-black/80 dark:text-white/90">
              {dashboardView === "orders" ? ordersHeading : "Hotel Analytics"}
            </h2>
          </div>

          <div className="w-full sm:w-auto flex flex-col items-start sm:items-end gap-2">
            <div className="w-full sm:w-auto overflow-x-auto no-scrollbar">
              <div className="flex items-center gap-4 whitespace-nowrap min-w-max">
                {(
                  [
                    { id: "all", label: "ALL" },
                    { id: "active", label: "ACTIVE ORDER" },
                    { id: "previous", label: "PREVIOUS ORDER" },
                    { id: "cancelled", label: "CANCELLED ORDER" },
                  ] as const
                ).map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setOrderView(tab.id);
                      setDashboardView("orders");
                    }}
                    className={`text-[10px] sm:text-xs font-bold uppercase tracking-[0.18em] pb-1 transition-colors ${
                      orderView === tab.id && dashboardView === "orders"
                        ? "text-gold border-b-2 border-gold"
                        : "text-black/55 dark:text-white/55 border-b-2 border-transparent"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setDashboardView("orders")}
                className={`text-[10px] sm:text-xs font-bold uppercase tracking-[0.18em] pb-1 transition-colors ${
                  dashboardView === "orders"
                    ? "text-gold border-b-2 border-gold"
                    : "text-black/55 dark:text-white/55 border-b-2 border-transparent"
                }`}
              >
                Orders
              </button>
              <button
                onClick={() => setDashboardView("analytics")}
                className={`text-[10px] sm:text-xs font-bold uppercase tracking-[0.18em] pb-1 transition-colors ${
                  dashboardView === "analytics"
                    ? "text-gold border-b-2 border-gold"
                    : "text-black/55 dark:text-white/55 border-b-2 border-transparent"
                }`}
              >
                Analytics
              </button>
            </div>
          </div>
        </div>
      </section>

      <main className="flex-1 px-4 sm:px-10 pb-8 sm:pb-10">
        <div className="space-y-7">
          {dashboardView === "orders" && (orderView === "all" || orderView === "active") && (
            <section className="space-y-3">
              {sortedActiveOrders.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
                  {sortedActiveOrders.map((order, index) => (
                    <article
                      key={order.id}
                      className="bg-glass border border-black/10 dark:border-white/10 rounded-xl p-4 sm:p-5 shadow-sm"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-[10px] uppercase tracking-[0.2em] text-gold font-bold">Queue #{index + 1}</p>
                          <p className="text-sm sm:text-base font-bold tracking-wide text-black dark:text-white mt-1">{order.id}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] uppercase tracking-widest text-black/45 dark:text-white/45">Table</p>
                          <p className="text-lg sm:text-xl font-bold text-black dark:text-white">{order.tableNumber}</p>
                        </div>
                      </div>

                      <div className="mt-3 space-y-1.5 text-xs text-black/65 dark:text-white/65">
                        <p>
                          Guest: <span className="text-black dark:text-white">{order.guestName}</span>
                        </p>
                        <p>
                          Ordered: <span className="text-black dark:text-white">{formatTime(order.orderedAt)}</span>
                        </p>
                        <p>
                          Waiting: <span className="text-black dark:text-white">{minutesSince(order.orderedAt)} min</span>
                        </p>
                        {order.specialNote ? (
                          <p className="text-amber-700 dark:text-amber-300">Note: {order.specialNote}</p>
                        ) : null}
                      </div>

                      <div className="mt-3.5 border-t border-black/10 dark:border-white/10 pt-3">
                        <p className="text-[10px] uppercase tracking-widest text-black/45 dark:text-white/45 mb-2">Items</p>
                        <ul className="space-y-1.5">
                          {order.items.map((item) => (
                            <li key={`${order.id}-${item.name}`} className="flex items-center justify-between gap-3 text-sm">
                              <span className="text-black/80 dark:text-white/85">{item.name}</span>
                              <span className="text-[11px] px-2 py-0.5 rounded-full bg-black/5 dark:bg-white/10 border border-black/10 dark:border-white/15 text-black/70 dark:text-white/70">
                                x{item.qty}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="mt-4 grid grid-cols-2 gap-2.5">
                        <button
                          onClick={() => closeOrder(order, "completed")}
                          className="h-9 rounded-lg border border-green-600/30 bg-green-600/15 text-green-700 dark:text-green-300 text-[10px] uppercase tracking-[0.14em] font-bold hover:bg-green-600/25 transition-colors"
                        >
                          Complete
                        </button>
                        <button
                          onClick={() => closeOrder(order, "cancelled")}
                          className="h-9 rounded-lg border border-red-600/30 bg-red-600/15 text-red-700 dark:text-red-300 text-[10px] uppercase tracking-[0.14em] font-bold hover:bg-red-600/25 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="bg-glass border border-black/10 dark:border-white/10 rounded-xl p-7 text-center text-sm text-black/60 dark:text-white/60">
                  No active orders in queue.
                </div>
              )}
            </section>
          )}

          {dashboardView === "orders" && (orderView === "all" || orderView === "previous" || orderView === "cancelled") && (
            <section
              className={`grid grid-cols-1 gap-4 sm:gap-5 ${
                orderView === "all" ? "lg:grid-cols-2" : "max-w-4xl"
              }`}
            >
              {(orderView === "all" || orderView === "previous") && (
                <article className="bg-glass border border-black/10 dark:border-white/10 rounded-xl p-4 sm:p-5">
                  <div className="flex items-center gap-2 mb-3.5">
                    <CheckCircle2 size={15} className="text-green-600" />
                    <h3 className="text-[11px] sm:text-xs uppercase tracking-[0.18em] font-bold text-black/80 dark:text-white/90">
                      Previous Orders
                    </h3>
                  </div>

                  <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
                    {previousOrders.length === 0 ? (
                      <p className="text-xs text-black/55 dark:text-white/55">No completed orders yet.</p>
                    ) : (
                      previousOrders.map((order) => (
                        <div
                          key={order.id}
                          className="rounded-lg border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 p-3"
                        >
                          <div className="flex items-center justify-between gap-2 text-xs">
                            <span className="font-bold text-black dark:text-white">{order.id}</span>
                            <span className="text-black/60 dark:text-white/60">Table {order.tableNumber}</span>
                          </div>
                          <div className="mt-1 text-[11px] text-black/60 dark:text-white/60">
                            Completed at {formatTime(order.closedAt)}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </article>
              )}

              {(orderView === "all" || orderView === "cancelled") && (
                <article className="bg-glass border border-black/10 dark:border-white/10 rounded-xl p-4 sm:p-5">
                  <div className="flex items-center gap-2 mb-3.5">
                    <XCircle size={15} className="text-red-600" />
                    <h3 className="text-[11px] sm:text-xs uppercase tracking-[0.18em] font-bold text-black/80 dark:text-white/90">
                      Cancelled Orders
                    </h3>
                  </div>

                  <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
                    {cancelledOrders.length === 0 ? (
                      <p className="text-xs text-black/55 dark:text-white/55">No cancelled orders.</p>
                    ) : (
                      cancelledOrders.map((order) => (
                        <div
                          key={order.id}
                          className="rounded-lg border border-red-600/20 bg-red-600/10 p-3"
                        >
                          <div className="flex items-center justify-between gap-2 text-xs">
                            <span className="font-bold text-black dark:text-white">{order.id}</span>
                            <span className="text-black/60 dark:text-white/60">Table {order.tableNumber}</span>
                          </div>
                          <div className="mt-1 text-[11px] text-black/60 dark:text-white/60">
                            Cancelled at {formatTime(order.closedAt)}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </article>
              )}
            </section>
          )}

          {dashboardView === "analytics" && (
            <section className="space-y-5">
              <div className="flex justify-end">
                <div className="grid grid-cols-2 sm:flex gap-2">
                  {(["daily", "weekly", "monthly", "yearly"] as const).map((window) => (
                    <button
                      key={window}
                      onClick={() => setAnalyticsWindow(window)}
                      className={`h-9 px-3 rounded-lg text-[10px] sm:text-xs uppercase tracking-[0.16em] font-bold border transition-colors ${
                        analyticsWindow === window
                          ? "bg-black text-white border-black dark:bg-white dark:text-black dark:border-white"
                          : "bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10 text-black/65 dark:text-white/65"
                      }`}
                    >
                      {window}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                <article className="bg-glass border border-black/10 dark:border-white/10 rounded-xl p-4">
                  <p className="text-[10px] uppercase tracking-widest text-black/45 dark:text-white/45">Revenue</p>
                  <p className="mt-2 text-2xl font-bold text-black dark:text-white">{currentAnalytics.revenue}</p>
                </article>

                <article className="bg-glass border border-black/10 dark:border-white/10 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-black/45 dark:text-white/45">
                    <ReceiptText size={14} />
                    <p className="text-[10px] uppercase tracking-widest">Completed Orders</p>
                  </div>
                  <p className="mt-2 text-2xl font-bold text-black dark:text-white">{currentAnalytics.completedOrders}</p>
                </article>

                <article className="bg-glass border border-black/10 dark:border-white/10 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-black/45 dark:text-white/45">
                    <XCircle size={14} />
                    <p className="text-[10px] uppercase tracking-widest">Cancelled Orders</p>
                  </div>
                  <p className="mt-2 text-2xl font-bold text-black dark:text-white">{currentAnalytics.cancelledOrders}</p>
                </article>

                <article className="bg-glass border border-black/10 dark:border-white/10 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-black/45 dark:text-white/45">
                    <Clock3 size={14} />
                    <p className="text-[10px] uppercase tracking-widest">Avg Prep Time</p>
                  </div>
                  <p className="mt-2 text-2xl font-bold text-black dark:text-white">{currentAnalytics.avgPrepMinutes} min</p>
                </article>

                <article className="bg-glass border border-black/10 dark:border-white/10 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-black/45 dark:text-white/45">
                    <Landmark size={14} />
                    <p className="text-[10px] uppercase tracking-widest">Occupancy Rate</p>
                  </div>
                  <p className="mt-2 text-2xl font-bold text-black dark:text-white">{currentAnalytics.occupancyRate}</p>
                </article>

                <article className="bg-glass border border-black/10 dark:border-white/10 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-black/45 dark:text-white/45">
                    <Layers size={14} />
                    <p className="text-[10px] uppercase tracking-widest">Most Ordered</p>
                  </div>
                  <p className="mt-2 text-lg sm:text-xl font-bold text-black dark:text-white">{currentAnalytics.popularDish}</p>
                </article>
              </div>

              <article className="bg-glass border border-black/10 dark:border-white/10 rounded-xl p-4 sm:p-5">
                <div className="flex items-center gap-2 text-black/55 dark:text-white/55">
                  <CalendarClock size={14} />
                  <p className="text-[10px] uppercase tracking-[0.18em] font-bold">Performance Note</p>
                </div>
                <p className="mt-3 text-sm text-black/75 dark:text-white/75 leading-relaxed">
                  {analyticsWindow === "daily"
                    ? "Today shows healthy throughput with low cancellation rate. Monitor prep times for table clusters during peak lunch windows."
                    : analyticsWindow === "weekly"
                      ? "Weekly trend is stable with strong occupancy. Focus on staffing balance for weekend evening rush to reduce prep delay."
                      : analyticsWindow === "monthly"
                        ? "Monthly numbers indicate sustained demand. Consider optimizing inventory for best-selling dishes to avoid stockouts."
                        : "Yearly data reflects strong retention and high service consistency. Continue tracking prep-time outliers across seasonal peaks."}
                </p>
              </article>
            </section>
          )}
        </div>
      </main>
    </div>
  );
}

export default function ChefPage() {
  return (
    <ThemeProvider>
      <ChefContent />
    </ThemeProvider>
  );
}
