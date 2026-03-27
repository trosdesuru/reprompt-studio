// frontend/src/components/ImageViewerModal.tsx
"use client";

import { useState } from "react";
import ImageCard from "./ImageCard";

interface ImageViewerModalProps {
  title: string;
  pages: string[];
  isLoading: boolean;
  onClose: () => void;
}

export default function ImageViewerModal({
  title,
  pages,
  isLoading,
  onClose,
}: ImageViewerModalProps) {
  const [fullScreenImage, setFullScreenImage] = useState<string | null>(null);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-gray-900/95 backdrop-blur-sm overflow-y-auto p-4 sm:p-8">
      
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6 sticky top-0 z-30 bg-gray-900/90 p-4 rounded-lg shadow-lg border border-gray-700">
        <h2 className="text-xl font-bold text-blue-400 truncate w-2/3">
          {title}
        </h2>
        <button
          onClick={onClose}
          className="bg-red-600 hover:bg-red-500 text-white font-bold px-6 py-2 rounded-full shadow-lg transition-colors"
        >
          Close ✖
        </button>
      </div>

      {/* LOADING SPINNER */}
      {isLoading ? (
        <div className="flex items-center justify-center grow">
          <p className="text-blue-400 text-2xl animate-pulse">
            Fetching reading links...
          </p>
        </div>
      ) : (
        /* 🟢 EL GRID AHORA ES RELATIVE Z-10 PARA RECIBIR CLICS */
        <div className="relative z-10 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 max-w-7xl mx-auto w-full pb-20">
          {pages.map((pageUrl, i) => (
            <ImageCard
              key={i}
              pageUrl={pageUrl}
              index={i + 1}
              galleryTitle={title}
              onOpenImage={(imgUrl) => {
                console.log("📥 Modal received open command for:", imgUrl);
                setFullScreenImage(imgUrl);
              }} 
            />
          ))}
          {pages.length === 0 && (
            <p className="col-span-full text-center">No pages found.</p>
          )}
        </div>
      )}

      {/* ⬛ FULLSCREEN LIGHTBOX ⬛ */}
      {fullScreenImage && (
        <div 
          className="fixed inset-0 z-9999 bg-black/95 flex items-center justify-center p-4 cursor-zoom-out"
          onClick={() => setFullScreenImage(null)} 
        >
          <img 
            src={fullScreenImage} 
            referrerPolicy="no-referrer"
            className="max-w-full max-h-full object-contain drop-shadow-2xl"
            alt="Full Screen"
          />
          <button 
            className="absolute top-6 right-6 text-white bg-gray-800 hover:bg-red-600 rounded-full w-12 h-12 flex items-center justify-center font-bold text-2xl transition-colors border border-gray-600"
            onClick={(e) => { 
              e.stopPropagation(); 
              setFullScreenImage(null); 
            }}
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}