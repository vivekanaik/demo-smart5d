"use client";

import Link from "next/link";
import { MoveLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a0a] flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-6">
        <h1 className="text-8xl font-serif italic text-black/10 dark:text-white/10">404</h1>
        <div className="space-y-2">
          <h2 className="text-2xl font-serif italic text-black dark:text-white">Page Not Found</h2>
          <p className="text-sm text-black/50 dark:text-white/50 font-light">
            The page you are looking for doesn't exist or has been moved.
          </p>
        </div>
        
        <div className="pt-8 flex justify-center">
          <Link 
            href="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gold/90 hover:bg-gold text-white font-bold uppercase tracking-widest text-[10px] sm:text-xs rounded-xl transition-all shadow-md cursor-pointer"
          >
            <MoveLeft size={16} />
            Return to Menu
          </Link>
        </div>
      </div>
    </div>
  );
}
