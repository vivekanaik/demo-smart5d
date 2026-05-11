/* eslint-disable react-hooks/set-state-in-effect */
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
  scale?: string; // e.g. "0.5 0.5 0.5"
}

export default function ModelViewer({ src, alt, poster, id, ingredients, nutrition, showInteractiveUI, scale = "0.5 0.5 0.5" }: ModelViewerProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [shouldLoadModel, setShouldLoadModel] = useState(false);
  const [isArActive, setIsArActive] = useState(false);
  const [activeTab, setActiveTab] = useState<'ingredients' | 'nutrition' | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const viewerRef = useRef<any>(null);

  useEffect(() => {
    import('@google/model-viewer').then(() => {
      setIsMounted(true);
    }).catch(console.error);
  }, []);

  useEffect(() => {
    if (showInteractiveUI) {
      setShouldLoadModel(true);
      return;
    }

    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setShouldLoadModel(true);
          } else {
            // Unmount when off-screen to free up WebGL contexts
            setShouldLoadModel(false);
          }
        });
      },
      { rootMargin: "200px" }
    );

    observer.observe(container);
    return () => observer.disconnect();
  }, [showInteractiveUI]);

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

  if (!isMounted || !shouldLoadModel) {
    return (
      <div ref={containerRef} className="w-full h-full bg-black/5 dark:bg-white/5 overflow-hidden relative flex items-center justify-center">
        {poster ? (
          <img
            src={poster}
            alt={alt}
            loading="lazy"
            decoding="async"
            className="absolute inset-0 w-full h-full object-contain object-center opacity-100 transition-opacity"
          />
        ) : (
          <span className="text-[10px] font-semibold tracking-widest uppercase text-black/50 dark:text-white/50 animate-pulse text-center">
            {alt} 3D<br/>Loading...
          </span>
        )}
      </div>
    );
  }

  return (
    <div ref={containerRef} className="w-full h-full overflow-hidden relative group">
      {React.createElement(
        'model-viewer',
        {
          ref: viewerRef,
          id,
          src,
          alt,
          poster,
          'camera-controls': true,
          'auto-rotate': true,
          'interaction-prompt': 'none',
          loading: 'eager',
          ar: true,
          'ar-modes': 'webxr scene-viewer quick-look',
          'ar-placement': 'floor',
          'ar-scale': 'fixed',
          'camera-orbit': '0deg 75deg auto',
          scale: scale,
          reveal: 'auto',
          className: "w-full h-full bg-transparent outline-none",
          style: { width: '100%', height: '100%', backgroundColor: 'transparent' }
        },
        <>
          <div slot="poster" className="absolute inset-0 flex flex-col items-center justify-center bg-black/5 dark:bg-white/5">
            {poster ? (
              <img
                src={poster}
                alt={alt}
                loading="lazy"
                decoding="async"
                className="absolute inset-0 w-full h-full object-contain object-center"
              />
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
             <div className="absolute inset-0 z-[60] pointer-events-none">
                 
                 {/* Buttons - Bottom fixed on Mobile, Top centered on Desktop */}
                 <div className="absolute bottom-10 md:top-6 md:bottom-auto left-0 w-full flex justify-center gap-3 pointer-events-none">
                    {ingredients && (
                      <button 
                         onClick={(e) => {
                             e.preventDefault();
                             setActiveTab(activeTab === 'ingredients' ? null : 'ingredients')
                         }}
                         onPointerDownCapture={(e) => e.stopPropagation()}
                         onTouchStartCapture={(e) => e.stopPropagation()}
                         className={`px-6 py-3 md:px-4 md:py-2 rounded-full backdrop-blur-md shadow-lg text-xs uppercase tracking-widest font-bold transition-all duration-300 border pointer-events-auto ${activeTab === 'ingredients' ? 'bg-white/30 border-white text-white drop-shadow-md' : 'bg-black/40 border-white/20 text-white/90 hover:bg-black/60'}`}
                      >
                         Ingredients
                      </button>
                    )}
                    {nutrition && (
                      <button 
                         onClick={(e) => {
                             e.preventDefault();
                             setActiveTab(activeTab === 'nutrition' ? null : 'nutrition')
                         }}
                         onPointerDownCapture={(e) => e.stopPropagation()}
                         onTouchStartCapture={(e) => e.stopPropagation()}
                         className={`px-6 py-3 md:px-4 md:py-2 rounded-full backdrop-blur-md shadow-lg text-xs uppercase tracking-widest font-bold transition-all duration-300 border pointer-events-auto ${activeTab === 'nutrition' ? 'bg-white/30 border-white text-white drop-shadow-md' : 'bg-black/40 border-white/20 text-white/90 hover:bg-black/60'}`}
                      >
                         Nutrition
                      </button>
                    )}
                 </div>

                 {/* Floating Plain Text Panels */}
                 {activeTab === 'ingredients' && ingredients && (
                    <div className="absolute top-16 md:top-24 left-0 w-full px-4 sm:px-10 flex justify-between items-start pointer-events-none animate-in fade-in duration-500">
                       <ul className="flex flex-col gap-y-10 w-[42%]">
                          {ingredients.slice(0, Math.ceil(ingredients.length / 2)).map((ing, idx) => (
                             <li key={idx} className="text-xl sm:text-2xl font-rum-raisin text-white tracking-wide text-left pointer-events-auto leading-snug drop-shadow-2xl" style={{ textShadow: '0px 2px 14px rgba(0,0,0,0.95), 0px 1px 4px rgba(0,0,0,0.9)' }}>
                                {ing}
                             </li>
                          ))}
                       </ul>
                       <ul className="flex flex-col gap-y-10 w-[42%] items-end">
                          {ingredients.slice(Math.ceil(ingredients.length / 2)).map((ing, idx) => (
                             <li key={idx} className="text-xl sm:text-2xl font-rum-raisin text-white tracking-wide text-right pointer-events-auto leading-snug drop-shadow-2xl" style={{ textShadow: '0px 2px 14px rgba(0,0,0,0.95), 0px 1px 4px rgba(0,0,0,0.9)' }}>
                                {ing}
                             </li>
                          ))}
                       </ul>
                    </div>
                 )}

                 {activeTab === 'nutrition' && nutrition && (
                    <div className="absolute top-24 left-0 w-full flex flex-wrap justify-center gap-6 sm:gap-14 pointer-events-auto animate-in fade-in duration-500">
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

          {/* Explicit Custom WebXR Close Button to prevent invisible native buttons */}
          <button 
            slot="exit-webxr-ar-button" 
            className="absolute top-6 right-6 z-[120] w-12 h-12 flex items-center justify-center rounded-full bg-black/40 backdrop-blur-md border border-white/30 text-white pointer-events-auto hover:bg-black/60 shadow-lg cursor-pointer"
            style={{ display: 'flex', pointerEvents: 'auto' }}
          >
             <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
        </>
      )}
    </div>
  );
}
