"use client";

import React from "react";
import { ThemeProvider, useTheme } from "@/components/ThemeProvider";
import ModelViewer from "@/components/ModelViewer";

// Dummy data for our 4D menu items
const MENU_ITEMS = [
  {
    id: 1,
    name: "Wagyu Beef Carpaccio",
    description: "Ultra-thin A5 Miyazaki Wagyu, black truffle aioli, aged balsamic pearls, micro-basil.",
    price: "₹4800",
    modelUrl: "https://modelviewer.dev/shared-assets/models/Astronaut.glb",
    posterUrl: "https://picsum.photos/seed/wagyu/400/400"
  },
  {
    id: 2,
    name: "Saffron Gold Risotto",
    description: "Acquerello rice, Persian saffron, 24k edible gold leaf, aged Parmigiano-Reggiano.",
    price: "₹1160",
    modelUrl: "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/DamagedHelmet/glTF-Binary/DamagedHelmet.glb"
  },
  {
    id: 3,
    name: "Glacier Seared Scallops",
    description: "Hokkaido scallops, parsnip velvet, sea buckthorn reduction, crispy serrano ham.",
    price: "₹1150",
    modelUrl: "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Avocado/glTF-Binary/Avocado.glb",
    posterUrl: "https://picsum.photos/seed/scallops/400/400"
  },
  {
    id: 4,
    name: "Black Winter Tagliatelle",
    description: "House-made egg pasta, cultured butter, 10g shaved Norcia black winter truffle.",
    price: "₹7500",
    modelUrl: "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Lantern/glTF-Binary/Lantern.glb"
  },
  {
    id: 5,
    name: "The Obsidian Sphere",
    description: "70% Valrhona dark chocolate shell, salted caramel heart, liquid nitrogen smoke.",
    price: "₹3200",
    modelUrl: "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Corset/glTF-Binary/Corset.glb",
    posterUrl: "https://picsum.photos/seed/obsid/400/400"
  }
];

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

function Header() {
  return (
    <header className="h-16 flex items-center justify-between px-4 sm:px-10 border-b border-black/5 dark:border-white/5 bg-white/40 dark:bg-black/40 backdrop-blur-md sticky top-0 z-50 transition-colors duration-500">
      <div className="flex items-center space-x-2 sm:space-x-4">
        <span className="uppercase tracking-[0.2em] sm:tracking-[0.3em] text-[10px] sm:text-xs font-bold text-black dark:text-white">The Obsidian Palace</span>
        <span className="text-black/20 dark:text-white/20">|</span>
        <span className="uppercase tracking-[0.1em] text-[8px] sm:text-[10px] text-black/60 dark:text-white/60">5D Menu</span>
      </div>
      <div className="flex items-center space-x-4 sm:space-x-6">
        <ThemeToggle />
      </div>
    </header>
  );
}

function MenuItem({ item, onFallback }: { item: typeof MENU_ITEMS[0], onFallback: (item: typeof MENU_ITEMS[0]) => void }) {
  const [isArLoading, setIsArLoading] = React.useState(false);

  const handleTriggerAR = async (e: React.MouseEvent) => {
    e.preventDefault();
    setIsArLoading(true);
    
    // Check if iOS. iOS QuickLook handles this natively and attempting `getUserMedia` async 
    // forces the browser to drop the strictly necessary synchronous touch context.
    const isIOS = /iPad|iPhone|iPod/i.test(navigator.userAgent) && !(window as any).MSStream;
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    const viewer = document.getElementById(`viewer-${item.id}`) as any;

    const cleanup = () => setIsArLoading(false);

    // If it's a desktop browser, immediately drop into Fallback 3D view mode.
    if (!isMobile) {
        cleanup();
        onFallback(item);
        return;
    }

    if (!viewer || !viewer.activateAR) {
       cleanup();
       onFallback(item);
       return;
    }

    // Attach listener for completion or failure states
    const handleStatus = (event: any) => {
        if (event.detail.status === 'failed') {
            cleanup();
            onFallback(item);
            viewer.removeEventListener('ar-status', handleStatus);
        } else if (event.detail.status === 'session-started' || event.detail.status === 'object-placed') {
            cleanup();
            viewer.removeEventListener('ar-status', handleStatus);
        } else if (event.detail.status === 'not-presenting') {
            cleanup();
            viewer.removeEventListener('ar-status', handleStatus);
        }
    };
    viewer.addEventListener('ar-status', handleStatus);

    try {
        await viewer.activateAR();
        
        // Failsafe timeout to clean up spinner if native intents swallow the success emit
        setTimeout(cleanup, 2000); 
    } catch (error) {
        cleanup();
        onFallback(item); // WebXR failed fundamentally
    }
  };

  return (
    <article className="flex flex-col md:flex-row min-h-[140px] md:h-auto bg-glass rounded-sm overflow-hidden group transition-transform duration-300">
      
      {/* Left Side: 3D Viewer Container */}
      <div className="w-full md:w-1/5 h-48 md:h-auto bg-white/50 dark:bg-black/50 flex items-center justify-center relative shrink-0">
        <div className="absolute inset-0 opacity-20 mix-blend-overlay pointer-events-none"></div>
        <ModelViewer id={`viewer-${item.id}`} src={item.modelUrl} alt={item.name} poster={item.posterUrl} />
        
        {/* Subtle AR indication overlay via AR modes */}
        <div className="absolute top-2 left-2 pointer-events-none z-10 text-[8px] uppercase tracking-tighter text-black/50 dark:text-white/30 border border-black/10 dark:border-white/10 p-2 bg-white/20 dark:bg-black/20 backdrop-blur-xs">
           5D View Enabled
        </div>
        
        {/* Decorative dots based on design HTML */}
        <div className="absolute bottom-2 left-2 flex space-x-1 opacity-20 pointer-events-none z-10">
          <div className="w-1 h-1 bg-black dark:bg-white rounded-full"></div>
          <div className="w-1 h-1 bg-black dark:bg-white rounded-full"></div>
          <div className="w-1 h-1 bg-black dark:bg-white rounded-full"></div>
        </div>
      </div>

      {/* Right Side: Dish Details */}
      <div className="w-full md:w-4/5 px-6 py-4 md:px-8 flex flex-col md:flex-row md:items-center justify-between">
        <div className="space-y-1 mb-4 md:mb-0 max-w-lg">
          <h2 className="font-serif text-2xl italic tracking-wide text-black dark:text-white">
            {item.name}
          </h2>
          <p className="text-sm text-black/60 dark:text-white/50 font-light leading-relaxed">
            {item.description}
          </p>
        </div>
        <div className="flex flex-row md:flex-col items-center md:items-end justify-between w-full md:w-auto">
          <span className="font-serif text-xl text-amber-700 dark:text-gold mb-0 md:mb-2">{item.price}</span>
          <button 
             onClick={handleTriggerAR}
             disabled={isArLoading}
             className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] border-b border-black/20 dark:border-gold pb-1 opacity-80 hover:opacity-100 transition-opacity whitespace-nowrap text-black dark:text-white cursor-pointer disabled:opacity-50"
          >
            {isArLoading && (
              <svg className="animate-spin h-3 w-3 text-amber-500 dark:text-gold" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5"></circle>
                <path className="opacity-100" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            )}
            <span>View in Space</span>
          </button>
        </div>
      </div>
    </article>
  );
}

function Footer() {
  return (
    <footer className="w-full bg-glass-light dark:bg-glass border-t border-black/5 dark:border-white/5 mt-16 px-6 sm:px-10 py-12 flex flex-col md:flex-row justify-between gap-10 md:gap-0">
      
      {/* Brand & Contact */}
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

      {/* Quick Links */}
      <div className="flex flex-col space-y-2 md:w-1/3 md:items-center">
        <div className="flex flex-col space-y-3 w-fit">
          <p className="text-[8px] uppercase tracking-widest text-black/50 dark:text-white/30 mb-1">Explore</p>
          <a href="#" className="text-[11px] font-light text-black dark:text-white hover:text-amber-700 dark:hover:text-gold transition-colors">View Food Menu</a>
          <a href="#" className="text-[11px] font-light text-black dark:text-white hover:text-amber-700 dark:hover:text-gold transition-colors">About Us</a>
          <a href="#" className="text-[11px] font-light text-black dark:text-white hover:text-amber-700 dark:hover:text-gold transition-colors">Reservations & Bookings</a>
        </div>
      </div>

      {/* Social & Connect */}
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
  const [fallbackItem, setFallbackItem] = React.useState<typeof MENU_ITEMS[0] | null>(null);

  return (
    <ThemeProvider>
      <div className="flex flex-col min-h-screen relative">
        <Header />
        
        <main className="flex-1 px-4 sm:px-10 py-6 flex flex-col gap-3 max-w-6xl mx-auto w-full">
          {MENU_ITEMS.map((item, index) => (
            <MenuItem key={item.id} item={item} onFallback={setFallbackItem} />
          ))}
        </main>

        <Footer />
      </div>

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
            />
          </div>
        </div>
      )}
    </ThemeProvider>
  );
}
