"use client";

import { useState, useMemo, useEffect } from "react";
import { MenuItemCard } from "./MenuItemCard";
import { Search, Plus, Minus, Trash2, ShoppingBag, Mic, MicOff, WifiOff, RefreshCw } from "lucide-react";
import { submitOrderWithFallback, usePendingOrderSync } from "@/hooks/usePendingOrderSync";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";
import { getDb } from "@/lib/db-local";
import { useRouter } from "next/navigation";
import Fuse from "fuse.js";
import { useAdminLanguage } from "@/components/admin/AdminLanguageProvider";

export function POSClient({ items, tables }: { items: any[], tables: any[] }) {
  const router = useRouter();
  const { language, t } = useAdminLanguage();
  const isOnline = useNetworkStatus();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [isListening, setIsListening] = useState(false);
  const [showMicErrorModal, setShowMicErrorModal] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [offlineToast, setOfflineToast] = useState(false);
  
  // Cart State
  const [cart, setCart] = useState<any[]>([]);
  const [guestName, setGuestName] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [tableNumber, setTableNumber] = useState("");
  const [cashierName, setCashierName] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [localItems, setLocalItems] = useState<any[]>(items);
  const [localTables, setLocalTables] = useState<any[]>(tables);

  useEffect(() => {
    const loadOfflineData = async () => {
      if (items.length === 0 || tables.length === 0) {
        const db = await getDb();
        if (db) {
          if (items.length === 0) {
            const storedItems = await db.table('menuItems').toArray();
            setLocalItems(storedItems);
          }
          if (tables.length === 0) {
            const storedTables = await db.table('tables').toArray();
            setLocalTables(storedTables);
          }
        }
      } else {
        setLocalItems(items);
        setLocalTables(tables);
      }
    };
    loadOfflineData();
  }, [items, tables]);

  const categories = ["All", ...Array.from(new Set(localItems.map(item => item.category)))].filter(Boolean);

  // Poll pending count from local DB
  useEffect(() => {
    const refresh = async () => {
      const db = await getDb();
      if (!db) return;
      const count = await db.table('pendingOrders').where("status").anyOf("pending", "failed").count();
      setPendingCount(count);
    };
    refresh();
    const interval = setInterval(refresh, 3000);
    return () => clearInterval(interval);
  }, []);

  // Drain pending orders when internet returns
  const { drainQueue } = usePendingOrderSync(() => {
    router.refresh();
    setPendingCount(0);
  });

  const searchableItems = useMemo(() => (
    localItems.map((item) => ({
      ...item,
      localizedName: t(item.name),
      localizedDescription: item.description ? t(item.description) : "",
      localizedCategory: t(item.category),
      localizedDiet: t(item.diet),
    }))
  ), [localItems, t]);

  const fuse = useMemo(() => new Fuse(searchableItems, {
    keys: ['name', 'description', 'category', 'localizedName', 'localizedDescription', 'localizedCategory', 'localizedDiet'],
    threshold: 0.5,
    ignoreLocation: true,
    distance: 300,
  }), [searchableItems]);

  const filteredItems = useMemo(() => {
    let result = searchableItems;
    
    if (search.trim()) {
      result = fuse.search(search).map(r => r.item);
    }
    
    if (category !== "All") {
      result = result.filter(item => item.category === category);
    }
    
    return result;
  }, [searchableItems, search, category, fuse]);

  const toggleListening = () => {
    if (isListening) {
      setIsListening(false);
      return;
    }

    // @ts-ignore
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice search is not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = language === "hi" ? "hi-IN" : language === "mr" ? "mr-IN" : language === "gu" ? "gu-IN" : "en-IN";

    recognition.onstart = () => setIsListening(true);
    
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setSearch(transcript);
      setIsListening(false);
    };

    recognition.onerror = (event: any) => {
      // Suppress console.error for 'not-allowed' to avoid Next.js dev overlay interruptions
      if (event.error !== 'not-allowed') {
        console.error("Speech error:", event.error);
      }
      setIsListening(false);
      
      if (event.error === 'not-allowed') {
        setShowMicErrorModal(true);
      }
    };

    recognition.onend = () => setIsListening(false);

    recognition.start();
  };

  const addToCart = (item: any) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { id: item.id, name: item.name, price: item.numericPrice, quantity: 1 }];
    });
  };

  const updateQuantity = (id: number, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQ = item.quantity + delta;
        return newQ > 0 ? { ...item, quantity: newQ } : item;
      }
      return item;
    }));
  };

  const removeFromCart = (id: number) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const tax = subtotal * 0.05; // 5% GST
  const total = subtotal + tax;

  const handleSubmit = async () => {
    if (!guestName || cart.length === 0) return;
    const resolvedTable = tableNumber || "NA";
    
    setIsSubmitting(true);
    const res = await submitOrderWithFallback({
      guestName,
      tableNumber: resolvedTable,
      contactNumber,
      cashierName,
      notes,
      total: Math.round(total),
      items: cart
    });

    if (res.success) {
      setCart([]);
      setGuestName("");
      setContactNumber("");
      setTableNumber("");
      setCashierName("");
      setNotes("");
      
      if (res.offline) {
        // Show offline toast and bump pending count
        setOfflineToast(true);
        setTimeout(() => setOfflineToast(false), 4000);
        setPendingCount(c => c + 1);
      } else {
        router.refresh();
      }
    }
    setIsSubmitting(false);
  };

  return (
    <div className="flex flex-col gap-4 lg:h-[calc(100vh-6rem)] lg:flex-row lg:gap-6">
      
      {/* Offline Order Saved Toast */}
      {offlineToast && (
        <div className="fixed bottom-6 right-6 z-[100] flex items-center gap-3 rounded-xl border border-yellow-500/30 bg-yellow-500/10 px-5 py-3.5 shadow-2xl backdrop-blur-md animate-in slide-in-from-bottom-4 fade-in duration-300">
          <WifiOff className="h-4 w-4 text-yellow-600 dark:text-yellow-400 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-yellow-800 dark:text-yellow-300">Order saved offline</p>
            <p className="text-xs text-yellow-700/70 dark:text-yellow-400/70">It will sync to kitchen when internet returns</p>
          </div>
        </div>
      )}

      {/* Left Menu Grid */}
      <div className="flex min-h-[60vh] flex-1 flex-col overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950 lg:min-h-0">
        <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 space-y-4">
          <div className="relative flex items-center">
            <Search className="absolute left-3 h-4 w-4 text-zinc-500" />
            <input
              type="text"
              placeholder={t("Search menu...")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-10 w-full rounded-md border border-zinc-200 bg-zinc-50 pl-9 pr-10 text-sm outline-none focus:border-yellow-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100"
            />
            <button 
              onClick={toggleListening}
              className={`absolute right-2 p-1.5 rounded-md transition-colors ${isListening ? 'bg-red-100 text-red-500 animate-pulse' : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300'}`}
              title={t("Voice Search")}
            >
              {isListening ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
            </button>
          </div>
          
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {categories.map(c => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  category === c 
                    ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900" 
                    : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800"
                }`}
              >
                {t(c)}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3 sm:p-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 sm:gap-4">
            {filteredItems.map(item => (
              <MenuItemCard key={item.id} item={item} onAdd={addToCart} />
            ))}
          </div>
        </div>
      </div>

      {/* Right Cart Sidebar */}
      <div className="flex w-full flex-col overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950 lg:w-96">
        
        {/* Guest & Table Info */}
        <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 space-y-3 bg-zinc-50 dark:bg-zinc-900/50 flex-shrink-0">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1">Guest Name</label>
              <input
                type="text"
                placeholder={t("Enter name")}
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                className="h-9 w-full rounded-md border border-zinc-200 bg-white px-3 text-sm outline-none focus:border-yellow-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1">Cashier Name</label>
              <input
                type="text"
                placeholder="Staff name"
                value={cashierName}
                onChange={(e) => setCashierName(e.target.value)}
                className="h-9 w-full rounded-md border border-zinc-200 bg-white px-3 text-sm outline-none focus:border-yellow-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1">Phone (Optional)</label>
              <input
                type="tel"
                placeholder="For digital bill"
                value={contactNumber}
                onChange={(e) => setContactNumber(e.target.value)}
                className="h-9 w-full rounded-md border border-zinc-200 bg-white px-3 text-sm outline-none focus:border-yellow-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1">Table</label>
              <select
                value={tableNumber}
                onChange={(e) => setTableNumber(e.target.value)}
                className="admin-select h-9 w-full rounded-md border border-zinc-200 bg-white px-3 text-sm outline-none focus:border-yellow-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              >
                <option value="">{t("Select Table")}</option>
                <option value="NA">N/A (No Table)</option>
                <option value="Pickup">{t("Pickup / Takeaway")}</option>
                {localTables.map((table) => (
                  <option key={table.id} value={table.tableNumber}>{`${t("Table")} ${table.tableNumber} (${table.capacity} ${t("pax")})`}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1">Notes <span className="text-zinc-400">(e.g. less salt, no onion)</span></label>
            <textarea
              placeholder="Special instructions for kitchen..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:border-yellow-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 resize-none"
            />
          </div>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-zinc-500 space-y-4">
              <ShoppingBag className="h-12 w-12 opacity-20" />
              <p>{t("Cart is empty")}</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.id} className="flex justify-between items-center bg-zinc-50 dark:bg-zinc-900 p-3 rounded-lg border border-zinc-100 dark:border-zinc-800">
                <div className="flex-1">
                  <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{t(item.name)}</p>
                  <p className="text-xs text-zinc-500">₹{item.price}</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 bg-white dark:bg-zinc-950 rounded-md border border-zinc-200 dark:border-zinc-700">
                    <button onClick={() => updateQuantity(item.id, -1)} className="p-1 hover:text-yellow-500">
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="text-xs font-medium w-4 text-center">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, 1)} className="p-1 hover:text-yellow-500">
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>
                  <button onClick={() => removeFromCart(item.id)} className="text-zinc-400 hover:text-red-500">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Totals & Submit */}
        <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
          <div className="space-y-2 mb-4 text-sm">
            <div className="flex justify-between text-zinc-500">
              <span>{t("Subtotal")}</span>
              <span>₹{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-zinc-500">
              <span>GST (5%)</span>
              <span>₹{tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold text-lg text-zinc-900 dark:text-zinc-100 pt-2 border-t border-zinc-200 dark:border-zinc-700">
              <span>{t("Total")}</span>
              <span>₹{total.toFixed(2)}</span>
            </div>
          </div>
          
          {/* Submit button */}
          <button
            onClick={handleSubmit}
            disabled={cart.length === 0 || !guestName || isSubmitting}
            className="w-full py-3 rounded-lg bg-yellow-600 text-white font-medium hover:bg-yellow-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? t("Sending...") : !isOnline ? (
              <span className="flex items-center justify-center gap-2">
                <WifiOff className="h-4 w-4" />
                {t("Save Offline")}
              </span>
            ) : t("Send to Kitchen")}
          </button>

          {/* Pending sync badge */}
          {pendingCount > 0 && (
            <div className="mt-2 flex items-center justify-between rounded-lg bg-yellow-500/10 border border-yellow-500/20 px-3 py-2 text-xs text-yellow-700 dark:text-yellow-400">
              <span className="flex items-center gap-1.5">
                <WifiOff className="h-3 w-3" />
                {pendingCount} order{pendingCount > 1 ? "s" : ""} queued offline
              </span>
              {isOnline && (
                <button onClick={drainQueue} className="flex items-center gap-1 font-medium hover:underline">
                  <RefreshCw className="h-3 w-3" /> Sync now
                </button>
              )}
            </div>
          )}
        </div>

      </div>

      {/* Microphone Error Modal */}
      {showMicErrorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
            <div className="mb-4 flex items-center gap-3 text-red-500">
              <MicOff className="h-6 w-6" />
              <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">{t("Microphone Access Denied")}</h2>
            </div>
            <p className="mb-6 text-sm text-zinc-600 dark:text-zinc-400">
              We couldn't access your microphone. Please ensure you have granted microphone permissions to this site in your browser settings.
              <br /><br />
              <strong className="text-zinc-900 dark:text-zinc-300">Note:</strong> Voice search also requires a secure <code className="bg-zinc-100 dark:bg-zinc-800 px-1 py-0.5 rounded">HTTPS</code> connection or <code className="bg-zinc-100 dark:bg-zinc-800 px-1 py-0.5 rounded">localhost</code>.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowMicErrorModal(false)}
                className="rounded-lg bg-zinc-200 px-6 py-2 text-sm font-bold text-zinc-900 transition-colors hover:bg-zinc-300 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700"
              >
                {t("Cancel")}
              </button>
              <button
                onClick={async () => {
                  try {
                    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                    stream.getTracks().forEach(track => track.stop());
                    setShowMicErrorModal(false);
                    toggleListening();
                  } catch (err) {
                    alert("Your browser is blocking access. Please click the lock icon in your address bar to manually allow microphone access.");
                  }
                }}
                className="rounded-lg bg-zinc-900 px-6 py-2 text-sm font-bold text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
              >
                {t("Give Access")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
