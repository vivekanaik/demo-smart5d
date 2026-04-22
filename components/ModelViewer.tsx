"use client";

import React, { useEffect, useState, useRef } from 'react';

interface ModelViewerProps {
  src: string;
  alt: string;
  poster?: string;
  id?: string;
  ingredients?: string[];
  nutrition?: any;
  showInteractiveUI?: boolean; // True for fullscreen fallback
}

export default function ModelViewer({ src, alt, poster, id, ingredients, nutrition, showInteractiveUI }: ModelViewerProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [isArActive, setIsArActive] = useState(false);
  const [activeTab, setActiveTab] = useState<'ingredients' | 'nutrition' | null>(null);
  const viewerRef = useRef<any>(null);

  useEffect(() => {
    import('@google/model-viewer').then(() => {
      setIsMounted(true);
    }).catch(console.error);
  }, []);

  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer) return;

    const handleArStatus = (event: any) => {
        if (event.detail.status === 'session-started') {
            setIsArActive(true);
        } else if (event.detail.status === 'not-presenting') {
            setIsArActive(false);
            setActiveTab(null);
        }
    };

    viewer.addEventListener('ar-status', handleArStatus);
    return () => viewer.removeEventListener('ar-status', handleArStatus);
  }, [isMounted]);

  const showUI = showInteractiveUI || isArActive;

  if (!isMounted) {
    return (
      <div className="w-full h-full bg-black/5 dark:bg-white/5 overflow-hidden relative flex items-center justify-center">
        {poster ? (
          <img src={poster} alt={alt} className="absolute inset-0 w-full h-full object-cover opacity-50 grayscale transition-opacity" />
        ) : (
          <span className="text-[10px] font-semibold tracking-widest uppercase text-black/50 dark:text-white/50 animate-pulse text-center">
            {alt} 3D<br/>Loading...
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="w-full h-full overflow-hidden relative group">
      {React.createElement(
        'model-viewer',
        {
          ref: viewerRef,
          id,
          src,
          alt,
          poster,
          'camera-controls': true,
          ar: true,
          'ar-modes': 'webxr scene-viewer quick-look',
          'ar-placement': 'floor',
          bounds: 'tight',
          'ar-scale': 'auto',
          reveal: 'auto',
          style: { width: '100%', height: '100%', backgroundColor: 'transparent' }
        },
        <>
          <div slot="poster" className="absolute inset-0 flex flex-col items-center justify-center bg-black/5 dark:bg-white/5">
            {poster ? (
              <img src={poster} alt={alt} className="absolute inset-0 w-full h-full object-cover" />
            ) : (
               <span className="text-[10px] font-semibold tracking-widest uppercase text-black/50 dark:text-white/50 animate-pulse z-10 relative text-center">
                 {alt} 3D<br/>Loading...
               </span>
            )}
            <div className="absolute bottom-4 left-0 w-full flex justify-center z-10 pointer-events-none">
               <span className="text-[8px] uppercase tracking-widest bg-white/80 dark:bg-black/80 px-2 py-1 rounded-sm text-black/70 dark:text-white/70 shadow-sm backdrop-blur animate-pulse">
                 Loading 3D Model...
               </span>
            </div>
          </div>
          
          {/* Custom AR Overlay UI */}
          {showUI && (ingredients || nutrition) && (
             <div className="absolute inset-0 z-50 pointer-events-none">
                 
                 {/* Top Buttons Centered */}
                 <div className="absolute top-6 left-0 w-full flex justify-center gap-3 pointer-events-auto">
                    {ingredients && (
                      <button 
                         onClick={() => setActiveTab(activeTab === 'ingredients' ? null : 'ingredients')}
                         className={`px-4 py-2 rounded-full backdrop-blur-md shadow-sm text-[10px] sm:text-xs uppercase tracking-widest font-bold transition-all duration-300 ${activeTab === 'ingredients' ? 'bg-white/20 border border-white/40 text-white' : 'bg-white/5 border border-white/10 text-white/80 hover:bg-white/10'}`}
                      >
                         Ingredients
                      </button>
                    )}
                    {nutrition && (
                      <button 
                         onClick={() => setActiveTab(activeTab === 'nutrition' ? null : 'nutrition')}
                         className={`px-4 py-2 rounded-full backdrop-blur-md shadow-sm text-[10px] sm:text-xs uppercase tracking-widest font-bold transition-all duration-300 ${activeTab === 'nutrition' ? 'bg-white/20 border border-white/40 text-white' : 'bg-white/5 border border-white/10 text-white/80 hover:bg-white/10'}`}
                      >
                         Nutrition
                      </button>
                    )}
                 </div>

                 {/* Floating Plain Text Panels */}
                 {activeTab === 'ingredients' && ingredients && (
                    <div className="absolute top-28 left-0 w-full px-4 sm:px-10 flex justify-between items-start pointer-events-none animate-in fade-in duration-500">
                       <ul className="flex flex-col gap-y-12 w-[42%]">
                          {ingredients.slice(0, Math.ceil(ingredients.length / 2)).map((ing, idx) => (
                             <li key={idx} className="text-xl sm:text-2xl font-rum-raisin text-white tracking-wide text-left pointer-events-auto leading-snug" style={{ textShadow: '0px 2px 12px rgba(0,0,0,0.95), 0px 1px 4px rgba(0,0,0,0.9)' }}>
                                {ing}
                             </li>
                          ))}
                       </ul>
                       <ul className="flex flex-col gap-y-12 w-[42%] items-end">
                          {ingredients.slice(Math.ceil(ingredients.length / 2)).map((ing, idx) => (
                             <li key={idx} className="text-xl sm:text-2xl font-rum-raisin text-white tracking-wide text-right pointer-events-auto leading-snug" style={{ textShadow: '0px 2px 12px rgba(0,0,0,0.95), 0px 1px 4px rgba(0,0,0,0.9)' }}>
                                {ing}
                             </li>
                          ))}
                       </ul>
                    </div>
                 )}

                 {activeTab === 'nutrition' && nutrition && (
                    <div className="absolute top-28 left-0 w-full flex flex-wrap justify-center gap-8 sm:gap-14 pointer-events-auto animate-in fade-in duration-500">
                          <div className="text-center">
                              <p className="text-[10px] sm:text-xs uppercase tracking-widest font-bold text-amber-400 mb-1" style={{ textShadow: '0px 1px 4px rgba(0,0,0,0.9)' }}>Calories</p>
                              <p className="font-rum-raisin text-3xl sm:text-4xl text-white tracking-wide" style={{ textShadow: '0px 2px 8px rgba(0,0,0,0.9), 0px 1px 3px rgba(0,0,0,0.8)' }}>{nutrition.calories}</p>
                          </div>
                          <div className="text-center">
                              <p className="text-[10px] sm:text-xs uppercase tracking-widest font-bold text-amber-400 mb-1" style={{ textShadow: '0px 1px 4px rgba(0,0,0,0.9)' }}>Protein</p>
                              <p className="font-rum-raisin text-3xl sm:text-4xl text-white tracking-wide" style={{ textShadow: '0px 2px 8px rgba(0,0,0,0.9), 0px 1px 3px rgba(0,0,0,0.8)' }}>{nutrition.protein}</p>
                          </div>
                          <div className="text-center">
                              <p className="text-[10px] sm:text-xs uppercase tracking-widest font-bold text-amber-400 mb-1" style={{ textShadow: '0px 1px 4px rgba(0,0,0,0.9)' }}>Carbs</p>
                              <p className="font-rum-raisin text-3xl sm:text-4xl text-white tracking-wide" style={{ textShadow: '0px 2px 8px rgba(0,0,0,0.9), 0px 1px 3px rgba(0,0,0,0.8)' }}>{nutrition.carbs}</p>
                          </div>
                          <div className="text-center">
                              <p className="text-[10px] sm:text-xs uppercase tracking-widest font-bold text-amber-400 mb-1" style={{ textShadow: '0px 1px 4px rgba(0,0,0,0.9)' }}>Fat</p>
                              <p className="font-rum-raisin text-3xl sm:text-4xl text-white tracking-wide" style={{ textShadow: '0px 2px 8px rgba(0,0,0,0.9), 0px 1px 3px rgba(0,0,0,0.8)' }}>{nutrition.fat}</p>
                          </div>
                    </div>
                 )}
             </div>
          )}

          {/* Custom hidden AR button to prevent generic overlapping but retain functionality */}
          <button slot="ar-button" style={{display: 'none'}} />
        </>
      )}
    </div>
  );
}
