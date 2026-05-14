"use client";

import React, { useMemo, useState } from "react";
import useSWR from "swr";
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
} from "lucide-react";
import { getAnalytics } from "@/actions/analytics";
import { getActiveOrders, updateOrderStatus, updateOrderItemStatus, getClosedOrders, getCancelledOrders } from "@/actions/orders";
import { getSettings } from "@/actions/settings";
import { MessageCircle, Printer, X, Loader2 } from "lucide-react";

type OrderItem = {
  id: number;
  name: string;
  quantity: number;
  price: number;
  note?: string | null;
  status: "pending" | "served";
  createdAt: string | Date;
};

type Order = {
  id: string;
  tableNumber: string;
  createdAt: string | Date;
  closedAt?: string | Date | null;
  guestName: string;
  contactNumber?: string | null;
  generalNote?: string | null;
  total: number;
  status: "active" | "completed" | "cancelled";
  items: OrderItem[];
};

type AnalyticsWindow = "daily" | "weekly" | "monthly" | "yearly";
type OrderView = "all" | "active" | "previous" | "cancelled";
type DashboardView = "orders" | "analytics";

function formatTime(dateVal: string | Date) {
  if (!dateVal) return "";
  return new Date(dateVal).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });
}



function formatDate(dateVal: string | Date) {
  if (!dateVal) return "";
  return new Date(dateVal).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
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

// Receipt HTML Generator
function generateReceiptHTML(order: Order, settings: any, size: "thermal" | "a5" | "a4" | "custom") {
  const subtotal = order.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const cgstRate = settings?.cgstRate || 2.5;
  const sgstRate = settings?.sgstRate || 2.5;
  const cgst = (subtotal * (cgstRate / 100)).toFixed(2);
  const sgst = (subtotal * (sgstRate / 100)).toFixed(2);
  const gstAmount = Math.round(parseFloat(cgst) + parseFloat(sgst));
  const totalQty = order.items.reduce((sum, i) => sum + i.quantity, 0);
  const displayTotal = order.total > 0 ? order.total.toFixed(2) : (subtotal + gstAmount).toFixed(2);
  
  const dateStr = `${formatDate(order.createdAt)}, ${formatTime(order.createdAt)}`;
  
  let widthCss = "width: 100%;";
  if (size === "thermal") widthCss = "width: 80mm; margin: 0 auto;";
  if (size === "a5") widthCss = "width: 148mm; max-width: 100%; margin: 0 auto;";
  if (size === "a4") widthCss = "width: 210mm; max-width: 100%; margin: 0 auto;";

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Receipt</title>
      <style>
        @page { margin: 0; }
        body { 
          font-family: 'Courier New', Courier, monospace; 
          font-size: 12px; 
          line-height: 1.4;
          color: #000;
          margin: 0;
          padding: 10mm 5mm; /* Thermal padding */
        }
        .container {
          ${widthCss}
          box-sizing: border-box;
        }
        .text-center { text-align: center; }
        .text-right { text-align: right; }
        .font-bold { font-weight: bold; }
        .dashed-line {
          border-top: 1px dashed #000;
          margin: 5px 0;
        }
        .table {
          width: 100%;
          border-collapse: collapse;
        }
        .table th, .table td {
          padding: 2px 0;
          vertical-align: top;
        }
        .w-60 { width: 60%; }
        .w-20 { width: 20%; }
        .w-100 { width: 100%; }
        .flex { display: flex; justify-content: space-between; }
        
        /* Size specific adjustments */
        ${size !== "thermal" ? `
          body { font-size: 14px; padding: 20mm; }
        ` : ''}
      </style>
    </head>
    <body>
      <div class="container">
        <div class="text-center font-bold">
          <div style="font-size: 1.2em;">THE OBSIDIAN PALACE</div>
          <div style="font-weight: normal;">
            S USMAN ROAD, T. NAGAR,<br/>
            CHENNAI, TAMIL NADU.<br/>
            PHONE : 044 258636222<br/>
            GSTIN : 33AAAGP0685F1ZH
          </div>
          <br/>
          <div>Retail Invoice</div>
        </div>
        <br/>
        
        <div>Date : ${dateStr}</div>
        <br/>
        <div class="font-bold">${order.guestName ? order.guestName : "Guest"}</div>
        <div>Bill No: ${order.id.slice(0, 8).toUpperCase()}</div>
        <div>Payment Mode: UPI/Cash</div>
        <br/>
        <div>Table : ${order.tableNumber}</div>
        
        <div class="dashed-line"></div>
        <table class="table font-bold">
          <tr>
            <th class="text-left w-60">Item</th>
            <th class="text-right w-20">Qty</th>
            <th class="text-right w-20">Amt</th>
          </tr>
        </table>
        <div class="dashed-line"></div>
        
        <table class="table">
          ${order.items.map(i => `
            <tr>
              <td class="text-left w-60">${i.name}</td>
              <td class="text-right w-20">${i.quantity}</td>
              <td class="text-right w-20">${(i.price * i.quantity).toFixed(2)}</td>
            </tr>
          `).join('')}
        </table>
        <div class="dashed-line"></div>
        
        <table class="table">
          <tr>
            <td class="text-left w-60 font-bold">Sub Total</td>
            <td class="text-right w-20 font-bold">${totalQty}</td>
            <td class="text-right w-20 font-bold">${subtotal.toFixed(2)}</td>
          </tr>
        </table>
        
        <br/>
        <table class="table">
          <tr>
            <td class="text-right w-60">CGST @ ${cgstRate}%</td>
            <td class="text-right w-40">${cgst}</td>
          </tr>
          <tr>
            <td class="text-right w-60">SGST @ ${sgstRate}%</td>
            <td class="text-right w-40">${sgst}</td>
          </tr>
        </table>
        
        <div class="dashed-line"></div>
        <table class="table font-bold" style="font-size: 1.1em;">
          <tr>
            <td class="text-left w-60">TOTAL</td>
            <td class="text-right w-40">Rs ${displayTotal}</td>
          </tr>
        </table>
        <div class="dashed-line"></div>
        
        <br/>
        <div class="text-center">E & O.E</div>
      </div>
    </body>
    </html>
  `;
}

export function KitchenDashboardClient({
  initialActiveOrders,
  initialClosedOrders,
  initialCancelledOrders,
}: {
  initialActiveOrders: Order[];
  initialClosedOrders: Order[];
  initialCancelledOrders: Order[];
}) {
  const [dashboardView, setDashboardView] = useState<DashboardView>("orders");
  const [orderView, setOrderView] = useState<OrderView>("all");
  const [analyticsWindow, setAnalyticsWindow] = useState<AnalyticsWindow>("daily");

  const [checkoutOrder, setCheckoutOrder] = useState<Order | null>(null);
  const [checkoutTab, setCheckoutTab] = useState<"whatsapp" | "print" | "direct">("whatsapp");
  const [paymentPhone, setPaymentPhone] = useState("");
  const [billSent, setBillSent] = useState(false);
  const [processingOrders, setProcessingOrders] = useState<Set<string>>(new Set());
  const [processingItems, setProcessingItems] = useState<Set<number>>(new Set());

  const { data: settings } = useSWR("adminSettings", getSettings);

  const { data: currentAnalytics, isLoading: isAnalyticsLoading } = useSWR(
    ["adminAnalytics", analyticsWindow],
    ([_, window]) => getAnalytics(window as AnalyticsWindow),
    { refreshInterval: 30000 }
  );

  const { data: activeOrders = [], mutate: mutateActive } = useSWR<Order[]>(
    "adminActiveOrders",
    getActiveOrders,
    { refreshInterval: 5000, fallbackData: initialActiveOrders }
  );

  const { data: closedOrders = [], mutate: mutateClosed } = useSWR<Order[]>(
    "adminClosedOrders",
    getClosedOrders,
    { fallbackData: initialClosedOrders }
  );

  const { data: cancelledOrders = [], mutate: mutateCancelled } = useSWR<Order[]>(
    "adminCancelledOrders",
    getCancelledOrders,
    { fallbackData: initialCancelledOrders }
  );

  const sortedActiveOrders = useMemo(
    () => [...activeOrders].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()),
    [activeOrders],
  );

  const closeOrder = async (order: Order, status: "completed" | "cancelled") => {
    setProcessingOrders(prev => new Set(prev).add(order.id));

    await updateOrderStatus(order.id, status);
    
    // Once the update completes, re-fetch the data
    await mutateActive();
    if (status === "completed") await mutateClosed();
    else await mutateCancelled();

    setProcessingOrders(prev => {
      const newSet = new Set(prev);
      newSet.delete(order.id);
      return newSet;
    });
  };

  const restoreOrder = async (order: Order) => {
    // Optimistic Update
    if (order.status === "completed") {
      mutateClosed((prev = []) => prev.filter((o) => o.id !== order.id), false);
    } else {
      mutateCancelled((prev = []) => prev.filter((o) => o.id !== order.id), false);
    }

    const restoredOrder: Order = {
      ...order,
      status: "active",
      closedAt: null,
    };
    
    mutateActive((prev = []) => [restoredOrder, ...prev], false);

    await updateOrderStatus(order.id, "active");
    mutateActive();
    mutateClosed();
    mutateCancelled();
  };

  const toggleItemStatus = async (orderId: string, itemId: number, currentStatus: "pending" | "served") => {
    if (processingItems.has(itemId)) return;
    setProcessingItems(prev => new Set(prev).add(itemId));

    const newStatus = currentStatus === "pending" ? "served" : "pending";

    mutateActive((prevOrders = []) => {
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
    }, { revalidate: false });

    await updateOrderItemStatus(itemId, newStatus);
    
    setProcessingItems(prev => {
      const newSet = new Set(prev);
      newSet.delete(itemId);
      return newSet;
    });
    
    mutateActive();
  };

  const handleCheckoutOpen = (order: Order) => {
    setCheckoutOrder(order);
    setPaymentPhone(order.contactNumber || "");
    setCheckoutTab("whatsapp");
    setBillSent(false);
  };

  const handleWhatsAppSend = () => {
    if (!checkoutOrder) return;
    
    const itemsText = checkoutOrder.items.map(i => `- ${i.name} x${i.quantity}`).join("%0A");
    const subtotal = checkoutOrder.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const cgstRate = settings?.cgstRate || 2.5;
    const sgstRate = settings?.sgstRate || 2.5;
    const cgst = parseFloat((subtotal * (cgstRate / 100)).toFixed(2));
    const sgst = parseFloat((subtotal * (sgstRate / 100)).toFixed(2));
    const gstAmount = Math.round(cgst + sgst);
    
    const upiLink = settings?.upiId ? `upi://pay?pa=${settings?.upiId}&pn=Restaurant&am=${checkoutOrder.total}&cu=INR` : "";
    const billUrl = `${window.location.origin}/bill/${checkoutOrder.id}`;
    
    const text = `Hello ${checkoutOrder.guestName || "Guest"}, thank you for dining with us! 🏰%0A%0A*Bill Summary (Table ${checkoutOrder.tableNumber})*%0A${itemsText}%0A------------------%0A*Subtotal: ₹${subtotal}*%0A*CGST (${cgstRate}%): ₹${cgst}*%0A*SGST (${sgstRate}%): ₹${sgst}*%0A*Grand Total: ₹${checkoutOrder.total}*%0A%0A🧾 View your digital bill here: ${billUrl}%0A${upiLink ? `%0A💸 Pay instantly via UPI: ${upiLink}` : ""}`;
    
    window.open(`https://wa.me/${paymentPhone}?text=${text}`, "_blank");
    setBillSent(true);
  };

  const handlePrint = (size: "thermal" | "a5" | "a4" | "custom") => {
    if (!checkoutOrder) return;
    
    // Generate HTML
    const htmlContent = generateReceiptHTML(checkoutOrder, settings, size);
    
    // Create hidden iframe
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    document.body.appendChild(iframe);
    
    const doc = iframe.contentWindow?.document;
    if (doc) {
      doc.open();
      doc.write(htmlContent);
      doc.close();
      
      // Wait for fonts/styles to parse then print
      iframe.contentWindow?.focus();
      setTimeout(() => {
        iframe.contentWindow?.print();
        
        // Remove iframe after print dialog is closed (or after a delay)
        setTimeout(() => {
          document.body.removeChild(iframe);
        }, 1000);
      }, 50);
    }
  };

  return (
    <div className="flex flex-col space-y-6">
      
      {/* Top Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        
        {/* Toggle Dashboard/Analytics */}
        <div className="flex items-center rounded-lg border border-zinc-200 bg-zinc-50 p-1 dark:border-zinc-800 dark:bg-zinc-900/50 self-start sm:self-auto w-full sm:w-auto">
          <button
            onClick={() => setDashboardView("orders")}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2 rounded-md text-xs font-bold uppercase tracking-wider transition-all ${
              dashboardView === "orders"
                ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-800 dark:text-zinc-50"
                : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
            }`}
          >
            <LayoutGrid size={14} />
            Orders
          </button>
          <button
            onClick={() => setDashboardView("analytics")}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2 rounded-md text-xs font-bold uppercase tracking-wider transition-all ${
              dashboardView === "analytics"
                ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-800 dark:text-zinc-50"
                : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
            }`}
          >
            <BarChart3 size={14} />
            Analytics
          </button>
        </div>

        {/* Order Tabs (Only when in Orders View) */}
        {dashboardView === "orders" && (
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {(
              [
                { id: "all", label: "All Tickets" },
                { id: "active", label: "Active" },
                { id: "previous", label: "Previous" },
                { id: "cancelled", label: "Cancelled" },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                onClick={() => setOrderView(tab.id)}
                className={`whitespace-nowrap px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${
                  orderView === tab.id
                    ? "bg-yellow-50 text-yellow-700 border border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-500 dark:border-yellow-900/50"
                    : "bg-transparent text-zinc-500 border border-zinc-200 hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-900/50"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <div>
        {dashboardView === "orders" && (orderView === "all" || orderView === "active") && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">Active Kitchen Tickets</h2>
            {sortedActiveOrders.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                {sortedActiveOrders.map((order) => {
                  const pendingCount = order.items.filter(i => i.status === "pending").length;
                  const isAllServed = pendingCount === 0 && order.items.length > 0;

                  return (
                    <div
                      key={order.id}
                      className={`flex flex-col rounded-xl border bg-white dark:bg-zinc-950 shadow-sm transition-all overflow-hidden ${
                        isAllServed 
                          ? "border-green-200 dark:border-green-900/50" 
                          : "border-zinc-200 dark:border-zinc-800"
                      }`}
                    >
                      <div className={`p-4 border-b flex justify-between items-start ${isAllServed ? "bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-900/50" : "bg-zinc-50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800"}`}>
                        <div>
                          <h3 className="font-bold text-lg text-zinc-900 dark:text-zinc-100">Table {order.tableNumber}</h3>
                          <p className="text-xs font-medium text-zinc-500">#{order.id.slice(0, 8)} • {order.guestName}</p>
                          <p className="text-xs text-zinc-500 mt-1">Seated: {formatTime(order.createdAt)}</p>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-bold px-2 py-1 bg-zinc-200 dark:bg-zinc-800 rounded-md">
                            {order.items.length} Items
                          </span>
                        </div>
                      </div>

                      <div className="p-4 flex-1">
                        {order.generalNote && (
                          <div className="mb-4 text-xs text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-900/20 p-2 rounded-md border border-amber-200 dark:border-amber-900/50">
                            <strong>Note:</strong> {order.generalNote}
                          </div>
                        )}

                        <ul className="space-y-2">
                          {[...order.items].sort((a, b) => (a.status === "pending" ? -1 : 1)).map((item) => (
                            <li 
                              key={`${order.id}-${item.id}`} 
                              className={`flex items-start justify-between gap-3 p-2 rounded-lg border transition-colors ${
                                item.status === 'served' 
                                  ? 'bg-zinc-50 border-zinc-100 opacity-60 dark:bg-zinc-900/50 dark:border-zinc-800/50' 
                                  : 'bg-white border-zinc-200 dark:bg-zinc-950 dark:border-zinc-800 hover:border-yellow-200 dark:hover:border-yellow-900/50'
                              }`}
                            >
                              <div className="flex items-start gap-3">
                                <button 
                                  onClick={() => toggleItemStatus(order.id, item.id, item.status)}
                                  disabled={processingItems.has(item.id)}
                                  className={`mt-0.5 shrink-0 w-5 h-5 rounded flex items-center justify-center transition-all ${
                                    item.status === 'served' 
                                      ? 'bg-green-500 text-white' 
                                      : 'border border-zinc-300 dark:border-zinc-700 text-transparent hover:border-green-500 hover:text-green-500'
                                  }`}
                                >
                                  {processingItems.has(item.id) ? (
                                    <Loader2 className="w-3 h-3 text-zinc-500 animate-spin" />
                                  ) : (
                                    <Check size={14} strokeWidth={3} />
                                  )}
                                </button>
                                
                                <div>
                                  <p className={`text-sm font-medium ${item.status === 'served' ? 'line-through text-zinc-500' : 'text-zinc-900 dark:text-zinc-100'}`}>
                                    {item.quantity}x {item.name}
                                  </p>
                                  {item.note && (
                                    <p className={`text-xs mt-0.5 ${item.status === 'served' ? 'text-zinc-400' : 'text-red-500'}`}>
                                      {item.note}
                                    </p>
                                  )}
                                </div>
                              </div>
                              
                              {item.status === "pending" && (
                                <span className="text-xs font-medium text-amber-600 bg-amber-50 dark:bg-amber-900/30 px-2 py-0.5 rounded-md whitespace-nowrap">
                                  {formatTimeSince(item.createdAt)}
                                </span>
                              )}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 grid grid-cols-2 gap-3">
                        <button
                          onClick={() => handleCheckoutOpen(order)}
                          className="py-2.5 rounded-lg bg-green-600 hover:bg-green-700 text-white text-xs font-bold uppercase tracking-wider transition-colors"
                        >
                          Checkout
                        </button>
                        <button
                          onClick={() => closeOrder(order, "cancelled")}
                          disabled={processingOrders.has(order.id)}
                          className="py-2.5 rounded-lg border border-red-200 bg-red-50 hover:bg-red-100 text-red-600 dark:border-red-900/50 dark:bg-red-900/20 dark:hover:bg-red-900/40 dark:text-red-400 text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center disabled:opacity-50"
                        >
                          {processingOrders.has(order.id) ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            "Cancel Ticket"
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-12 text-zinc-500 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl bg-zinc-50 dark:bg-zinc-900/20">
                <CheckCircle2 className="h-12 w-12 text-zinc-300 dark:text-zinc-700 mb-4" />
                <p>No active kitchen tickets. Great job!</p>
              </div>
            )}
          </div>
        )}

        {dashboardView === "orders" && (orderView === "all" || orderView === "previous" || orderView === "cancelled") && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
            
            {(orderView === "all" || orderView === "previous") && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={18} className="text-green-600" />
                  <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">Completed Orders</h2>
                </div>
                
                <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                  {closedOrders.length === 0 ? (
                    <p className="text-sm text-zinc-500">No recently completed orders.</p>
                  ) : (
                    closedOrders.map(order => (
                      <div key={order.id} className="flex flex-col bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="font-bold text-zinc-900 dark:text-zinc-100">Table {order.tableNumber}</p>
                            <p className="text-xs text-zinc-500">#{order.id}</p>
                          </div>
                          <button
                            onClick={() => restoreOrder(order)}
                            className="text-xs font-bold text-yellow-600 hover:text-yellow-700 uppercase tracking-wider"
                          >
                            Restore
                          </button>
                        </div>
                        <p className="text-xs text-zinc-500">Closed at: {formatTime(order.closedAt!)}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {(orderView === "all" || orderView === "cancelled") && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <XCircle size={18} className="text-red-600" />
                  <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">Cancelled Orders</h2>
                </div>
                
                <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                  {cancelledOrders.length === 0 ? (
                    <p className="text-sm text-zinc-500">No recently cancelled orders.</p>
                  ) : (
                    cancelledOrders.map(order => (
                      <div key={order.id} className="flex flex-col bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/30 rounded-xl p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="font-bold text-red-900 dark:text-red-100">Table {order.tableNumber}</p>
                            <p className="text-xs text-red-500">#{order.id}</p>
                          </div>
                          <button
                            onClick={() => restoreOrder(order)}
                            className="text-xs font-bold text-red-600 hover:text-red-700 uppercase tracking-wider"
                          >
                            Restore
                          </button>
                        </div>
                        <p className="text-xs text-red-500/70">Cancelled at: {formatTime(order.closedAt!)}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

          </div>
        )}

        {dashboardView === "analytics" && (
          <div className="space-y-6">
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
              {(["daily", "weekly", "monthly", "yearly"] as const).map((window) => (
                <button
                  key={window}
                  onClick={() => setAnalyticsWindow(window)}
                  className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-colors whitespace-nowrap ${
                    analyticsWindow === window
                      ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                      : "bg-white text-zinc-600 border border-zinc-200 hover:bg-zinc-50 dark:bg-zinc-950 dark:text-zinc-400 dark:border-zinc-800 dark:hover:bg-zinc-900/50"
                  }`}
                >
                  {window}
                </button>
              ))}
            </div>

            {isAnalyticsLoading || !currentAnalytics ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 animate-pulse">
                    <div className="w-24 h-4 bg-zinc-200 dark:bg-zinc-800 rounded mb-4"></div>
                    <div className="w-20 h-8 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5">
                  <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Revenue</p>
                  <p className="mt-2 text-3xl font-bold text-zinc-900 dark:text-zinc-100">{currentAnalytics.revenue}</p>
                </div>

                <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5">
                  <div className="flex items-center gap-2 text-zinc-500">
                    <ReceiptText size={16} />
                    <p className="text-xs font-medium uppercase tracking-wider">Completed Orders</p>
                  </div>
                  <p className="mt-2 text-3xl font-bold text-zinc-900 dark:text-zinc-100">{currentAnalytics.completedOrders}</p>
                </div>

                <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5">
                  <div className="flex items-center gap-2 text-zinc-500">
                    <XCircle size={16} />
                    <p className="text-xs font-medium uppercase tracking-wider">Cancelled Orders</p>
                  </div>
                  <p className="mt-2 text-3xl font-bold text-zinc-900 dark:text-zinc-100">{currentAnalytics.cancelledOrders}</p>
                </div>

                <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5">
                  <div className="flex items-center gap-2 text-zinc-500">
                    <Clock3 size={16} />
                    <p className="text-xs font-medium uppercase tracking-wider">Avg Prep Time</p>
                  </div>
                  <p className="mt-2 text-3xl font-bold text-zinc-900 dark:text-zinc-100">{currentAnalytics.avgPrepMinutes} min</p>
                </div>

                <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5">
                  <div className="flex items-center gap-2 text-zinc-500">
                    <Landmark size={16} />
                    <p className="text-xs font-medium uppercase tracking-wider">Occupancy Rate</p>
                  </div>
                  <p className="mt-2 text-3xl font-bold text-zinc-900 dark:text-zinc-100">{currentAnalytics.occupancyRate}</p>
                </div>

                <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5">
                  <div className="flex items-center gap-2 text-zinc-500">
                    <Layers size={16} />
                    <p className="text-xs font-medium uppercase tracking-wider">Most Ordered</p>
                  </div>
                  <p className="mt-2 text-xl font-bold text-zinc-900 dark:text-zinc-100 truncate" title={currentAnalytics.popularDish}>
                    {currentAnalytics.popularDish}
                  </p>
                </div>
              </div>
            )}
            
            <div className="bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 mt-6">
               <div className="flex items-center gap-2 text-zinc-500 mb-2">
                 <CalendarClock size={16} />
                 <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">Performance Insight</h3>
               </div>
               <p className="text-sm text-zinc-600 dark:text-zinc-400">
                 {analyticsWindow === "daily" 
                   ? "Today's metrics are tracking normally. Ensure prep times stay under 15 minutes during peak hours to maintain table turnover."
                   : analyticsWindow === "weekly"
                   ? "Weekly trends show a 12% increase in completed orders compared to last week. Good job!"
                   : analyticsWindow === "monthly"
                   ? "Monthly performance indicates strong revenue growth. Consider reviewing the menu to drop underperforming items."
                   : "Yearly analytics give you the big picture of your restaurant's success and seasonal trends."}
               </p>
            </div>
          </div>
        )}

      </div>

      {/* Checkout Modal */}
      {checkoutOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            
            <div className="flex justify-between items-center p-4 border-b border-zinc-200 dark:border-zinc-800">
              <div>
                <h3 className="font-bold text-lg text-zinc-900 dark:text-zinc-100">Checkout Table {checkoutOrder.tableNumber}</h3>
                <p className="text-xs text-zinc-500">Order #{checkoutOrder.id.slice(0, 8)}</p>
              </div>
              <button 
                onClick={() => setCheckoutOrder(null)}
                className="p-2 text-zinc-400 hover:text-zinc-900 dark:hover:text-white rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-4 overflow-y-auto">
              {/* Tabs */}
              <div className="flex bg-zinc-100 dark:bg-zinc-900 p-1 rounded-lg mb-6">
                <button
                  onClick={() => setCheckoutTab("whatsapp")}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 text-[10px] font-bold uppercase tracking-wider rounded-md transition-colors ${
                    checkoutTab === "whatsapp" 
                      ? "bg-white text-green-600 shadow-sm dark:bg-zinc-800 dark:text-green-400" 
                      : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
                  }`}
                >
                  <MessageCircle size={14} /> WhatsApp
                </button>
                <button
                  onClick={() => setCheckoutTab("print")}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 text-[10px] font-bold uppercase tracking-wider rounded-md transition-colors ${
                    checkoutTab === "print" 
                      ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-800 dark:text-zinc-100" 
                      : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
                  }`}
                >
                  <Printer size={14} /> Print
                </button>
                <button
                  onClick={() => setCheckoutTab("direct")}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 text-[10px] font-bold uppercase tracking-wider rounded-md transition-colors ${
                    checkoutTab === "direct" 
                      ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-800 dark:text-zinc-100" 
                      : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
                  }`}
                >
                  <CheckCircle2 size={14} /> Direct
                </button>
              </div>

              {/* Tab Contents */}
              {checkoutTab === "whatsapp" && (
                <div className="space-y-4">
                  {!billSent ? (
                    <>
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1 ml-1">
                          Guest Phone Number
                        </label>
                        <input
                          type="tel"
                          value={paymentPhone}
                          onChange={(e) => setPaymentPhone(e.target.value)}
                          className="w-full bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 py-3 px-4 rounded-xl text-sm focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 text-zinc-900 dark:text-zinc-100 transition-all"
                          placeholder="Enter phone number"
                        />
                      </div>
                      <button 
                        onClick={handleWhatsAppSend}
                        disabled={!paymentPhone}
                        className="w-full bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white font-bold uppercase tracking-wider text-xs py-3.5 rounded-xl transition-all shadow-md"
                      >
                        Send Bill
                      </button>
                    </>
                  ) : (
                    <div className="text-center py-2 space-y-4">
                      <div className="mx-auto w-12 h-12 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-full flex items-center justify-center mb-2">
                        <CheckCircle2 size={24} />
                      </div>
                      <h4 className="font-bold text-zinc-900 dark:text-zinc-100 text-lg">Bill Sent Successfully</h4>
                      <p className="text-sm text-zinc-500 px-4">
                        The digital bill has been sent via WhatsApp. Waiting for payment...
                      </p>
                      <div className="flex flex-col gap-3 mt-4">
                        <button 
                          onClick={() => {
                            closeOrder(checkoutOrder, "completed");
                            setCheckoutOrder(null);
                          }}
                          className="w-full bg-green-600 hover:bg-green-700 text-white font-bold uppercase tracking-wider text-xs py-3.5 rounded-xl transition-all shadow-md"
                        >
                          Payment Done / Close Ticket
                        </button>
                        <button 
                          onClick={handleWhatsAppSend}
                          className="w-full border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900 font-bold uppercase tracking-wider text-xs py-3.5 rounded-xl transition-all"
                        >
                          Resend Bill
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {checkoutTab === "print" && (
                <div className="space-y-3">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 text-center mb-2">
                    Select Printer Format
                  </p>
                  <button 
                    onClick={() => handlePrint("thermal")}
                    className="w-full flex items-center justify-between border border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600 py-3.5 px-4 rounded-xl transition-all group"
                  >
                    <span className="font-semibold text-zinc-900 dark:text-zinc-100 text-sm">Thermal Receipt</span>
                    <span className="text-xs text-zinc-500">Standard 80mm</span>
                  </button>
                  <button 
                    onClick={() => handlePrint("a5")}
                    className="w-full flex items-center justify-between border border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600 py-3.5 px-4 rounded-xl transition-all group"
                  >
                    <span className="font-semibold text-zinc-900 dark:text-zinc-100 text-sm">A5 Bill Book</span>
                    <span className="text-xs text-zinc-500">Half Page</span>
                  </button>
                  <button 
                    onClick={() => handlePrint("a4")}
                    className="w-full flex items-center justify-between border border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600 py-3.5 px-4 rounded-xl transition-all group"
                  >
                    <span className="font-semibold text-zinc-900 dark:text-zinc-100 text-sm">A4 Bill Book</span>
                    <span className="text-xs text-zinc-500">Full Page</span>
                  </button>
                  <button 
                    onClick={() => handlePrint("custom")}
                    className="w-full flex items-center justify-between border border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600 py-3.5 px-4 rounded-xl transition-all group"
                  >
                    <span className="font-semibold text-zinc-900 dark:text-zinc-100 text-sm">Custom Size</span>
                    <span className="text-xs text-zinc-500">Auto Scaling</span>
                  </button>
                  
                  <div className="pt-4 mt-4 border-t border-zinc-200 dark:border-zinc-800">
                    <button 
                      onClick={() => {
                        closeOrder(checkoutOrder, "completed");
                        setCheckoutOrder(null);
                      }}
                      className="w-full bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 font-bold uppercase tracking-wider text-xs py-3.5 rounded-xl transition-all"
                    >
                      Close Ticket (After Printing)
                    </button>
                  </div>
                </div>
              )}

              {checkoutTab === "direct" && (
                <div className="space-y-4 text-center py-4">
                  <div className="mx-auto w-12 h-12 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-full flex items-center justify-center mb-4">
                    <CheckCircle2 size={24} />
                  </div>
                  <h4 className="font-bold text-zinc-900 dark:text-zinc-100 text-lg">Mark Paid & Close</h4>
                  <p className="text-sm text-zinc-500 px-4">
                    Instantly close this ticket without sending or printing a digital bill.
                  </p>
                  <button 
                    onClick={() => {
                      closeOrder(checkoutOrder, "completed");
                      setCheckoutOrder(null);
                    }}
                    className="w-full mt-4 bg-green-600 hover:bg-green-700 text-white font-bold uppercase tracking-wider text-xs py-3.5 rounded-xl transition-all shadow-md"
                  >
                    Confirm & Close Ticket
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
