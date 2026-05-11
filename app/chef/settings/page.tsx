/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import React, { useState, useEffect } from "react";
import useSWR from "swr";
import { ThemeProvider, useTheme } from "@/components/ThemeProvider";
import { 
  Settings, Utensils, ReceiptText, ShieldAlert, Plus, Edit2, Trash2, X, Save, 
  ArrowLeft, Eye, Image as ImageIcon, Bell 
} from "lucide-react";
import { 
  getMenuItems, addMenuItem, updateMenuItem, deleteMenuItem, getSettings, updateGstRate, updatePassword, updateBillingSettings 
} from "@/actions/settings";
import ChefHeader from "@/components/ChefHeader";


function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  return (
    <button onClick={toggleTheme} className="relative flex items-center w-12 h-6 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-full backdrop-blur-xl cursor-pointer transition-colors duration-500 hover:bg-black/10 dark:hover:bg-white/10">
      <div className={`absolute left-1 w-4 h-4 rounded-full flex items-center justify-center transition-all duration-500 shadow-sm ${theme === "light" ? "translate-x-0 bg-black" : "translate-x-6 bg-white"}`}>
        <div className={`w-1.5 h-1.5 rounded-full ${theme === "light" ? "bg-white" : "bg-black"}`}></div>
      </div>
    </button>
  );
}

const CATEGORIES = ["Chef Special", "Starters", "Main Course", "Salads", "Breads", "Desserts", "Drinks"];

// Skeleton Loader for Menu Items
const MenuSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
    {[1, 2, 3, 4, 5, 6].map((i) => (
      <div key={i} className="bg-glass border border-black/10 dark:border-white/10 p-4 rounded-xl flex flex-col justify-between h-[180px] animate-pulse">
        <div className="space-y-3">
          <div className="flex justify-between items-start mb-2">
            <div className="w-12 h-4 bg-black/10 dark:bg-white/10 rounded-sm"></div>
            <div className="w-16 h-4 bg-black/10 dark:bg-white/10 rounded-sm"></div>
          </div>
          <div className="w-3/4 h-5 bg-black/10 dark:bg-white/10 rounded"></div>
          <div className="w-full h-3 bg-black/10 dark:bg-white/10 rounded mt-2"></div>
          <div className="w-5/6 h-3 bg-black/10 dark:bg-white/10 rounded"></div>
        </div>
        <div className="flex gap-2 mt-4 pt-3 border-t border-black/5 dark:border-white/5">
          <div className="flex-1 h-7 bg-black/10 dark:bg-white/10 rounded"></div>
          <div className="flex-1 h-7 bg-black/10 dark:bg-white/10 rounded"></div>
        </div>
      </div>
    ))}
  </div>
);

// Notification Types
interface WaiterRequest {
  id: string;
  tableNo: number;
  time: Date;
  read: boolean;
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<"menu" | "billing" | "security">("menu");
  
  // Data Fetching
  const { data: menuItems = [], mutate: mutateMenu, isLoading: isMenuLoading } = useSWR("menuItems", getMenuItems);
  const { data: settings, mutate: mutateSettings } = useSWR("settings", getSettings);

  // Menu Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  
  // Form States
  const [menuForm, setMenuForm] = useState({ 
    name: "", description: "", price: "", category: "Main Course", diet: "Veg", ingredients: "", 
    nutrition: { calories: "", protein: "", carbs: "", fat: "" }, modelUrl: "", photoUrl: "" 
  });
  const [newPassword, setNewPassword] = useState("");
  const [gstRate, setGstRate] = useState<number>(5);
  const [upiId, setUpiId] = useState("");
  const [qrCodeBase64, setQrCodeBase64] = useState<string | null>(null);

  // --- NOTIFICATION STATE ---
  const [waiterRequests, setWaiterRequests] = useState<WaiterRequest[]>([]);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [latestToast, setLatestToast] = useState<number | null>(null);

  // Initialize settings
  React.useEffect(() => {
    if (settings) {
      setGstRate(settings.gstRate);
      if (settings.upiId) setUpiId(settings.upiId);
      if (settings.qrCodeUrl) setQrCodeBase64(settings.qrCodeUrl);
    }
  }, [settings]);

  // --- NOTIFICATION LOGIC ---
  const unreadCount = waiterRequests.filter(req => !req.read).length;

  const triggerWaiterRequest = (tableNo: number) => {
    // 1. Play sound (Requires public/ring.mp3)
    try {
      const audio = new Audio('/ring.mp3');
      audio.play().catch(e => console.log("Audio play prevented by browser:", e));
    } catch (error) {
      console.log("Audio error", error);
    }

    // 2. Add to list
    setWaiterRequests(prev => [
      { id: Date.now().toString(), tableNo, time: new Date(), read: false },
      ...prev
    ]);

    // 3. Show Popup Toast
    setLatestToast(tableNo);
    setTimeout(() => {
      setLatestToast(null);
    }, 5000); // Hide toast after 5 seconds
  };

  const toggleNotifications = () => {
    setIsNotifOpen(!isNotifOpen);
    if (!isNotifOpen) {
      // Mark all as read when opening dropdown
      setWaiterRequests(prev => prev.map(req => ({ ...req, read: true })));
    }
  };

  // -------------------------

  const openAddModal = () => {
    setEditingItem(null);
    setMenuForm({ 
      name: "", description: "", price: "", category: "Main Course", diet: "Veg", ingredients: "", 
      nutrition: { calories: "", protein: "", carbs: "", fat: "" }, modelUrl: "", photoUrl: "" 
    });
    setIsModalOpen(true);
  };

  const openEditModal = (item: any) => {
    setEditingItem(item);
    setMenuForm({
      ...item,
      ingredients: item.ingredients ? item.ingredients.join(", ") : "",
      photoUrl: item.photoUrl || "", 
    });
    setIsModalOpen(true);
  };

  const handleMenuSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const formatUrl = (url: string) => {
      const trimmed = url.trim();
      if (!trimmed) return ""; 
      if (!/^https?:\/\//i.test(trimmed)) {
        return `https://${trimmed}`;
      }
      return trimmed;
    };

    const payload = {
      ...menuForm,
      modelUrl: formatUrl(menuForm.modelUrl),
      photoUrl: formatUrl(menuForm.photoUrl),
      ingredients: menuForm.ingredients.split(",").map((i: string) => i.trim()).filter((i: string) => i),
    };

    if (editingItem) {
      await updateMenuItem(editingItem.id, payload);
    } else {
      await addMenuItem(payload);
    }
    mutateMenu();
    setIsModalOpen(false);
  };

  const handleDeleteMenu = async (id: number) => {
    if (confirm("Are you sure you want to delete this menu item?")) {
      await deleteMenuItem(id);
      mutateMenu();
    }
  };

  const handleBillingUpdate = async () => {
    await updateGstRate(gstRate);
    await updateBillingSettings(upiId, qrCodeBase64);
    mutateSettings();
    alert("Billing Settings updated successfully!");
  };

  const handleQrUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1048576) { // 1 MB limit
        alert("Image is too large! Please upload an image smaller than 1MB.");
        e.target.value = ""; // Clear the input
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setQrCodeBase64(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) return alert("Password must be at least 6 characters.");
    await updatePassword(newPassword);
    setNewPassword("");
    alert("Password updated successfully!");
  };

  return (
    <ThemeProvider>
      <div className="flex flex-col min-h-screen">
        {/* Header / Navbar */}
        <ChefHeader subtitle="Chef Console" /> {/* ✅ Use it here */}

        {/* Global Toast Notification Popup */}
        {latestToast !== null && (
          <div className="fixed top-20 right-4 z-[100] animate-in slide-in-from-top-5 fade-in duration-300">
            <div className="bg-white dark:bg-[#111] border-l-4 border-gold shadow-2xl rounded-lg p-4 flex items-start gap-4 w-72">
              <div className="bg-gold/20 p-2 rounded-full">
                <Bell size={18} className="text-gold animate-bounce" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-black dark:text-white">Service Needed</h4>
                <p className="text-xs text-black/70 dark:text-white/70 mt-1">
                  Guest requested waiter at <strong className="text-gold">Table No. {latestToast}</strong>
                </p>
              </div>
              <button onClick={() => setLatestToast(null)} className="absolute top-2 right-2 text-black/40 dark:text-white/40 hover:text-black dark:hover:text-white">
                <X size={14} />
              </button>
            </div>
          </div>
        )}

        <section className="w-full px-4 sm:px-10 pt-8 pb-4">
          {/* Go Back Button */}
          <div className="mb-6 flex justify-between items-center">
            <a href="/chef" className="inline-flex items-center gap-1.5 text-black/50 dark:text-white/50 hover:text-gold dark:hover:text-gold transition-colors">
              <ArrowLeft size={16} />
              <span className="text-[10px] uppercase tracking-widest font-bold">Back to Dashboard</span>
            </a>
          </div>

          <div className="flex items-center gap-2 mb-6">
            <Settings size={20} className="text-gold" />
            <h2 className="text-lg sm:text-xl uppercase tracking-[0.2em] font-bold text-black/80 dark:text-white/90">Restaurant Settings</h2>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-black/10 dark:border-white/10 gap-6 overflow-x-auto scrollbar-hide">
            <button onClick={() => setActiveTab("menu")} className={`pb-3 text-xs sm:text-sm font-bold uppercase tracking-[0.15em] flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${activeTab === "menu" ? "text-gold border-gold" : "text-black/50 dark:text-white/50 border-transparent"}`}>
              <Utensils size={16} /> Menu
            </button>
            <button onClick={() => setActiveTab("billing")} className={`pb-3 text-xs sm:text-sm font-bold uppercase tracking-[0.15em] flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${activeTab === "billing" ? "text-gold border-gold" : "text-black/50 dark:text-white/50 border-transparent"}`}>
              <ReceiptText size={16} /> Billing
            </button>
            <button onClick={() => setActiveTab("security")} className={`pb-3 text-xs sm:text-sm font-bold uppercase tracking-[0.15em] flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${activeTab === "security" ? "text-gold border-gold" : "text-black/50 dark:text-white/50 border-transparent"}`}>
              <ShieldAlert size={16} /> Security
            </button>
          </div>
        </section>

        <main className="flex-1 px-4 sm:px-10 pb-10">
          
          {/* MENU TAB */}
          {activeTab === "menu" && (
            <div className="space-y-4">
              <div className="flex justify-end">
                <button onClick={openAddModal} className="flex items-center gap-2 bg-gold hover:bg-gold/90 text-white px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest shadow-md transition">
                  <Plus size={14} /> Add Item
                </button>
              </div>

              {isMenuLoading ? (
                <MenuSkeleton />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {menuItems.map((item: any) => (
                    <div key={item.id} className="bg-glass border border-black/10 dark:border-white/10 p-4 rounded-xl flex flex-col justify-between hover:border-gold/30 transition-colors">
                      <div>
                        <div className="flex justify-between items-start mb-2">
                           <span className={`text-[9px] uppercase tracking-widest px-2 py-0.5 rounded-sm border ${item.diet === 'Veg' ? 'border-green-600/50 text-green-600' : 'border-red-600/50 text-red-600'}`}>{item.diet}</span>
                           <span className="font-serif text-gold font-bold">{item.price}</span>
                        </div>
                        <h3 className="font-bold text-sm text-black dark:text-white">{item.name}</h3>
                        <p className="text-[11px] text-black/50 dark:text-white/50 mt-1 line-clamp-2">{item.description}</p>
                        
                        <div className="mt-2 space-y-1">
                          {item.modelUrl && (
                            <p className="text-[10px] text-blue-500 truncate">Model: {item.modelUrl.split('/').pop()}</p>
                          )}
                          {item.photoUrl && (
                            <p className="text-[10px] text-green-500 truncate flex items-center gap-1">
                              <ImageIcon size={10} /> {item.photoUrl.split('/').pop()}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 mt-4 pt-3 border-t border-black/5 dark:border-white/5">
                        <button onClick={() => openEditModal(item)} className="flex-1 flex justify-center items-center gap-1.5 py-1.5 bg-black/5 dark:bg-white/5 rounded text-[10px] uppercase font-bold text-black/70 dark:text-white/70 hover:bg-black/10 dark:hover:bg-white/10 transition">
                          <Edit2 size={12} /> Edit
                        </button>
                        <button onClick={() => handleDeleteMenu(item.id)} className="flex-1 flex justify-center items-center gap-1.5 py-1.5 bg-red-500/10 rounded text-[10px] uppercase font-bold text-red-600 hover:bg-red-500/20 transition">
                          <Trash2 size={12} /> Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* BILLING TAB */}
          {activeTab === "billing" && (
            <div className="max-w-md bg-glass border border-black/10 dark:border-white/10 p-6 rounded-xl space-y-6">
              <div>
                <h3 className="font-serif italic text-lg text-black dark:text-white">Tax & GST Settings</h3>
                <p className="text-xs text-black/50 dark:text-white/50 mt-1">This rate will automatically apply to all incoming orders on the frontend menu and chef console.</p>
              </div>
              
              <div className="space-y-3">
                <label className="text-[10px] uppercase tracking-widest font-bold text-black/60 dark:text-white/60">Current GST Rate (%)</label>
                <div className="grid grid-cols-3 gap-3">
                   {[0, 5, 18].map((rate) => (
                     <button
                       key={rate}
                       onClick={() => setGstRate(rate)}
                       className={`py-3 rounded-lg border font-bold text-sm transition-colors ${gstRate === rate ? 'bg-gold border-gold text-white shadow-md' : 'bg-transparent border-black/10 dark:border-white/10 text-black/60 dark:text-white/60 hover:border-gold'}`}
                     >
                       {rate}%
                     </button>
                   ))}
                </div>
              </div>

              <div className="space-y-3 pt-4 border-t border-black/10 dark:border-white/10">
                <h4 className="text-sm font-bold text-black dark:text-white">Payment Details</h4>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-black/60 dark:text-white/60">UPI ID</label>
                  <input 
                    type="text" 
                    value={upiId} 
                    onChange={(e) => setUpiId(e.target.value)} 
                    className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 py-2.5 px-3 rounded-lg text-sm focus:outline-none focus:border-gold text-black dark:text-white transition-all"
                    placeholder="e.g. yourname@upi"
                  />
                </div>
                <div className="space-y-2 pt-2">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-black/60 dark:text-white/60">Payment QR Code</label>
                  <div className="flex flex-col gap-3">
                    {qrCodeBase64 && (
                      <div className="w-24 h-24 border border-black/10 dark:border-white/10 rounded-lg overflow-hidden bg-white">
                        <img src={qrCodeBase64} alt="QR Code" className="w-full h-full object-cover" />
                      </div>
                    )}
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={handleQrUpload}
                      className="text-xs text-black/60 dark:text-white/60 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-gold/10 file:text-gold hover:file:bg-gold/20"
                    />
                  </div>
                </div>
              </div>

              <button onClick={handleBillingUpdate} className="w-full bg-black text-white dark:bg-white dark:text-black py-3 rounded-xl text-xs uppercase tracking-widest font-bold flex items-center justify-center gap-2 hover:opacity-80 transition shadow-md">
                <Save size={16} /> Save Billing Settings
              </button>
            </div>
          )}

          {/* SECURITY TAB */}
          {activeTab === "security" && (
            <form onSubmit={handlePasswordUpdate} className="max-w-md bg-glass border border-black/10 dark:border-white/10 p-6 rounded-xl space-y-6">
              <div>
                <h3 className="font-serif italic text-lg text-black dark:text-white">Admin Authentication</h3>
                <p className="text-xs text-black/50 dark:text-white/50 mt-1">Update the password required to access the chef dashboard and settings.</p>
              </div>
              
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest font-bold text-black/60 dark:text-white/60">New Password</label>
                <input 
                  type="password" 
                  value={newPassword} 
                  onChange={(e) => setNewPassword(e.target.value)} 
                  required 
                  minLength={6}
                  className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 py-3 px-4 rounded-xl text-sm focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold text-black dark:text-white transition-all"
                  placeholder="Enter new admin password"
                />
              </div>

              <button type="submit" className="w-full bg-black text-white dark:bg-white dark:text-black py-3 rounded-xl text-xs uppercase tracking-widest font-bold flex items-center justify-center gap-2 hover:opacity-80 transition shadow-md">
                <ShieldAlert size={16} /> Update Password
              </button>
            </form>
          )}

        </main>
      </div>

      {/* Menu Item Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-[#0a0a0a] border border-black/10 dark:border-white/10 p-6 rounded-2xl shadow-2xl relative scrollbar-hide">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 text-black/40 hover:text-black dark:text-white/40 dark:hover:text-white transition-colors">
              <X size={18} />
            </button>
            
            <h3 className="text-xl font-serif italic text-black dark:text-white mb-6">
              {editingItem ? "Edit Menu Item" : "Add New Menu Item"}
            </h3>

            <form onSubmit={handleMenuSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-black/50 dark:text-white/50 mb-1">Name</label>
                  <input required value={menuForm.name} onChange={e => setMenuForm({...menuForm, name: e.target.value})} className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 py-2.5 px-3 rounded-lg text-sm text-black dark:text-white focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-all" placeholder="e.g. Pasta" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-black/50 dark:text-white/50 mb-1">Price (with symbol)</label>
                  <input required value={menuForm.price} onChange={e => setMenuForm({...menuForm, price: e.target.value})} className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 py-2.5 px-3 rounded-lg text-sm text-black dark:text-white focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-all" placeholder="e.g. ₹480" />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-black/50 dark:text-white/50 mb-1">Description</label>
                <textarea required rows={2} value={menuForm.description} onChange={e => setMenuForm({...menuForm, description: e.target.value})} className="w-full resize-none bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 py-2.5 px-3 rounded-lg text-sm text-black dark:text-white focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-all" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-black/50 dark:text-white/50 mb-1">Category</label>
                  <select value={menuForm.category} onChange={e => setMenuForm({...menuForm, category: e.target.value})} className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 py-2.5 px-3 rounded-lg text-sm text-black dark:text-white focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-all">
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-black/50 dark:text-white/50 mb-1">Diet</label>
                  <select value={menuForm.diet} onChange={e => setMenuForm({...menuForm, diet: e.target.value})} className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 py-2.5 px-3 rounded-lg text-sm text-black dark:text-white focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-all">
                    <option value="Veg">Veg</option>
                    <option value="Non-Veg">Non-Veg</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-black/50 dark:text-white/50 mb-1">3D Model URL (.glb) (Optional)</label>
                  <input value={menuForm.modelUrl} onChange={e => setMenuForm({...menuForm, modelUrl: e.target.value})} className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 py-2.5 px-3 rounded-lg text-sm text-black dark:text-white focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-all" placeholder="https://domain.com/model.glb" />
                </div>
                <div>
                  <label className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-black/50 dark:text-white/50 mb-1">
                    <ImageIcon size={10} /> Photo URL (Image) (Optional)
                  </label>
                  <input value={menuForm.photoUrl} onChange={e => setMenuForm({...menuForm, photoUrl: e.target.value})} className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 py-2.5 px-3 rounded-lg text-sm text-black dark:text-white focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-all" placeholder="https://domain.com/image.jpg" />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-black/50 dark:text-white/50 mb-1">Ingredients (comma separated)</label>
                <input required value={menuForm.ingredients} onChange={e => setMenuForm({...menuForm, ingredients: e.target.value})} className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 py-2.5 px-3 rounded-lg text-sm text-black dark:text-white focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-all" placeholder="Pasta, Tomato, Basil" />
              </div>

              <div className="pt-2">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-black/50 dark:text-white/50 mb-2">Nutrition Info (Optional)</label>
                <div className="grid grid-cols-4 gap-2">
                   <input value={menuForm.nutrition.calories} onChange={e => setMenuForm({...menuForm, nutrition: {...menuForm.nutrition, calories: e.target.value}})} placeholder="Cal (e.g. 400)" className="bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 p-2 rounded text-xs text-black dark:text-white focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-all" />
                   <input value={menuForm.nutrition.protein} onChange={e => setMenuForm({...menuForm, nutrition: {...menuForm.nutrition, protein: e.target.value}})} placeholder="Pro (e.g. 15g)" className="bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 p-2 rounded text-xs text-black dark:text-white focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-all" />
                   <input value={menuForm.nutrition.carbs} onChange={e => setMenuForm({...menuForm, nutrition: {...menuForm.nutrition, carbs: e.target.value}})} placeholder="Carb (e.g. 40g)" className="bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 p-2 rounded text-xs text-black dark:text-white focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-all" />
                   <input value={menuForm.nutrition.fat} onChange={e => setMenuForm({...menuForm, nutrition: {...menuForm.nutrition, fat: e.target.value}})} placeholder="Fat (e.g. 10g)" className="bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 p-2 rounded text-xs text-black dark:text-white focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-all" />
                </div>
              </div>

              <button type="submit" className="w-full bg-gold hover:bg-gold/90 text-white font-bold uppercase tracking-[0.2em] text-xs py-3.5 rounded-xl transition-all shadow-md mt-4 active:scale-[0.98]">
                {editingItem ? "Update Menu Item" : "Save Menu Item"}
              </button>
            </form>
          </div>
        </div>
      )}
    </ThemeProvider>
  );
}