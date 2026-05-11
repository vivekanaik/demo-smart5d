"use client";

import { useEffect } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a0a] flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="flex justify-center">
          <div className="p-4 rounded-full bg-red-500/10 text-red-500 border border-red-500/20">
            <AlertTriangle size={32} />
          </div>
        </div>
        
        <div className="space-y-2">
          <h2 className="text-2xl font-serif italic text-black dark:text-white">Something went wrong!</h2>
          <p className="text-sm text-black/50 dark:text-white/50 font-light">
            We apologize for the inconvenience. An unexpected error occurred.
          </p>
        </div>
        
        <div className="pt-8 flex justify-center">
          <button
            onClick={() => reset()}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gold/90 hover:bg-gold text-white font-bold uppercase tracking-widest text-[10px] sm:text-xs rounded-xl transition-all shadow-md cursor-pointer"
          >
            <RotateCcw size={16} />
            Try Again
          </button>
        </div>
      </div>
    </div>
  );
}
