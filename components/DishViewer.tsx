/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useEffect, useRef, useState } from "react";
import { X, Box, Scan } from "lucide-react";

interface DishViewerProps {
  item: {
    id: number;
    name: string;
    price: string;
    modelUrl: string;
    posterUrl?: string;
    ingredients?: string[];
    nutrition?: { calories: string; protein: string; carbs: string; fat: string };
  };
  resolveModelUrl: (url: string) => string;
  onClose: () => void;
  quantity: number;
  updateQuantity: (id: number, delta: number) => void;
}

type Panel = "ingredients" | "nutrition" | null;

export default function DishViewer({ item, resolveModelUrl, onClose, quantity, updateQuantity }: DishViewerProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [modelLoaded, setModelLoaded] = useState(false);
  const [activePanel, setActivePanel] = useState<Panel>(null);
  const viewerRef = useRef<any>(null);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  // Load model-viewer script once
  useEffect(() => {
    import("@google/model-viewer")
      .then(() => setIsMounted(true))
      .catch(console.error);
  }, []);

  // Listen for the native 'load' event from model-viewer
  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer) return;

    const handleLoad = () => {
      setModelLoaded(true);
    };

    viewer.addEventListener("load", handleLoad);
    return () => {
      viewer.removeEventListener("load", handleLoad);
    };
  }, [isMounted]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const triggerAR = () => {
    const el = viewerRef.current;
    if (el && typeof el.activateAR === "function") {
      el.activateAR();
    }
  };

  const togglePanel = (p: Panel) => setActivePanel(prev => prev === p ? null : p);

  const modelSrc = resolveModelUrl(item.modelUrl);

  return (
    <div
      className="fixed inset-0 z-[9999] bg-black flex flex-col overflow-hidden"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* ── Wall text: name (behind model, opacity 40, Anton font) ── */}
      <div className="absolute inset-x-0 top-0 flex flex-col items-center justify-start pointer-events-none select-none z-0 px-4 pt-12 md:pt-20">
        <p
          className="text-white/40 text-center leading-none tracking-wider uppercase"
          style={{
            fontFamily: "var(--font-anton)",
            fontSize: "clamp(2.5rem, 10vw, 8rem)",
            lineHeight: 0.9,
          }}
        >
          {item.name}
        </p>
      </div>

      {/* ── Close button ── */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-50 w-11 h-11 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white transition-colors"
        aria-label="Close"
      >
        <X className="w-5 h-5" />
      </button>

      {/* ── 3D Model (center, full height flex container) ── */}
      <div className="relative flex-1 flex items-center justify-center z-10">
        {/* 5D Custom Spinner + Image */}
        {!modelLoaded && (
          <div className="absolute inset-0 flex flex-col items-center justify-center z-20">
            {item.posterUrl && (
              <img 
                src={item.posterUrl} 
                alt={item.name}
                className="max-h-[35vh] max-w-[60vw] object-contain opacity-60 mb-8"
              />
            )}
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 border-2 border-white/10 border-t-gold rounded-full animate-spin"></div>
              <span className="text-[10px] tracking-[0.3em] text-gold/80 uppercase font-bold animate-pulse">
                5D Loading
              </span>
            </div>
          </div>
        )}

        {isMounted && (
          React.createElement("model-viewer", {
            ref: viewerRef,
            src: modelSrc,
            alt: item.name,
            "camera-controls": true,
            "auto-rotate": true,
            "rotation-per-second": "4deg",
            "interaction-prompt": "none",
            loading: "eager",
            ar: true,
            "ar-modes": "webxr scene-viewer quick-look",
            "ar-placement": "floor",
            "ar-scale": "fixed",
            "camera-orbit": "0deg 75deg auto",
            reveal: "auto",
            onLoad: () => setModelLoaded(true),
            className: `w-full h-full transition-opacity duration-1000 ${modelLoaded ? 'opacity-100' : 'opacity-0'}`,
            style: {
              width: "100%",
              height: "min(70vw, 60vh)",
              backgroundColor: "transparent",
              "--poster-color": "transparent",
              "--progress-bar-height": "0px",
              "--progress-bar-color": "transparent",
            },
          })
        )}
      </div>

      {/* ── Bottom action bar (Absolute to allow model to center in viewport) ── */}
      <div className="absolute inset-x-0 bottom-0 z-20 pb-10 pt-4 px-4 flex flex-col items-center gap-4 pointer-events-none">
        {/* Info panels (Needs pointer events) */}
        <div
          className={`w-full max-w-lg transition-all duration-500 overflow-hidden pointer-events-auto ${
            activePanel ? "max-h-64 opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          {activePanel === "ingredients" && item.ingredients && (
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 backdrop-blur-md">
              <p className="text-[9px] uppercase tracking-[0.3em] text-white/50 mb-3 font-bold">Ingredients</p>
              <div className="flex flex-wrap gap-2">
                {item.ingredients.map((ing, i) => (
                  <span key={i} className="text-xs text-white/80 bg-white/10 border border-white/10 px-3 py-1 rounded-full">
                    {ing}
                  </span>
                ))}
              </div>
            </div>
          )}
          {activePanel === "nutrition" && item.nutrition && (
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 backdrop-blur-md">
              <p className="text-[9px] uppercase tracking-[0.3em] text-white/50 mb-3 font-bold">Nutrition</p>
              <div className="grid grid-cols-4 gap-3">
                {[
                  { label: "Calories", value: item.nutrition.calories },
                  { label: "Protein", value: item.nutrition.protein },
                  { label: "Carbs", value: item.nutrition.carbs },
                  { label: "Fat", value: item.nutrition.fat },
                ].map((n) => (
                  <div key={n.label} className="flex flex-col items-center">
                    <span className="text-[9px] uppercase tracking-wider text-amber-400/80 mb-1">{n.label}</span>
                    <span className="text-base font-bold text-white">{n.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Price | Add to Cart Row */}
        <div className="flex items-center gap-6 mb-8 pointer-events-auto">
           <span 
             className="text-2xl md:text-6xl text-gold tracking-wider opacity-60"
             style={{ fontFamily: "var(--font-anton)" }}
           >
             {item.price}
           </span>
           <div className="h-8 md:h-12 w-[1px] bg-white/20"></div>
           <button 
             onClick={(e) => {
               e.stopPropagation();
               updateQuantity(item.id, 1);
             }}
             className="text-base md:text-4xl uppercase tracking-[0.2em] opacity-60 text-white hover:text-gold transition-colors cursor-pointer"
             style={{ fontFamily: "var(--font-anton)" }}
           >
              {quantity > 0 ? `ADD MORE (${quantity})` : 'ADD TO CART'}
           </button>
        </div>

        {/* Buttons row */}
        <div className="flex items-center gap-3 flex-wrap justify-center pointer-events-auto">
          {item.ingredients && (
            <button
              onClick={() => togglePanel("ingredients")}
              className={`px-5 py-2.5 rounded-full text-xs uppercase tracking-widest font-bold border transition-all duration-300 ${
                activePanel === "ingredients"
                  ? "bg-white/20 border-white text-white"
                  : "bg-white/5 border-white/20 text-white/70 hover:bg-white/10 hover:border-white/40"
              }`}
            >
              Ingredients
            </button>
          )}
          {item.nutrition && (
            <button
              onClick={() => togglePanel("nutrition")}
              className={`px-5 py-2.5 rounded-full text-xs uppercase tracking-widest font-bold border transition-all duration-300 ${
                activePanel === "nutrition"
                  ? "bg-white/20 border-white text-white"
                  : "bg-white/5 border-white/20 text-white/70 hover:bg-white/10 hover:border-white/40"
              }`}
            >
              Nutrition
            </button>
          )}
          <button
            onClick={triggerAR}
            className="flex items-center gap-2 px-6 py-2.5 rounded-full text-xs uppercase tracking-widest font-bold bg-amber-500 hover:bg-amber-400 text-black transition-all duration-300 shadow-lg shadow-amber-500/20"
          >
            <Scan className="w-4 h-4" />
            View in AR
          </button>
        </div>
      </div>
    </div>
  );
}
