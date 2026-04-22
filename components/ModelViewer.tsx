"use client";

import React, { useEffect, useState } from 'react';

interface ModelViewerProps {
  src: string;
  alt: string;
  poster?: string;
  id?: string;
}

export default function ModelViewer({ src, alt, poster, id }: ModelViewerProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    import('@google/model-viewer').then(() => {
      setIsMounted(true);
    }).catch(console.error);
  }, []);

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
          {/* Custom hidden AR button to prevent generic overlapping but retain functionality */}
          <button slot="ar-button" style={{display: 'none'}} />
        </>
      )}
    </div>
  );
}
