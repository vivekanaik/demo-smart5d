"use client";

import React, { useState } from "react";
import useSWR from "swr";
import { ThemeProvider, useTheme } from "@/components/ThemeProvider";
import ModelViewer from "@/components/ModelViewer";
import { Star, Utensils, ChefHat, Cake, Leaf, Croissant, Coffee, LayoutGrid, Search, List as ListIcon, Plus, Minus, User, X } from "lucide-react";
import { IoSearch } from "react-icons/io5";
import { RiBowlLine } from "react-icons/ri";
import { submitOrder } from "@/actions/orders"; 
import { getMenuItems, getSettings } from "@/actions/settings"; // ✅ NEW IMPORTS

// ✅ Offset Dummy IDs to 1001+ to avoid clashing with DB items which start at 1
const MENU_ITEMS = [
  {
    id: 1001,
    name: "Truffle Mushroom Pizza",
    description: "Wood-fired pizza with creamy truffle sauce, wild mushrooms, mozzarella, and fresh basil.",
    price: "₹480",
    category: "Main Course",
    diet: "Veg",
    ingredients: ["Pizza Dough", "Mozzarella", "Mushrooms", "Truffle Oil", "Garlic", "Basil"],
    nutrition: { calories: "420 kcal", protein: "14g", carbs: "48g", fat: "18g" },
    modelUrl: "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Avocado/glTF-Binary/Avocado.glb",
    posterUrl: "/5d.png"
  },
  {
    id: 1002,
    name: "Classic Veggie Burger",
    description: "Grilled veggie patty with lettuce, tomato, cheese, and house sauce in a toasted bun.",
    price: "₹220",
    category: "Chef Special",
    diet: "Veg",
    ingredients: ["Burger Bun", "Veg Patty", "Lettuce", "Tomato", "Cheese Slice", "Mayonnaise"],
    nutrition: { calories: "380 kcal", protein: "10g", carbs: "42g", fat: "16g" },
    modelUrl: "https://raw.githubusercontent.com/code4fukui/vr-crafeat/main/kani-burger.glb",
    posterUrl: "/5d.png"
  },
  {
    id: 1003,
    name: "Spicy Veg Ramen",
    description: "Rich vegetable broth ramen with noodles, tofu, corn, mushrooms, and chili oil.",
    price: "₹350",
    category: "Main Course",
    diet: "Veg",
    ingredients: ["Ramen Noodles", "Tofu", "Corn", "Mushrooms", "Vegetable Broth", "Chili Oil"],
    nutrition: { calories: "460 kcal", protein: "18g", carbs: "58g", fat: "14g" },
    modelUrl: "https://raw.githubusercontent.com/code4mongolia/opendata-gourmet/main/haku-yakiudon.glb",
    posterUrl: "/5d.png"
  },
  {
    id: 1004,
    name: "Pesto Paneer Noodles",
    description: "Stir-fried noodles tossed in creamy basil pesto with grilled paneer, crunchy vegetables, and herbs.",
    price: "₹300",
    category: "Main Course",
    diet: "Veg",
    ingredients: ["Noodles", "Paneer", "Basil Pesto Sauce", "Capsicum", "Onion", "Cherry Tomatoes", "Olive Oil", "Garlic", "Chili Flakes"],
    nutrition: { calories: "480 kcal", protein: "18g", carbs: "58g", fat: "18g" },
    modelUrl: "https://raw.githubusercontent.com/code4mongolia/opendata-gourmet/main/newmnkosen-lunch1.glb",
    posterUrl: "/5d.png"
  },
  {
    id: 1005,
    name: "Bombay Sandwich",
    description: "Grilled Mumbai-style sandwich layered with spiced potato filling, fresh cucumber, tomato, onion, mint chutney, and cheese, served with fries.",
    price: "₹180",
    category: "Starters",
    diet: "Veg",
    ingredients: ["Bread", "Boiled Potato", "Cucumber", "Tomato", "Onion", "Capsicum", "Mint Chutney", "Butter", "Cheese", "Chaat Masala"],
    nutrition: { calories: "350 kcal", protein: "10g", carbs: "45g", fat: "14g" },
    modelUrl: "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Avocado/glTF-Binary/Avocado.glb",
    posterUrl: "/5d.png"
  },
  {
    id: 1006,
    name: "Mediterranean Feta Salad",
    description: "Crisp greens, kalamata olives, cucumber, cherry tomatoes, and feta cheese with a light vinaigrette.",
    price: "₹250",
    category: "Salads",
    diet: "Veg",
    ingredients: ["Mixed Greens", "Feta Cheese", "Olives", "Cucumber", "Cherry Tomatoes", "Vinaigrette"],
    nutrition: { calories: "210 kcal", protein: "8g", carbs: "12g", fat: "16g" },
    modelUrl: "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Avocado/glTF-Binary/Avocado.glb",
    posterUrl: "/5d.png"
  },
  {
    id: 1007,
    name: "Artisan Garlic Bread",
    description: "Freshly baked sourdough bread brushed with roasted garlic and herb butter.",
    price: "₹150",
    category: "Breads",
    diet: "Veg",
    ingredients: ["Sourdough", "Butter", "Garlic", "Parsley", "Sea Salt"],
    nutrition: { calories: "320 kcal", protein: "6g", carbs: "45g", fat: "12g" },
    modelUrl: "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Avocado/glTF-Binary/Avocado.glb",
    posterUrl: "/5d.png"
  },
  {
    id: 1008,
    name: "Obsidian Lava Dessert",
    description: "Molten dark chocolate cake served over a bed of edible gold crumbs and liquid nitrogen.",
    price: "₹450",
    category: "Desserts",
    diet: "Veg",
    ingredients: ["Dark Chocolate", "Flour", "Butter", "Eggs", "Sugar", "Gold Crumbs"],
    nutrition: { calories: "580 kcal", protein: "8g", carbs: "52g", fat: "35g" },
    modelUrl: "https://raw.githubusercontent.com/code4fukui/ar-handtrack-torus/main/cake.glb",
    posterUrl: "/5d.png"
  },
  {
    id: 1009,
    name: "Blue Galactic Mojito",
    description: "A visually striking mix of blue curaçao, mint, lime, and sparkling water.",
    price: "₹190",
    category: "Drinks",
    diet: "Veg",
    ingredients: ["Blue Curaçao Syrup", "Mint", "Lime", "Sparkling Water", "Ice"],
    nutrition: { calories: "140 kcal", protein: "0g", carbs: "35g", fat: "0g" },
    modelUrl: "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/WaterBottle/glTF-Binary/WaterBottle.glb",
    posterUrl: "/5d.png"
  },
  {
    id: 1010,
    name: "Chicken Tikka Skewers",
    description: "Tender chicken chunks marinated in spiced yogurt, grilled to perfection.",
    price: "₹320",
    category: "Starters",
    diet: "Non-Veg",
    ingredients: ["Chicken Breast", "Yogurt", "Tikka Masala", "Lemon Juice", "Garlic", "Ginger"],
    nutrition: { calories: "280 kcal", protein: "35g", carbs: "8g", fat: "12g" },
    modelUrl: "https://raw.githubusercontent.com/code4fukui/vr-crafeat/main/shishiniku.glb",
    posterUrl: "/5d.png"
  }
];

const CATEGORIES = [
  { id: 'All', label: 'All', icon: LayoutGrid },
  { id: 'Chef Special', label: "Chef's Special", icon: Star },
  { id: 'Starters', label: 'Starters', icon: Utensils },
  { id: 'Main Course', label: 'Main Course', icon: ChefHat },
  { id: 'Salads', label: 'Salads', icon: Leaf },
  { id: 'Breads', label: 'Breads', icon: Croissant },
  { id: 'Desserts', label: 'Desserts', icon: Cake },
  { id: 'Drinks', label: 'Drinks', icon: Coffee },
];

function generateOrderId() {
  const timestamp = Date.now().toString().slice(-6);
  return `ORD-${timestamp}`;
}

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
          theme === 'light' 
            ? 'translate-x-0 bg-black' 
            : 'translate-x-6 bg-white'
        }`}
      >
         <div className={`w-1.5 h-1.5 rounded-full ${theme === 'light' ? 'bg-white' : 'bg-black'}`}></div>
      </div>
    </button>
  );
}

function Header({ cartCount, onCartClick }: { cartCount: number; onCartClick: () => void }) {
  return (
    <header className="h-16 flex items-center justify-between px-4 sm:px-10 border-b border-black/5 dark:border-white/5 bg-white/40 dark:bg-black/40 backdrop-blur-md sticky top-0 z-50 transition-colors duration-500">
      <div className="flex items-center space-x-2 sm:space-x-4">
        <span className="uppercase tracking-[0.2em] sm:tracking-[0.3em] text-[10px] sm:text-xs font-bold text-black dark:text-white">The Obsidian Palace</span>
        <span className="text-black/20 dark:text-white/20">|</span>
        <span className="uppercase tracking-[0.1em] text-[8px] sm:text-[10px] text-black/60 dark:text-white/60">5D Menu</span>
      </div>
      <div className="flex items-center space-x-4 sm:space-x-6">
        <button
          onClick={onCartClick}
          disabled={cartCount === 0}
          className={`relative group p-1 mr-2 transition-opacity ${cartCount === 0 ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          aria-label="Open cart orders"
        >
           <RiBowlLine size={22} className="text-black/80 dark:text-white/80 transition-colors group-hover:text-gold" />
           {cartCount > 0 && (
              <div className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-bold w-4 h-4 flex items-center justify-center rounded-full shadow-sm">
                 {cartCount}
              </div>
           )}
        </button>
        <ThemeToggle />
      </div>
    </header>
  );
}

function MenuItem({ item, onFallback, layout = 'list', cart, updateQuantity }: { item: any, onFallback: (item: any) => void, layout?: 'list' | 'grid', cart: Record<number, number>, updateQuantity: (id: number, delta: number) => void }) {
  const isGrid = layout === 'grid';
  const quantity = cart[item.id] || 0;
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <article className={`flex ${isGrid ? 'flex-col min-h-[140px]' : 'flex-row min-h-[8rem] md:min-h-[10rem] h-auto'} bg-glass rounded-sm overflow-hidden group transition-all duration-500 shadow-sm items-stretch`}>
      
      <div className={`shrink-0 ${isGrid ? 'w-full h-48' : 'w-2/5 md:w-1/4 self-stretch min-h-[8rem] md:min-h-[10rem]'} bg-white/50 dark:bg-black/50 flex items-center justify-center relative overflow-hidden`}>
        <div className="absolute inset-0 opacity-20 mix-blend-overlay pointer-events-none"></div>
        <ModelViewer 
            id={`viewer-${item.id}`} 
            src={item.modelUrl} 
            alt={item.name} 
            poster={item.posterUrl} 
            ingredients={item.ingredients} 
            nutrition={item.nutrition} 
        />
        
        <div className="absolute top-2 left-2 pointer-events-none z-10 text-[8px] uppercase tracking-tighter text-black/50 dark:text-white/30 border border-black/10 dark:border-white/10 p-1 bg-white/20 dark:bg-black/20 backdrop-blur-xs flex items-center gap-1.5 md:p-2">
           5D View
        </div>

        <div className="absolute top-2 right-2 pointer-events-none z-10 bg-white/60 dark:bg-black/60 backdrop-blur border border-black/10 dark:border-white/10 p-1 md:p-1.5 rounded-sm flex items-center justify-center">
            <div className={`w-1.5 h-1.5 md:w-2.5 md:h-2.5 rounded-full ${item.diet === 'Non-Veg' ? 'bg-red-600' : 'bg-green-600'}`}></div>
        </div>
        
        <div className="absolute bottom-2 left-2 flex space-x-1 opacity-20 pointer-events-none z-10">
          <div className="w-0.5 h-0.5 md:w-1 md:h-1 bg-black dark:bg-white rounded-full"></div>
          <div className="w-0.5 h-0.5 md:w-1 md:h-1 bg-black dark:bg-white rounded-full"></div>
          <div className="w-0.5 h-0.5 md:w-1 md:h-1 bg-black dark:bg-white rounded-full"></div>
        </div>
      </div>

      <div className={`flex flex-col justify-between ${isGrid ? 'p-5 items-center text-center w-full' : 'p-3 md:p-6 md:flex-row w-3/5 md:w-3/4'}`}>
        <div className={`space-y-1.5 flex flex-col justify-center ${isGrid ? 'mb-4 w-full' : 'mb-2 md:mb-0 md:max-w-xl md:mr-4'}`}>
          <h2 className={`font-serif italic tracking-wide text-black dark:text-white flex items-center gap-2 ${isGrid ? 'text-xl md:text-2xl justify-center' : 'text-sm md:text-2xl line-clamp-1 md:justify-start'}`}>
            {item.name}
          </h2>
          <div className="flex flex-col space-y-1.5">
             <p className={`text-[10px] md:text-sm text-black/60 dark:text-white/50 font-light leading-relaxed transition-all duration-300 ${!isExpanded ? (isGrid ? 'line-clamp-3' : 'line-clamp-2') : ''}`}>
               {item.description}
             </p>
             
             <div className={`grid transition-all duration-500 ease-in-out ${isExpanded ? 'grid-rows-[1fr] opacity-100 mt-2' : 'grid-rows-[0fr] opacity-0 mt-0 pointer-events-none'}`}>
                <div className="overflow-hidden">
                   <div className="pb-1 space-y-4 pt-1 flex flex-col items-stretch">
                      <div>
                         <p className="text-[8px] md:text-[9px] uppercase tracking-widest text-black/40 dark:text-white/40 mb-2 font-bold">Ingredients</p>
                         <div className={`flex flex-wrap gap-1.5 ${isGrid ? 'justify-center' : 'justify-start'}`}>
                            {Array.isArray(item.ingredients) ? item.ingredients.map((ing: string, idx: number) => (
                               <span key={idx} className="bg-black/5 dark:bg-white/5 px-2 py-0.5 rounded-sm text-[9px] md:text-[10px] text-black/70 dark:text-white/70 border border-black/10 dark:border-white/10">{ing}</span>
                            )) : null}
                         </div>
                      </div>
                      
                      {item.nutrition && (
                        <div>
                          <p className="text-[8px] md:text-[9px] uppercase tracking-widest text-black/40 dark:text-white/40 mb-2 font-bold">Nutrition</p>
                          <div className={`grid grid-cols-2 sm:grid-cols-4 gap-1.5 sm:gap-2 w-full ${isGrid ? 'max-w-[200px] sm:max-w-[240px] mx-auto' : 'max-w-[200px] sm:max-w-[280px]'}`}>
                              {[
                                { label: 'Cal', value: item.nutrition.calories },
                                { label: 'Pro', value: item.nutrition.protein },
                                { label: 'Carbs', value: item.nutrition.carbs },
                                { label: 'Fat', value: item.nutrition.fat }
                              ].map((nut, idx) => (
                                <div key={idx} className="flex flex-col items-center justify-center p-1.5 border border-black/5 dark:border-white/5 bg-black/5 dark:bg-white/5 rounded-sm">
                                    <span className="text-[8px] text-black/40 dark:text-white/40 uppercase tracking-wider mb-0.5">{nut.label}</span>
                                    <span className="text-[10px] md:text-[11px] font-bold text-black/80 dark:text-white/80">{nut.value || '-'}</span>
                                </div>
                              ))}
                          </div>
                        </div>
                      )}
                   </div>
                </div>
             </div>

             <button 
                onClick={(e) => { e.stopPropagation(); setIsExpanded(!isExpanded); }}
                className={`text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-gold hover:text-amber-500 transition-colors w-max py-0.5 ${isGrid ? 'mx-auto mt-2' : 'self-start mt-1'}`}
             >
                {isExpanded ? '- Less Info' : '+ More Info'}
             </button>
          </div>
        </div>
        <div className={`flex items-center justify-between shrink-0 w-full transition-all duration-500 ${isGrid ? 'flex-row mt-2' : 'flex-row md:flex-col md:w-[100px] md:items-end mt-auto md:mt-0 self-stretch md:py-1'}`}>
          {!isGrid && <div className={`hidden md:block transition-[flex-grow,height] duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] w-full ${isExpanded ? 'flex-[0.0001] h-0' : 'flex-[1]'}`}></div>}
          
          <span className={`font-serif text-[15px] md:text-xl text-gold shrink-0 z-10 transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${isGrid ? 'mb-0' : `mr-1 ${isExpanded ? 'mb-0 md:mb-0' : 'mb-0 md:mb-2'}`}`}>{item.price}</span>
          
          {!isGrid && <div className={`hidden md:block transition-[flex-grow,height] duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] w-full shrink-0 ${isExpanded ? 'flex-[1]' : 'flex-[0.0001] h-2'}`}></div>}

          <div className="shrink-0 z-10 flex flex-col items-end">
             {quantity > 0 ? (
               <div className="flex items-center bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-sm h-7 md:h-8">
                  <button onClick={() => updateQuantity(item.id, -1)} className="px-2.5 h-full hover:text-gold transition-colors text-black dark:text-white rounded-sm cursor-pointer flex items-center justify-center hover:bg-black/5 dark:hover:bg-white/5 active:bg-black/10 dark:active:bg-white/10">
                     <Minus size={12} strokeWidth={3} />
                  </button>
                  <span className="text-[11px] md:text-xs font-bold text-black dark:text-white w-5 text-center">{quantity}</span>
                  <button onClick={() => updateQuantity(item.id, 1)} className="px-2.5 h-full hover:text-gold transition-colors text-black dark:text-white rounded-sm cursor-pointer flex items-center justify-center hover:bg-black/5 dark:hover:bg-white/5 active:bg-black/10 dark:active:bg-white/10">
                     <Plus size={12} strokeWidth={3} />
                  </button>
               </div>
             ) : (
               <button 
                  onClick={() => updateQuantity(item.id, 1)}
                  className="px-6 py-1.5 md:py-2 bg-black/80 dark:bg-black/50 backdrop-blur-md border border-black dark:border-white/20 text-white rounded-sm text-[9px] md:text-[10px] uppercase font-bold tracking-[0.2em] hover:text-gold transition-colors shadow-sm cursor-pointer"
               >
                 ADD
               </button>
             )}
          </div>
          
          {!isGrid && <div className={`hidden md:block transition-[flex-grow,height] duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] w-full ${isExpanded ? 'flex-[0.0001] h-0' : 'flex-[1]'}`}></div>}
        </div>
      </div>
    </article>
  );
}

function Footer() {
  return (
    <footer className="w-full bg-glass-light dark:bg-glass border-t border-black/5 dark:border-white/5 mt-16 px-6 sm:px-10 py-12 flex flex-col md:flex-row justify-between gap-10 md:gap-0">
      
      <div className="flex flex-col space-y-6 md:w-1/3">
        <div>
          <p className="font-serif italic text-xl text-black dark:text-white">The Obsidian Palace</p>
          <p className="text-[8px] uppercase tracking-[0.4em] text-black/40 dark:text-white/20 mt-1">Excellence Refined</p>
        </div>
        <div className="space-y-1">
          <p className="text-[8px] uppercase tracking-widest text-black/50 dark:text-white/30">Address</p>
          <p className="text-[10px] font-light text-black dark:text-white">102 Luxury Row, Metropolis</p>
        </div>
        <div className="space-y-1">
          <p className="text-[8px] uppercase tracking-widest text-black/50 dark:text-white/30">Inquiries</p>
          <a href="mailto:concierge@obsidianpalace.com" className="text-[10px] font-light text-black dark:text-white hover:text-amber-700 dark:hover:text-gold transition-colors">concierge@obsidianpalace.com</a>
        </div>
      </div>

      <div className="flex flex-col space-y-2 md:w-1/3 md:items-center">
        <div className="flex flex-col space-y-3 w-fit">
          <p className="text-[8px] uppercase tracking-widest text-black/50 dark:text-white/30 mb-1">Explore</p>
          <a href="#" className="text-[11px] font-light text-black dark:text-white hover:text-amber-700 dark:hover:text-gold transition-colors">View Food Menu</a>
          <a href="#" className="text-[11px] font-light text-black dark:text-white hover:text-amber-700 dark:hover:text-gold transition-colors">About Us</a>
          <a href="#" className="text-[11px] font-light text-black dark:text-white hover:text-amber-700 dark:hover:text-gold transition-colors">Reservations & Bookings</a>
        </div>
      </div>

      <div className="flex flex-col space-y-2 md:w-1/3 md:items-end">
        <div className="flex flex-col space-y-3 w-fit md:text-right">
          <p className="text-[8px] uppercase tracking-widest text-black/50 dark:text-white/30 mb-1">Connect</p>
          <a href="#" className="text-[11px] font-light text-black dark:text-white hover:text-amber-700 dark:hover:text-gold transition-colors">Instagram</a>
          <a href="#" className="text-[11px] font-light text-black dark:text-white hover:text-amber-700 dark:hover:text-gold transition-colors">Facebook</a>
          <div className="pt-2">
            <a href="#" className="flex items-center gap-1.5 text-[11px] font-light text-black dark:text-white hover:text-amber-700 dark:hover:text-gold transition-colors">
              <span className="text-[10px]">★</span>
               Google Reviews
            </a>
          </div>
        </div>
      </div>

    </footer>
  );
}

export default function SmartMenuPage() {
  // ✅ FETCH DYNAMIC DATA
  const { data: dbMenuItems = [] } = useSWR("menuItems", getMenuItems);
  const { data: dbSettings } = useSWR("settings", getSettings);

  // ✅ Combine DB items with Dummy Items
  const ALL_MENU_ITEMS = [...MENU_ITEMS, ...dbMenuItems];
  
  // ✅ Extract Dynamic GST Rate (Defaults to 5 if not loaded)
  const currentGstRate = dbSettings?.gstRate ?? 5;

  const [isSubmitting, setIsSubmitting] = useState(false);

  type ConfirmedOrder = {
    id: string;
    customerName: string;
    tableNumber: string;
    contactNumber?: string;
    createdAt: string;
    total: number; 
    generalNote?: string;
    items: Array<{ id: number; name: string; quantity: number; price: number; note?: string }>;
  };

  const [fallbackItem, setFallbackItem] = useState<any>(null);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  
  const [isWaiterModalOpen, setIsWaiterModalOpen] = useState(false);
  const [tableNumber, setTableNumber] = useState('');
  
  const [cart, setCart] = useState<Record<number, number>>({});
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [orderStep, setOrderStep] = useState<'summary' | 'details' | 'confirmed'>('summary');
  const [isEditingOrder, setIsEditingOrder] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [orderTableNumber, setOrderTableNumber] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [generalOrderNote, setGeneralOrderNote] = useState('');
  const [itemNotes, setItemNotes] = useState<Record<number, string>>({});
  const [latestOrderId, setLatestOrderId] = useState<string | null>(null);
  const [orderHistory, setOrderHistory] = useState<ConfirmedOrder[]>([]);
  
  const cartCount = Object.values(cart).reduce((sum, qty) => sum + qty, 0);
  
  // Map against ALL_MENU_ITEMS
  const cartItems = ALL_MENU_ITEMS.filter((item) => (cart[item.id] || 0) > 0).map((item) => ({
    ...item,
    quantity: cart[item.id],
    numericPrice: Number(item.price.replace(/[^\d]/g, '')) || 0,
  }));
  
  const cartSubtotal = cartItems.reduce((sum, item) => sum + item.numericPrice * item.quantity, 0);
  
  // ✅ Calculate GST Dynamically based on Settings
  const gstAmount = Math.round(cartSubtotal * (currentGstRate / 100)); 
  const cartGrandTotal = cartSubtotal + gstAmount;

  const updateQuantity = (itemId: number, delta: number) => {
     setCart(prev => {
        const newCart = { ...prev };
        const current = newCart[itemId] || 0;
        const updated = current + delta;
        
        if (updated <= 0) {
           delete newCart[itemId];
        } else {
           newCart[itemId] = updated;
        }
        return newCart;
     });
  };

  const openOrderModal = () => {
    if (cartCount === 0) return;
    setIsOrderModalOpen(true);
    setOrderStep('summary');
    setIsEditingOrder(false);
  };

  const closeOrderModal = () => {
    setIsOrderModalOpen(false);
    setOrderStep('summary');
    setIsEditingOrder(false);
  };

  const confirmOrder = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (cartItems.length === 0) return;
    setIsSubmitting(true);

    const orderId = generateOrderId();
    
    const orderData = {
      id: orderId,
      guestName: customerName.trim(), 
      tableNumber: orderTableNumber.trim(),
      contactNumber: contactNumber.trim() || null,
      generalNote: generalOrderNote.trim() || null,
      total: cartGrandTotal,
      status: "active" as const,
    };

    const dbItemsData = cartItems.map((item) => ({
      menuItemId: item.id,
      name: item.name,
      quantity: item.quantity,
      price: item.numericPrice,
      note: itemNotes[item.id]?.trim() || null,
    }));

    const response = await submitOrder(orderData, dbItemsData);

    if (response.success) {
      const finalOrderId = response.orderId || orderId;
      setLatestOrderId(finalOrderId);
      
      const newHistoryItem: ConfirmedOrder = {
        id: finalOrderId,
        customerName: customerName.trim(),
        tableNumber: orderTableNumber.trim(),
        contactNumber: contactNumber.trim() || undefined,
        createdAt: new Date().toISOString(),
        total: cartGrandTotal,
        generalNote: generalOrderNote.trim() || undefined,
        items: cartItems.map((item) => ({
          id: item.id,
          name: item.name,
          quantity: item.quantity,
          price: item.numericPrice,
          note: itemNotes[item.id]?.trim() || undefined,
        })),
      };

      setOrderHistory((prev) => [newHistoryItem, ...prev]);
      
      setCart({});
      setCustomerName('');
      setOrderTableNumber('');
      setContactNumber('');
      setGeneralOrderNote('');
      setItemNotes({});
      setOrderStep('confirmed');
      setIsEditingOrder(false);
    } else {
      alert("Failed to place order. Please try again.");
    }
    setIsSubmitting(false);
  };

  const [searchQuery, setSearchQuery] = useState("");
  const [dietFilter, setDietFilter] = useState<'All' | 'Veg' | 'Non-Veg'>('All');
  const [viewLayout, setViewLayout] = useState<'list' | 'grid'>('list');

  // Filter against ALL_MENU_ITEMS
  const filteredItems = ALL_MENU_ITEMS.filter(item => {
    const matchCategory = activeCategory === 'All' || item.category === activeCategory;
    const matchSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        (Array.isArray(item.ingredients) && item.ingredients.some((ing: string) => ing.toLowerCase().includes(searchQuery.toLowerCase())));
    const matchDiet = dietFilter === 'All' || item.diet === dietFilter;
    return matchCategory && matchSearch && matchDiet;
  });

  return (
    <ThemeProvider>
      <div className="flex flex-col min-h-screen relative">
        <Header cartCount={cartCount} onCartClick={openOrderModal} />
        
        <section className="w-full bg-white/30 dark:bg-black/30 backdrop-blur-md border-b border-black/5 dark:border-white/5 sticky top-16 z-40">
          <div className="w-full px-4 sm:px-10">
            <div className="flex overflow-x-auto py-4 gap-1.5 md:gap-2.5 no-scrollbar items-center">
              {CATEGORIES.map((cat) => {
                const Icon = cat.icon;
                const isActive = activeCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={`group flex items-center gap-2 md:gap-2.5 px-1.5 py-1.5 pr-4 md:pr-5 rounded-sm whitespace-nowrap transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] border ${
                      isActive 
                        ? 'bg-gradient-to-r from-gold/20 to-gold/5 dark:from-gold/30 dark:to-gold/5 border-gold/40 shadow-[0_2px_10px_-2px_rgba(197,160,89,0.25)] md:-translate-y-[1px]' 
                        : 'bg-white/40 dark:bg-white/5 border-white/40 dark:border-white/5 text-black/60 dark:text-white/60 hover:bg-white/60 dark:hover:bg-white/10 hover:border-black/5 dark:hover:border-white/10 md:hover:-translate-y-[1px] hover:shadow-sm'
                    }`}
                  >
                    <div className={`p-1.5 md:p-2 rounded-sm transition-colors duration-500 flex items-center justify-center ${
                        isActive 
                          ? 'bg-gold text-white shadow-sm shadow-black/10' 
                          : 'bg-black/5 dark:bg-white/10 text-black/50 dark:text-white/50 group-hover:bg-black/10 dark:group-hover:bg-white/20 group-hover:text-gold'
                    }`}>
                        <Icon size={14} className="md:w-4 md:h-4 w-3.5 h-3.5" strokeWidth={isActive ? 2.5 : 2} />
                    </div>
                    <span className={`text-[10px] md:text-xs font-bold tracking-widest uppercase transition-colors duration-300 ${
                       isActive ? 'text-amber-900 dark:text-amber-100' : 'text-black/60 dark:text-white/60 group-hover:text-black dark:group-hover:text-white'
                    }`}>
                        {cat.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        <section className="w-full pt-6 pb-2 z-30">
          <div className="w-full px-4 sm:px-10 flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:flex-1 shrink">
              <IoSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-black/40 dark:text-white/40 z-10" size={16} />
              <input 
                type="text" 
                placeholder="Search menu or ingredients..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-glass border border-black/10 dark:border-white/10 rounded-full pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-gold transition-colors text-black dark:text-white placeholder:text-black/40 dark:placeholder:text-white/40"
              />
            </div>
            
            <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end shrink-0">
              
              <div className="relative flex w-[180px] sm:w-[240px] bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-full p-1 shadow-sm overflow-hidden">
                <div 
                   className={`absolute top-1 bottom-1 w-[calc(33.333%-2.66px)] rounded-full transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] shadow-sm ${
                      dietFilter === 'All' ? 'translate-x-[0px] bg-black dark:bg-white' :
                      dietFilter === 'Veg' ? 'translate-x-[100%] bg-green-600' :
                      'translate-x-[200%] bg-red-600'
                   }`}
                />
                
                {(['All', 'Veg', 'Non-Veg'] as const).map(diet => (
                  <button
                    key={diet}
                    onClick={() => setDietFilter(diet)}
                    className={`relative z-10 flex-1 py-1 sm:py-1.5 text-[9px] sm:text-xs font-bold tracking-wide uppercase transition-colors duration-300 ${
                      dietFilter === diet 
                        ? (diet === 'All' ? 'text-white dark:text-black' : 'text-white')
                        : 'text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white'
                    }`}
                  >
                    {diet}
                  </button>
                ))}
              </div>

              <div className="relative flex w-[72px] sm:w-[88px] bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-full p-1 shadow-sm overflow-hidden">
                <div 
                   className={`absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-full bg-black dark:bg-white transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] shadow-sm ${
                      viewLayout === 'list' ? 'translate-x-[0px]' : 'translate-x-[100%]'
                   }`}
                />
                <button
                  onClick={() => setViewLayout('list')}
                  className={`relative z-10 flex-1 flex items-center justify-center py-1 sm:py-1.5 transition-colors duration-300 ${viewLayout === 'list' ? 'text-white dark:text-black' : 'text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white'}`}
                  title="List View"
                >
                  <ListIcon size={14} className="sm:w-4 sm:h-4" />
                </button>
                <button
                  onClick={() => setViewLayout('grid')}
                  className={`relative z-10 flex-1 flex items-center justify-center py-1 sm:py-1.5 transition-colors duration-300 ${viewLayout === 'grid' ? 'text-white dark:text-black' : 'text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white'}`}
                  title="Grid View"
                >
                  <LayoutGrid size={14} className="sm:w-4 sm:h-4" />
                </button>
              </div>
            </div>
          </div>
        </section>
        
        <main className={`flex-1 px-4 sm:px-10 py-6 w-full ${viewLayout === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6' : 'flex flex-col gap-4'}`}>
          {filteredItems.length > 0 ? (
            filteredItems.map((item) => (
              <MenuItem key={item.id} item={item} onFallback={setFallbackItem} layout={viewLayout} cart={cart} updateQuantity={updateQuantity} />
            ))
          ) : (
            <div className="w-full py-20 flex flex-col items-center justify-center text-center opacity-50 col-span-full">
               <Search size={48} className="mb-4 text-black dark:text-white opacity-20" />
               <p className="text-lg font-serif italic text-black dark:text-white">No items match your search.</p>
               <button 
                  onClick={() => { setSearchQuery(""); setDietFilter("All"); setActiveCategory("All"); }}
                  className="mt-4 text-[10px] uppercase font-bold tracking-widest text-gold text-center hover:opacity-70 transition border-b border-gold/30 pb-1 pointer-events-auto"
               >
                 Clear Filters
               </button>
            </div>
          )}
        </main>

        <Footer />
      </div>

      <button
        onClick={() => setIsWaiterModalOpen(true)}
        className={`group fixed bottom-6 right-6 md:bottom-10 md:right-10 z-[60] flex items-center justify-center p-3 sm:p-4 rounded-full border whitespace-nowrap transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] 
          bg-gold/20 dark:bg-gold/10 border-gold/30 dark:border-gold/20 hover:bg-gold/30 dark:hover:bg-gold/20 hover:border-gold/50 dark:hover:border-gold/40 hover:-translate-y-1 hover:shadow-[0_4px_15px_-3px_rgba(197,160,89,0.3)] backdrop-blur-md cursor-pointer`}
      >
        <div className="rounded-sm transition-colors duration-500 flex items-center justify-center text-amber-900/80 dark:text-gold/80 group-hover:text-amber-950 dark:group-hover:text-gold">
          <User size={20} strokeWidth={2.5} className="md:w-6 md:h-6" />
        </div>
      </button>

      {isWaiterModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm bg-white dark:bg-[#0a0a0a] border border-black/10 dark:border-white/10 p-6 rounded-2xl shadow-2xl relative">
            <button 
              onClick={() => setIsWaiterModalOpen(false)} 
              className="absolute top-4 right-4 text-black/40 dark:text-white/40 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
            
            <div className="flex flex-col items-center text-center space-y-4 mb-6 mt-2">
               <div className="p-3 rounded-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-gold">
                   <User size={24} />
               </div>
               <div>
                 <h3 className="text-xl font-serif italic text-black dark:text-white">Call the Waiter</h3>
                 <p className="text-xs text-black/50 dark:text-white/50 font-light mt-1 w-4/5 mx-auto">
                    Please enter your table number and we will be right there to assist you.
                 </p>
               </div>
            </div>

            <form 
               onSubmit={(e) => { 
                 e.preventDefault(); 
                 setIsWaiterModalOpen(false); 
                 setTableNumber('');
               }}
            >
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-black/50 dark:text-white/50 mb-1.5 ml-1">
                     Table Number
                  </label>
                  <input
                    type="number"
                    value={tableNumber}
                    onChange={(e) => setTableNumber(e.target.value)}
                    required
                    min="1"
                    className="no-spinners w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 py-3 px-4 rounded-xl text-sm focus:outline-none focus:border-gold text-black dark:text-white transition-colors placeholder:text-black/30 dark:placeholder:text-white/30"
                    placeholder="e.g. 12"
                  />
                </div>
                <button 
                  type="submit" 
                  className="w-full bg-gold/90 hover:bg-gold text-white font-bold uppercase tracking-[0.2em] text-[10px] sm:text-xs py-3.5 rounded-xl transition-all shadow-md cursor-pointer mt-2"
                >
                  Request Waiter
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isOrderModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/55 backdrop-blur-sm p-4">
          <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-white dark:bg-[#0a0a0a] border border-black/10 dark:border-white/10 p-4 sm:p-6 rounded-2xl shadow-2xl relative">
            
            {isSubmitting && (
              <div className="absolute inset-0 z-[110] flex flex-col items-center justify-center bg-white/60 dark:bg-[#0a0a0a]/60 backdrop-blur-md rounded-2xl">
                <div className="w-12 h-12 border-4 border-gold/20 border-t-gold rounded-full animate-spin mb-4 shadow-lg"></div>
                <p className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] text-gold animate-pulse">Sending to Kitchen...</p>
              </div>
            )}

            <button
              onClick={closeOrderModal}
              className="absolute top-4 right-4 text-black/40 dark:text-white/40 hover:text-black dark:hover:text-white transition-colors cursor-pointer z-50"
            >
              <X size={18} />
            </button>

            <div className="pr-8">
              <h3 className="text-xl sm:text-2xl font-serif italic text-black dark:text-white">Your Order</h3>
              <p className="text-[10px] sm:text-xs uppercase tracking-[0.2em] text-black/45 dark:text-white/45 mt-1">
                {orderStep === 'summary'
                  ? 'Order Summary'
                  : orderStep === 'details'
                    ? 'Guest Details'
                    : 'Order Confirmed'}
              </p>
            </div>

            {orderStep === 'summary' && (
              <div className="mt-6 space-y-5">
                {cartItems.length > 0 ? (
                  <>
                    <div className="space-y-2.5">
                      {cartItems.map((item) => (
                        <div
                          key={item.id}
                          className="border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 rounded-xl p-3 sm:p-4 space-y-3"
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <p className="text-sm sm:text-base font-semibold text-black dark:text-white">{item.name}</p>
                              <p className="text-[11px] sm:text-xs text-black/55 dark:text-white/55">
                                {item.price} each
                              </p>
                            </div>
                            {isEditingOrder ? (
                              <div className="flex items-center bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-sm h-8 shrink-0">
                                <button
                                  onClick={() => updateQuantity(item.id, -1)}
                                  className="px-2.5 h-full hover:text-gold transition-colors text-black dark:text-white flex items-center justify-center"
                                >
                                  <Minus size={12} strokeWidth={3} />
                                </button>
                                <span className="text-[11px] md:text-xs font-bold text-black dark:text-white w-6 text-center">{item.quantity}</span>
                                <button
                                  onClick={() => updateQuantity(item.id, 1)}
                                  className="px-2.5 h-full hover:text-gold transition-colors text-black dark:text-white flex items-center justify-center"
                                >
                                  <Plus size={12} strokeWidth={3} />
                                </button>
                              </div>
                            ) : (
                              <p className="text-xs sm:text-sm text-black/75 dark:text-white/75 shrink-0">x{item.quantity}</p>
                            )}
                          </div>
                          <div>
                            <label className="block text-[10px] uppercase tracking-[0.18em] text-black/45 dark:text-white/45 mb-1.5">
                              Add Note (Optional)
                            </label>
                            <input
                              type="text"
                              value={itemNotes[item.id] || ''}
                              onChange={(e) => setItemNotes((prev) => ({ ...prev, [item.id]: e.target.value }))}
                              className="w-full bg-white/40 dark:bg-white/5 border border-black/10 dark:border-white/10 py-2 px-3 rounded-lg text-xs sm:text-sm focus:outline-none focus:border-gold text-black dark:text-white placeholder:text-black/30 dark:placeholder:text-white/30"
                              placeholder={`Note for ${item.name}`}
                            />
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 rounded-xl p-3 sm:p-4">
                      <label className="block text-[10px] uppercase tracking-[0.18em] text-black/45 dark:text-white/45 mb-1.5">
                        General Order Note (Optional)
                      </label>
                      <textarea
                        value={generalOrderNote}
                        onChange={(e) => setGeneralOrderNote(e.target.value)}
                        rows={3}
                        className="w-full resize-none bg-white/40 dark:bg-white/5 border border-black/10 dark:border-white/10 py-2.5 px-3 rounded-lg text-xs sm:text-sm focus:outline-none focus:border-gold text-black dark:text-white placeholder:text-black/30 dark:placeholder:text-white/30"
                        placeholder="Example: Please serve all dishes together / less spicy / birthday table."
                      />
                    </div>

                    <div className="space-y-2 border-t border-black/10 dark:border-white/10 pt-3">
                      <div className="flex items-center justify-between">
                        <p className="text-xs uppercase tracking-[0.2em] text-black/55 dark:text-white/55">Subtotal</p>
                        <p className="text-sm font-serif text-black dark:text-white">₹{cartSubtotal}</p>
                      </div>
                      <div className="flex items-center justify-between">
                        {/* ✅ Dynamically shows the rate */}
                        <p className="text-xs uppercase tracking-[0.2em] text-black/55 dark:text-white/55">GST ({currentGstRate}%)</p>
                        <p className="text-sm font-serif text-black dark:text-white">₹{gstAmount}</p>
                      </div>
                      <div className="flex items-center justify-between pt-2 border-t border-black/5 dark:border-white/5">
                        <p className="text-xs uppercase tracking-[0.2em] text-black/80 dark:text-white/80 font-bold">Grand Total</p>
                        <p className="text-lg sm:text-xl font-serif text-gold font-bold">₹{cartGrandTotal}</p>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
                      <button
                        onClick={() => setIsEditingOrder((prev) => !prev)}
                        className="w-full sm:w-auto px-6 py-2.5 border border-black/15 dark:border-white/15 rounded-xl text-[10px] sm:text-xs uppercase tracking-[0.2em] font-bold text-black/70 dark:text-white/70"
                      >
                        {isEditingOrder ? 'Done Editing' : 'Edit Order'}
                      </button>
                      <button
                        onClick={() => setOrderStep('details')}
                        className="w-full sm:flex-1 bg-gold/90 hover:bg-gold text-white font-bold uppercase tracking-[0.2em] text-[10px] sm:text-xs py-2.5 rounded-xl transition-all shadow-md cursor-pointer"
                      >
                        Confirm Order
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="py-8 text-center text-black/55 dark:text-white/55 text-sm">
                    Your cart is empty. Add items to continue.
                  </div>
                )}
              </div>
            )}

            {orderStep === 'details' && (
              <form onSubmit={confirmOrder} className="mt-6 space-y-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-black/50 dark:text-white/50 mb-1.5 ml-1">
                    Name
                  </label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    required
                    className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 py-3 px-4 rounded-xl text-sm focus:outline-none focus:border-gold text-black dark:text-white placeholder:text-black/30 dark:placeholder:text-white/30"
                    placeholder="Guest name"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-black/50 dark:text-white/50 mb-1.5 ml-1">
                    Table Number
                  </label>
                  <input
                    type="number"
                    value={orderTableNumber}
                    onChange={(e) => setOrderTableNumber(e.target.value)}
                    required
                    min="1"
                    className="no-spinners w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 py-3 px-4 rounded-xl text-sm focus:outline-none focus:border-gold text-black dark:text-white placeholder:text-black/30 dark:placeholder:text-white/30"
                    placeholder="e.g. 12"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-black/50 dark:text-white/50 mb-1.5 ml-1">
                    Number (Optional)
                  </label>
                  <input
                    type="tel"
                    value={contactNumber}
                    onChange={(e) => setContactNumber(e.target.value)}
                    className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 py-3 px-4 rounded-xl text-sm focus:outline-none focus:border-gold text-black dark:text-white placeholder:text-black/30 dark:placeholder:text-white/30"
                    placeholder="Phone number"
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
                  <button
                    type="button"
                    onClick={() => setOrderStep('summary')}
                    className="w-full sm:w-auto px-6 py-2.5 border border-black/15 dark:border-white/15 rounded-xl text-[10px] sm:text-xs uppercase tracking-[0.2em] font-bold text-black/70 dark:text-white/70"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    className="w-full sm:flex-1 bg-gold/90 hover:bg-gold text-white font-bold uppercase tracking-[0.2em] text-[10px] sm:text-xs py-2.5 rounded-xl transition-all shadow-md cursor-pointer"
                  >
                    Place Order
                  </button>
                </div>
              </form>
            )}

            {orderStep === 'confirmed' && (
              <div className="mt-6 space-y-5">
                <div className="border border-gold/35 bg-gold/10 rounded-xl p-4 sm:p-5">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-black/50 dark:text-white/50">Order ID</p>
                  <p className="text-2xl sm:text-3xl font-serif text-gold mt-1">{latestOrderId}</p>
                </div>

                <div>
                  <p className="text-[10px] sm:text-xs uppercase tracking-[0.2em] text-black/50 dark:text-white/50 mb-2.5">
                    Order History
                  </p>
                  <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
                    {orderHistory.map((order, index) => {
                      const histSubtotal = order.items.reduce((acc, i) => acc + i.price * i.quantity, 0);
                      // ✅ Dynamically calculates history breakdown
                      const histGst = Math.round(histSubtotal * (currentGstRate / 100));

                      return (
                        <div
                          key={`${order.id}-${index}`}
                          className="border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 rounded-xl p-3"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="text-sm font-semibold text-black dark:text-white">{order.id}</p>
                              <p className="text-[11px] text-black/55 dark:text-white/55">
                                {order.customerName} | Table {order.tableNumber}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-[10px] text-black/55 dark:text-white/55">Subtotal: ₹{histSubtotal}</p>
                              <p className="text-[10px] text-black/55 dark:text-white/55 mb-0.5">GST: ₹{histGst}</p>
                              <p className="text-sm font-serif text-gold font-bold">Total: ₹{order.total}</p>
                            </div>
                          </div>
                          <p className="text-[11px] text-black/50 dark:text-white/50 mt-1">
                            {new Date(order.createdAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
                          </p>
                          
                          <p className="text-[11px] text-black/70 dark:text-white/70 mt-1.5 leading-relaxed font-medium">
                            {order.items.map(item => `${item.name} (${item.quantity})`).join(', ')}
                          </p>

                          {order.generalNote ? (
                            <p className="text-[11px] text-amber-700/80 dark:text-amber-400/80 mt-1.5">Note: {order.generalNote}</p>
                          ) : null}
                          
                          {order.items.some((item) => item.note) ? (
                            <div className="mt-1.5 space-y-1">
                              {order.items
                                .filter((item) => item.note)
                                .map((item) => (
                                  <p key={`${order.id}-${item.id}`} className="text-[11px] text-black/60 dark:text-white/60">
                                    {item.name}: {item.note}
                                  </p>
                                ))}
                            </div>
                          ) : null}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <button
                  onClick={closeOrderModal}
                  className="w-full bg-black text-white dark:bg-white dark:text-black font-bold uppercase tracking-[0.2em] text-[10px] sm:text-xs py-2.5 rounded-xl transition-all shadow-md cursor-pointer"
                >
                  Done
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {fallbackItem && (
        <div className="fixed inset-0 z-[100] bg-[#050505] flex flex-col items-center justify-center backdrop-blur-xl">
          <button 
             onClick={() => setFallbackItem(null)}
             className="absolute top-6 left-6 z-[110] px-4 py-2 bg-white/5 backdrop-blur-md rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-widest text-white border border-white/10 hover:bg-white/10 transition cursor-pointer flex items-center justify-center gap-2 shadow-sm"
          >
             <span className="text-lg leading-none">&larr;</span> Back to Menu
          </button>
          
          <div className="absolute bottom-10 z-[110] pointer-events-none w-full text-center px-4">
             <p className="font-serif italic text-xl tracking-wide text-white">
                 {fallbackItem.name}
             </p>
             <p className="text-[10px] tracking-widest text-white/40 mt-1 uppercase">
                 5D Interactive View
             </p>
          </div>

          <div className="w-full h-full max-h-screen">
            <ModelViewer 
               id={`fallback-viewer-${fallbackItem.id}`} 
               src={fallbackItem.modelUrl} 
               alt={fallbackItem.name} 
               ingredients={fallbackItem.ingredients}
               nutrition={fallbackItem.nutrition}
               showInteractiveUI={true}
            />
          </div>
        </div>
      )}
    </ThemeProvider>
  );
}