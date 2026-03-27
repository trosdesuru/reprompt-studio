// frontend/features/image-viewer/components/ViewerLightbox.tsx
"use client";

import { FullImageResolver } from "./FullImageResolver";
import { ViewerPageItem } from "@/src/types/gallery";

interface ViewerLightboxProps {
  pages: ViewerPageItem[];
  selectedIndex: number;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
}

export function ViewerLightbox({
  pages,
  selectedIndex,
  onClose,
  onNext,
  onPrev,
}: ViewerLightboxProps) {
  return (
    <div
      className="fixed inset-0 z-100 bg-black/95 flex items-center justify-center backdrop-blur-sm"
      onClick={onClose}
    >
      <div className="relative w-full h-full flex items-center justify-center p-4 md:p-12">
        {/* Botón Anterior */}
        {selectedIndex > 0 && (
          <button
            className="absolute left-4 md:left-8 z-120 p-4 bg-(--bg-secondary) neo-border neo-shadow text-foreground hover:neo-shadow-accent transition-all"
            onClick={(e) => {
              e.stopPropagation();
              onPrev();
            }}
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={3}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
        )}

        {/* Resolvemos la imagen Full HD */}
        <FullImageResolver pageUrl={pages[selectedIndex].page_url} index={selectedIndex + 1} />

        {/* Botón Siguiente */}
        {selectedIndex < pages.length - 1 && (
          <button
            className="absolute right-4 md:right-8 z-120 p-4 bg-(--bg-secondary) neo-border neo-shadow text-foreground hover:neo-shadow-accent transition-all"
            onClick={(e) => {
              e.stopPropagation();
              onNext();
            }}
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}

        {/* Botón Cerrar Lightbox */}
        <button
          className="absolute top-6 right-6 z-120 text-white bg-red-600 neo-border neo-shadow hover:bg-red-500 w-12 h-12 flex items-center justify-center font-bold text-xl"
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
        >
          ✕
        </button>
      </div>
    </div>
  );
}
