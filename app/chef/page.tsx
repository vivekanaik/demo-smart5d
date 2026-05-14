"use client";

import React, { useMemo, useState, useEffect } from "react";
import useSWR from "swr";
import { CHEF_TRANSLATIONS, ChefLanguage } from "@/lib/chef-translations";
import { ThemeProvider, useTheme } from "@/components/ThemeProvider";
import {
  BarChart3,
  CheckCircle2,
  Clock3,
  ReceiptText,
  XCircle,
  LayoutGrid,
  Layers,
  Landmark,
  CalendarClock,
  Check,
  MessageCircle,
  Mail,
  Banknote,
  X,
} from "lucide-react";
import { getAnalytics } from "@/actions/analytics";
import { getActiveOrders, updateOrderStatus, updateOrderItemStatus } from "@/actions/orders";
import { getSettings } from "@/actions/settings"; 
import ChefHeader from "@/components/ChefHeader";

// --- Types ---
type OrderItem = {
  id: number;
  name: string;
  quantity: number;
  price: number;
  note?: string | null;
  status: "pending" | "served";
  createdAt: string | Date;
};

type ActiveOrder = {
  id: string;
  tableNumber: string;
  createdAt: string | Date;
  guestName: string;
  contactNumber?: string | null;
  generalNote?: string | null;
  total: number;
  items: OrderItem[];
};

type ClosedOrder = ActiveOrder & {
  closedAt: string | Date;
  closedStatus: "completed" | "cancelled";
};

type AnalyticsWindow = "daily" | "weekly" | "monthly" | "yearly";
type OrderView = "all" | "active" | "previous" | "cancelled";
type DashboardView = "orders" | "analytics";


// --- Components ---
function formatTime(dateVal: string | Date) {
  return new Date(dateVal).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatTimeSince(dateVal: string | Date) {
  const diffMs = Date.now() - new Date(dateVal).getTime();
  const totalMinutes = Math.max(0, Math.floor(diffMs / 60000));
  if (totalMinutes >= 60) {
    const hours = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  }
  return `${totalMinutes}m`;
}

function ChefContent() {
  const [chefLanguage, setChefLanguage] = useState<ChefLanguage>("en");

  useEffect(() => {
    const saved = localStorage.getItem("chefPreferredLanguage") as ChefLanguage;
    if (saved && CHEF_TRANSLATIONS[saved]) {
      setChefLanguage(saved);
    }
    
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "chefPreferredLanguage" && e.newValue && CHEF_TRANSLATIONS[e.newValue as ChefLanguage]) {
        setChefLanguage(e.newValue as ChefLanguage);
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const t = CHEF_TRANSLATIONS[chefLanguage];
  
  const { data: settings } = useSWR("settings", getSettings);
  const gstRate = settings?.gstRate ?? 5; 

  const [dashboardView, setDashboardView] = useState<DashboardView>("orders");
  const [orderView, setOrderView] = useState<OrderView>("all");
  const [analyticsWindow, setAnalyticsWindow] = useState<AnalyticsWindow>("daily");

  const [previousOrders, setPreviousOrders] = useState<ClosedOrder[]>([]);
  const [cancelledOrders, setCancelledOrders] = useState<ClosedOrder[]>([]);

  const [paymentOrder, setPaymentOrder] = useState<ActiveOrder | null>(null);
  const [paymentTab, setPaymentTab] = useState<"whatsapp" | "email" | "external">("whatsapp");
  const [paymentPhone, setPaymentPhone] = useState("");
  const [paymentEmail, setPaymentEmail] = useState("");
  
  const { data: currentAnalytics, isLoading: isAnalyticsLoading } = useSWR(
    ["analytics", analyticsWindow],
    ([_, window]) => getAnalytics(window as AnalyticsWindow),
    { refreshInterval: 30000 }
  );

  const { data: activeOrders = [], mutate, isLoading } = useSWR<ActiveOrder[]>(
    "activeOrders",
    getActiveOrders,
    { refreshInterval: 5000, fallbackData: [] }
  );

  const audioRef = React.useRef<HTMLAudioElement | null>(null);
  const previousOrderIdsRef = React.useRef<Set<string>>(new Set());
  const isInitialLoad = React.useRef(true);

  useEffect(() => {
    audioRef.current = new Audio("/ring.mp3");
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
    const currentIds = new Set(activeOrders.map(o => o.id));
    const newIds = [...currentIds].filter(id => !previousOrderIdsRef.current.has(id));

    if (newIds.length > 0 && !isInitialLoad.current) {
      const isMuted = localStorage.getItem("notification_sound_muted") === "true";
      if (!isMuted && audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(() => {});
      }
    }

    previousOrderIdsRef.current = currentIds;
    if (activeOrders.length > 0 || isInitialLoad.current) {
      isInitialLoad.current = false;
    }
  }, [activeOrders]);

  const sortedActiveOrders = useMemo(
    () => [...activeOrders].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()),
    [activeOrders],
  );

  const ordersHeading =
    orderView === "all"
      ? t.ordersHeadingAll
      : orderView === "active"
        ? t.ordersHeadingActive
        : orderView === "previous"
          ? t.ordersHeadingPrevious
          : t.ordersHeadingCancelled;

  const closeOrder = async (order: ActiveOrder, status: "completed" | "cancelled") => {
    mutate(
      (prev: ActiveOrder[] = []) => prev.filter((o) => o.id !== order.id),
      false
    );

    const closed: ClosedOrder = {
      ...order,
      closedStatus: status,
      closedAt: new Date().toISOString(),
    };

    if (status === "completed") {
      setPreviousOrders((prev) => [closed, ...prev]);
    } else {
      setCancelledOrders((prev) => [closed, ...prev]);
    }

    await updateOrderStatus(order.id, status);
    mutate();
    setPaymentOrder(null);
  };

  const restoreOrder = async (order: ClosedOrder) => {
    if (order.closedStatus === "completed") {
      setPreviousOrders((prev) => prev.filter((o) => o.id !== order.id));
    } else {
      setCancelledOrders((prev) => prev.filter((o) => o.id !== order.id));
    }

    const restoredActiveOrder: ActiveOrder = {
      id: order.id,
      tableNumber: order.tableNumber,
      createdAt: order.createdAt,
      guestName: order.guestName,
      generalNote: order.generalNote,
      items: order.items,
      total: order.total,
    };
    mutate((prev: ActiveOrder[] = []) => [restoredActiveOrder, ...prev], false);

    await updateOrderStatus(order.id, "active");
    mutate();
  };

  const toggleItemStatus = async (orderId: string, itemId: number, currentStatus: "pending" | "served") => {
    const newStatus = currentStatus === "pending" ? "served" : "pending";

    mutate((prevOrders: ActiveOrder[] = []) => {
      return prevOrders.map(order => {
        if (order.id === orderId) {
          return {
            ...order,
            items: order.items.map(item => 
              item.id === itemId ? { ...item, status: newStatus } : item
            )
          };
        }
        return order;
      });
    }, false);

    await updateOrderItemStatus(itemId, newStatus);
    mutate();
  };

  const openPaymentModal = (order: ActiveOrder) => {
    setPaymentOrder(order);
    setPaymentPhone(order.contactNumber || "");
    setPaymentTab("whatsapp");
  };

  const handleWhatsAppSend = () => {
    if (!paymentOrder) return;
    
    const itemsText = paymentOrder.items.map(i => `- ${i.name} x${i.quantity}`).join("%0A");
    const subtotal = paymentOrder.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const gstAmount = Math.round(subtotal * (gstRate / 100));
    
    // Use dynamic settings if available, else fallback
    const upiLink = settings?.upiId ? `upi://pay?pa=${settings.upiId}&pn=Restaurant&am=${paymentOrder.total}&cu=INR` : "";
    const billUrl = `${window.location.origin}/bill/${paymentOrder.id}`;
    
    const text = `Hello ${paymentOrder.guestName || "Guest"}, thank you for dining at The Obsidian Palace! 🏰%0A%0A*Bill Summary (Table ${paymentOrder.tableNumber})*%0A${itemsText}%0A------------------%0A*Subtotal: ₹${subtotal}*%0A*GST (${gstRate}%): ₹${gstAmount}*%0A*Grand Total: ₹${paymentOrder.total}*%0A%0A🧾 View your digital bill here: ${billUrl}%0A${upiLink ? `%0A💸 Pay instantly via UPI: ${upiLink}` : ""}`;
    
    window.open(`https://wa.me/${paymentPhone}?text=${text}`, "_blank");
    closeOrder(paymentOrder, "completed");
  };

  const handleEmailSend = () => {
    if (!paymentOrder || !paymentEmail) return;
    
    const itemsText = paymentOrder.items.map(i => `- ${i.name} x${i.quantity}`).join("%0D%0A");
    const subtotal = paymentOrder.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const gstAmount = Math.round(subtotal * (gstRate / 100));
    
    const upiLink = settings?.upiId ? `upi://pay?pa=${settings.upiId}&pn=Restaurant&am=${paymentOrder.total}&cu=INR` : "";
    const billUrl = `${window.location.origin}/bill/${paymentOrder.id}`;
    
    const subject = `Your Bill from The Obsidian Palace - Table ${paymentOrder.tableNumber}`;
    const body = `Hello ${paymentOrder.guestName || "Guest"},%0D%0A%0D%0AThank you for dining with us!%0D%0A%0D%0ABill Summary:%0D%0A${itemsText}%0D%0A------------------%0D%0ASubtotal: ₹${subtotal}%0D%0AGST (${gstRate}%): ₹${gstAmount}%0D%0AGrand Total: ₹${paymentOrder.total}%0D%0A%0D%0A🧾 View your digital bill here: ${billUrl}%0D%0A${upiLink ? `%0D%0A💸 Pay via UPI: ${upiLink}` : ""}`;
    
    window.open(`mailto:${paymentEmail}?subject=${subject}&body=${body}`, "_blank");
    closeOrder(paymentOrder, "completed");
  };

  return (
    <div className={`flex flex-col min-h-screen relative ${chefLanguage !== "en" ? "regional-lang" : ""}`}>
      <ChefHeader subtitle={t.dashboardTitle} />

      <section className="w-full px-4 sm:px-10 pt-5 pb-3 space-y-4">
        {/* Top Row: Title & Main Views */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            {dashboardView === "orders" ? <LayoutGrid size={16} className="text-gold" /> : <BarChart3 size={16} className="text-gold" />}
            <h2 className="text-sm sm:text-base uppercase tracking-[0.2em] font-bold text-black/80 dark:text-white/90">
              {dashboardView === "orders" ? ordersHeading : t.hotelAnalytics}
            </h2>
          </div>

          <div className="flex items-center bg-black/5 dark:bg-white/5 p-1 rounded-lg self-start sm:self-auto w-full sm:w-auto">
            <button
              onClick={() => setDashboardView("orders")}
              className={`flex-1 sm:flex-none px-6 py-2 rounded-md text-[10px] sm:text-xs font-bold uppercase tracking-[0.15em] transition-all ${
                dashboardView === "orders"
                  ? "bg-white dark:bg-[#1a1a1a] text-gold shadow-sm"
                  : "text-black/50 dark:text-white/50 hover:text-black dark:hover:text-white"
              }`}
            >
              {t.btnOrders}
            </button>
            <button
              onClick={() => setDashboardView("analytics")}
              className={`flex-1 sm:flex-none px-6 py-2 rounded-md text-[10px] sm:text-xs font-bold uppercase tracking-[0.15em] transition-all ${
                dashboardView === "analytics"
                  ? "bg-white dark:bg-[#1a1a1a] text-gold shadow-sm"
                  : "text-black/50 dark:text-white/50 hover:text-black dark:hover:text-white"
              }`}
            >
              {t.btnAnalytics}
            </button>
          </div>
        </div>

        {/* Bottom Row: Order Status Filters */}
        {dashboardView === "orders" && (
          <div className="w-full overflow-x-auto pt-1 pb-1">
            <div className="flex items-center gap-2 sm:gap-3 whitespace-nowrap min-w-max">
              {(
                [
                  { id: "all", label: t.tabAll },
                  { id: "active", label: t.tabActive },
                  { id: "previous", label: t.tabPrevious },
                  { id: "cancelled", label: t.tabCancelled },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setOrderView(tab.id)}
                  className={`text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.15em] px-4 py-2 rounded-full transition-all ${
                    orderView === tab.id
                      ? "bg-gold/10 text-gold border border-gold/20 shadow-sm"
                      : "bg-transparent text-black/50 dark:text-white/50 border border-black/5 dark:border-white/5 hover:bg-black/5 dark:hover:bg-white/5"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </section>

      <main className="flex-1 px-4 sm:px-10 pb-8 sm:pb-10">
        <div className="space-y-7">
          {dashboardView === "orders" && (orderView === "all" || orderView === "active") && (
            <section className="space-y-3">
              {isLoading && activeOrders.length === 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
                  {[1, 2, 3].map((i) => (
                    <article key={i} className="bg-glass border border-black/10 dark:border-white/10 rounded-xl p-4 sm:p-5 shadow-sm animate-pulse">
                      <div className="flex justify-between gap-4 mb-4">
                        <div className="space-y-2">
                          <div className="w-16 h-3 bg-black/10 dark:bg-white/10 rounded"></div>
                          <div className="w-24 h-5 bg-black/10 dark:bg-white/10 rounded"></div>
                        </div>
                        <div className="space-y-2 items-end flex flex-col">
                          <div className="w-10 h-3 bg-black/10 dark:bg-white/10 rounded"></div>
                          <div className="w-8 h-6 bg-black/10 dark:bg-white/10 rounded"></div>
                        </div>
                      </div>
                      <div className="space-y-2 mb-5 border-b border-black/10 dark:border-white/10 pb-4">
                         <div className="w-3/4 h-3 bg-black/10 dark:bg-white/10 rounded"></div>
                         <div className="w-1/2 h-3 bg-black/10 dark:bg-white/10 rounded"></div>
                      </div>
                      <div className="space-y-3">
                         <div className="w-full h-4 bg-black/10 dark:bg-white/10 rounded"></div>
                         <div className="w-full h-4 bg-black/10 dark:bg-white/10 rounded"></div>
                      </div>
                      <div className="mt-5 grid grid-cols-2 gap-2.5">
                         <div className="h-9 rounded-lg bg-black/10 dark:bg-white/10"></div>
                         <div className="h-9 rounded-lg bg-black/10 dark:bg-white/10"></div>
                      </div>
                    </article>
                  ))}
                </div>
              ) : sortedActiveOrders.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
                  {sortedActiveOrders.map((order, index) => {
                    const pendingOrderCount = order.items.filter(i => i.status === "pending").length;
                    
                    const orderSubtotal = order.items.reduce((acc, item) => acc + item.price * item.quantity, 0);
                    const orderGst = Math.round(orderSubtotal * (gstRate / 100));

                    return (
                      <article
                        key={order.id}
                        className={`bg-glass border rounded-xl p-4 sm:p-5 shadow-sm transition-all duration-300 ${
                          pendingOrderCount === 0 
                            ? "border-green-500/30 dark:border-green-400/30" 
                            : "border-black/10 dark:border-white/10"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="text-[10px] uppercase tracking-[0.2em] text-gold font-bold">{t.queue}{index + 1}</p>
                            <p className="text-sm sm:text-base font-bold tracking-wide text-black dark:text-white mt-1">{order.id}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-[10px] uppercase tracking-widest text-black/45 dark:text-white/45">{t.table}</p>
                            <p className="text-lg sm:text-xl font-bold text-black dark:text-white">{order.tableNumber}</p>
                          </div>
                        </div>

                        <div className="mt-3 space-y-1 text-xs text-black/65 dark:text-white/65">
                          <p>{t.guest} <span className="text-black dark:text-white">{order.guestName}</span></p>
                          <p>{t.tableSeated} <span className="text-black dark:text-white">{formatTime(order.createdAt)}</span></p>
                          
                          <div className="pt-1.5 pb-0.5">
                             <p>{t.subtotal} <span className="font-bold text-black dark:text-white">₹{orderSubtotal}</span></p>
                             <p>GST ({gstRate}%): <span className="font-bold text-black dark:text-white">₹{orderGst}</span></p>
                             <p className="mt-0.5">{t.totalBill} <span className="text-gold font-bold text-sm">₹{order.total}</span></p>
                          </div>

                          {order.generalNote ? (
                            <p className="text-amber-700 dark:text-amber-300 bg-amber-500/10 p-2 rounded mt-1">
                              {t.note} {order.generalNote}
                            </p>
                          ) : null}
                        </div>

                        <div className="mt-3.5 border-t border-black/10 dark:border-white/10 pt-3">
                          <div className="flex justify-between items-center mb-2">
                            <p className="text-[10px] uppercase tracking-widest text-black/45 dark:text-white/45">{t.orderItems}</p>
                            {pendingOrderCount === 0 && order.items.length > 0 && (
                              <span className="text-[9px] uppercase tracking-widest text-green-600 dark:text-green-400 font-bold">
                                {t.allServed}
                              </span>
                            )}
                          </div>
                          
                          <ul className="space-y-1">
                            {[...order.items].sort((a, b) => (a.status === "pending" ? -1 : 1)).map((item) => (
                              <li 
                                key={`${order.id}-${item.id}`} 
                                className={`flex items-center justify-between gap-3 text-sm p-1.5 -mx-1.5 rounded-md transition-colors ${
                                  item.status === 'served' 
                                    ? 'bg-black/5 dark:bg-white/5 opacity-50' 
                                    : 'hover:bg-black/5 dark:hover:bg-white/5'
                                }`}
                              >
                                <div className="flex items-center gap-2.5">
                                  <button 
                                    onClick={() => toggleItemStatus(order.id, item.id, item.status)}
                                    className={`shrink-0 w-4 h-4 rounded-sm border flex items-center justify-center transition-all ${
                                      item.status === 'served' 
                                        ? 'bg-green-500 border-green-500 text-white' 
                                        : 'border-black/30 dark:border-white/30 text-transparent hover:border-black/50 dark:hover:border-white/50'
                                    }`}
                                  >
                                    <Check size={12} strokeWidth={3} />
                                  </button>
                                  
                                  <div className="flex flex-col">
                                    <span className={`text-black/80 dark:text-white/85 transition-all ${item.status === 'served' ? 'line-through' : ''}`}>
                                      {item.name}
                                    </span>
                                    {item.note && (
                                      <span className={`text-[10px] text-amber-600 block leading-tight ${item.status === 'served' ? 'line-through' : ''}`}>
                                        ({item.note})
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                  {item.status === "pending" && (
                                    <span className="text-[9px] text-amber-600/80 dark:text-amber-400/80 hidden sm:block">
                                      {formatTimeSince(item.createdAt)}
                                    </span>
                                  )}
                                  <span className={`text-[11px] px-2 py-0.5 rounded-full border text-black/70 dark:text-white/70 ${
                                    item.status === 'served' 
                                      ? 'bg-transparent border-black/10 dark:border-white/10' 
                                      : 'bg-black/5 dark:bg-white/10 border-black/10 dark:border-white/15'
                                  }`}>
                                    x{item.quantity}
                                  </span>
                                </div>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="mt-4 grid grid-cols-2 gap-2.5">
                          <button
                            onClick={() => openPaymentModal(order)}
                            className="h-9 rounded-lg border border-green-600/30 bg-green-600/15 text-green-700 dark:text-green-300 text-[10px] uppercase tracking-[0.14em] font-bold hover:bg-green-600/25 transition-colors cursor-pointer"
                          >
                            {t.closeTable}
                          </button>
                          <button
                            onClick={() => closeOrder(order, "cancelled")}
                            className="h-9 rounded-lg border border-red-600/30 bg-red-600/15 text-red-700 dark:text-red-300 text-[10px] uppercase tracking-[0.14em] font-bold hover:bg-red-600/25 transition-colors cursor-pointer"
                          >
                            {t.cancelTable}
                          </button>
                        </div>
                      </article>
                    );
                  })}
                </div>
              ) : (
                <div className="bg-glass border border-black/10 dark:border-white/10 rounded-xl p-7 text-center text-sm text-black/60 dark:text-white/60">
                  {t.noActiveOrders}
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
                      {t.ordersHeadingPrevious}
                    </h3>
                  </div>

                  <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
                    {previousOrders.length === 0 ? (
                      <p className="text-xs text-black/55 dark:text-white/55">{t.noCompletedOrders}</p>
                    ) : (
                      previousOrders.map((order) => (
                        <div
                          key={order.id}
                          className="rounded-lg border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 p-3"
                        >
                          <div className="flex items-center justify-between gap-2 text-xs">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-black dark:text-white">{order.id}</span>
                              <span className="text-black/60 dark:text-white/60">| Table {order.tableNumber}</span>
                            </div>
                            <button 
                              onClick={() => restoreOrder(order)}
                              className="text-[9px] uppercase tracking-widest text-gold hover:text-amber-500 transition-colors font-bold cursor-pointer"
                            >
                              {t.restore}
                            </button>
                          </div>
                          <div className="mt-1 text-[11px] text-black/60 dark:text-white/60">
                            {t.completedAt} {formatTime(order.closedAt)}
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
                      {t.ordersHeadingCancelled}
                    </h3>
                  </div>

                  <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
                    {cancelledOrders.length === 0 ? (
                      <p className="text-xs text-black/55 dark:text-white/55">{t.noCancelledOrders}</p>
                    ) : (
                      cancelledOrders.map((order) => (
                        <div
                          key={order.id}
                          className="rounded-lg border border-red-600/20 bg-red-600/10 p-3"
                        >
                          <div className="flex items-center justify-between gap-2 text-xs">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-black dark:text-white">{order.id}</span>
                              <span className="text-black/60 dark:text-white/60">| Table {order.tableNumber}</span>
                            </div>
                            <button 
                              onClick={() => restoreOrder(order)}
                              className="text-[9px] uppercase tracking-widest text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 transition-colors font-bold cursor-pointer"
                            >
                              {t.restore}
                            </button>
                          </div>
                          <div className="mt-1 text-[11px] text-black/60 dark:text-white/60">
                            {t.cancelledAt} {formatTime(order.closedAt)}
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
                

              <div className="flex w-full overflow-x-auto scrollbar-hide sm:w-auto gap-2">
                  {(["daily", "weekly", "monthly", "yearly"] as const).map((window) => (
                    <button
                      key={window}
                      onClick={() => setAnalyticsWindow(window)}
                      className={`flex-1 sm:flex-none h-9 px-2 sm:px-3 rounded-lg text-[9px] sm:text-xs uppercase tracking-[0.12em] sm:tracking-[0.16em] font-bold border transition-colors whitespace-nowrap ${
                        analyticsWindow === window
                          ? "bg-black text-white border-black dark:bg-white dark:text-black dark:border-white"
                          : "bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10 text-black/65 dark:text-white/65"
                      }`}
                    >
                      {t[window as keyof typeof t]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Analytics Dashboard Grid */}
              {isAnalyticsLoading || !currentAnalytics ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <article key={i} className="bg-glass border border-black/10 dark:border-white/10 rounded-xl p-4 sm:p-5 animate-pulse">
                      <div className="w-24 h-3 bg-black/10 dark:bg-white/10 rounded mb-4"></div>
                      <div className="w-20 h-7 bg-black/10 dark:bg-white/10 rounded"></div>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 transition-opacity duration-300">
                  <article className="bg-glass border border-black/10 dark:border-white/10 rounded-xl p-4">
                    <p className="text-[10px] uppercase tracking-widest text-black/45 dark:text-white/45">{t.revenue}</p>
                    <p className="mt-2 text-2xl font-bold text-black dark:text-white">{currentAnalytics.revenue}</p>
                  </article>

                  <article className="bg-glass border border-black/10 dark:border-white/10 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-black/45 dark:text-white/45">
                      <ReceiptText size={14} />
                      <p className="text-[10px] uppercase tracking-widest">{t.completedOrdersAnalytics}</p>
                    </div>
                    <p className="mt-2 text-2xl font-bold text-black dark:text-white">{currentAnalytics.completedOrders}</p>
                  </article>

                  <article className="bg-glass border border-black/10 dark:border-white/10 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-black/45 dark:text-white/45">
                      <XCircle size={14} />
                      <p className="text-[10px] uppercase tracking-widest">{t.cancelledOrdersAnalytics}</p>
                    </div>
                    <p className="mt-2 text-2xl font-bold text-black dark:text-white">{currentAnalytics.cancelledOrders}</p>
                  </article>

                  <article className="bg-glass border border-black/10 dark:border-white/10 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-black/45 dark:text-white/45">
                      <Clock3 size={14} />
                      <p className="text-[10px] uppercase tracking-widest">{t.avgPrepTime}</p>
                    </div>
                    <p className="mt-2 text-2xl font-bold text-black dark:text-white">{currentAnalytics.avgPrepMinutes} min</p>
                  </article>

                  <article className="bg-glass border border-black/10 dark:border-white/10 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-black/45 dark:text-white/45">
                      <Landmark size={14} />
                      <p className="text-[10px] uppercase tracking-widest">{t.occupancyRate}</p>
                    </div>
                    <p className="mt-2 text-2xl font-bold text-black dark:text-white">{currentAnalytics.occupancyRate}</p>
                  </article>

                  <article className="bg-glass border border-black/10 dark:border-white/10 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-black/45 dark:text-white/45">
                      <Layers size={14} />
                      <p className="text-[10px] uppercase tracking-widest">{t.mostOrdered}</p>
                    </div>
                    <p className="mt-2 text-lg sm:text-xl font-bold text-black dark:text-white truncate" title={currentAnalytics.popularDish}>
                      {currentAnalytics.popularDish}
                    </p>
                  </article>
                </div>
              )}

              <article className="bg-glass border border-black/10 dark:border-white/10 rounded-xl p-4 sm:p-5">
                <div className="flex items-center gap-2 text-black/55 dark:text-white/55">
                  <CalendarClock size={14} />
                  <p className="text-[10px] uppercase tracking-[0.18em] font-bold">{t.performanceNote}</p>
                </div>
                <p className="mt-3 text-sm text-black/75 dark:text-white/75 leading-relaxed">
                  {analyticsWindow === "daily"
                    ? t.perfDaily
                    : analyticsWindow === "weekly"
                      ? t.perfWeekly
                      : analyticsWindow === "monthly"
                        ? t.perfMonthly
                        : t.perfYearly}
                </p>
              </article>
            </section>
          )}
        </div>
      </main>

      {/* PAYMENT MODAL OVERLAY */}
      {paymentOrder && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-white dark:bg-[#0a0a0a] border border-black/10 dark:border-white/10 p-6 rounded-2xl shadow-2xl relative">
            <button 
              onClick={() => setPaymentOrder(null)} 
              className="absolute top-4 right-4 text-black/40 dark:text-white/40 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
            
            <div className="mb-6 mt-2">
               <h3 className="text-xl font-serif italic text-black dark:text-white">{t.checkoutTable} {paymentOrder.tableNumber}</h3>
               <p className="text-xs text-black/50 dark:text-white/50 font-light mt-1">
                  Guest: {paymentOrder.guestName}
               </p>
               
               {(() => {
                  const modalSub = paymentOrder.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
                  const modalGst = Math.round(modalSub * (gstRate / 100));
                  return (
                    <div className="flex items-center gap-3 mt-3 text-[11px] uppercase tracking-widest text-black/70 dark:text-white/70">
                       <p>Sub: ₹{modalSub}</p>
                       <p>GST: ₹{modalGst}</p>
                       <p className="font-bold text-gold text-sm ml-auto">Total: ₹{paymentOrder.total}</p>
                    </div>
                  );
               })()}
            </div>

            {/* Payment Tabs */}
            <div className="flex bg-black/5 dark:bg-white/5 rounded-xl p-1 mb-5">
              <button
                onClick={() => setPaymentTab("whatsapp")}
                className={`flex-1 flex items-center justify-center gap-2 py-2 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-colors cursor-pointer ${
                  paymentTab === "whatsapp" 
                    ? "bg-green-500 text-white shadow-sm" 
                    : "text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white"
                }`}
              >
                <MessageCircle size={14} /> {t.whatsapp}
              </button>
              <button
                onClick={() => setPaymentTab("email")}
                className={`flex-1 flex items-center justify-center gap-2 py-2 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-colors cursor-pointer ${
                  paymentTab === "email" 
                    ? "bg-blue-500 text-white shadow-sm" 
                    : "text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white"
                }`}
              >
                <Mail size={14} /> {t.email}
              </button>
              <button
                onClick={() => setPaymentTab("external")}
                className={`flex-1 flex items-center justify-center gap-2 py-2 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-colors cursor-pointer ${
                  paymentTab === "external" 
                    ? "bg-gold text-white shadow-sm" 
                    : "text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white"
                }`}
              >
                <Banknote size={14} /> {t.cashCard}
              </button>
            </div>

            {/* Tab Contents */}
            <div className="space-y-4">
              {paymentTab === "whatsapp" && (
                <div className="space-y-3">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-black/50 dark:text-white/50 ml-1">
                     {t.whatsappNumber}
                  </label>
                  <input
                    type="tel"
                    value={paymentPhone}
                    onChange={(e) => setPaymentPhone(e.target.value)}
                    className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 py-3 px-4 rounded-xl text-sm focus:outline-none focus:border-green-500 text-black dark:text-white placeholder:text-black/30 dark:placeholder:text-white/30"
                    placeholder="Enter phone number"
                  />
                  <button 
                    onClick={handleWhatsAppSend}
                    disabled={!paymentPhone}
                    className="w-full bg-green-500 hover:bg-green-600 disabled:bg-green-500/50 text-white font-bold uppercase tracking-[0.1em] text-[10px] sm:text-xs py-3.5 rounded-xl transition-all shadow-md cursor-pointer mt-2"
                  >
                    Send Bill & {t.closeTable}
                  </button>
                </div>
              )}

              {paymentTab === "email" && (
                <div className="space-y-3">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-black/50 dark:text-white/50 ml-1">
                     {t.emailAddress}
                  </label>
                  <input
                    type="email"
                    value={paymentEmail}
                    onChange={(e) => setPaymentEmail(e.target.value)}
                    className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 py-3 px-4 rounded-xl text-sm focus:outline-none focus:border-blue-500 text-black dark:text-white placeholder:text-black/30 dark:placeholder:text-white/30"
                    placeholder="Enter email address"
                  />
                  <button 
                    onClick={handleEmailSend}
                    disabled={!paymentEmail}
                    className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-blue-500/50 text-white font-bold uppercase tracking-[0.1em] text-[10px] sm:text-xs py-3.5 rounded-xl transition-all shadow-md cursor-pointer mt-2"
                  >
                    Send Receipt & {t.closeTable}
                  </button>
                </div>
              )}

              {paymentTab === "external" && (
                <div className="space-y-4 pt-2">
                  <div className="p-4 bg-black/5 dark:bg-white/5 rounded-xl border border-black/10 dark:border-white/10 text-center">
                    <p className="text-sm text-black/70 dark:text-white/70">
                      Use this if the customer has already paid at the counter via Cash or Card POS machine.
                    </p>
                  </div>
                  <button 
                    onClick={() => closeOrder(paymentOrder, "completed")}
                    className="w-full bg-gold hover:bg-gold/90 text-white font-bold uppercase tracking-[0.1em] text-[10px] sm:text-xs py-3.5 rounded-xl transition-all shadow-md cursor-pointer mt-2"
                  >
                    Mark as Paid & {t.closeTable}
                  </button>
                </div>
              )}
            </div>

          </div>
        </div>
      )}

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