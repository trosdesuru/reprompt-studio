// frontend/features/image-viewer/ImageViewerModal/ImageViewerModal.tsx
"use client";

import { useEffect } from "react";
import { useViewerNavigation } from "@/src/features/image-viewer/hooks/useViewerNavigation";
import { ViewerGrid } from "./components/ViewerGrid";
import { ViewerLightbox } from "./components/ViewerLightbox";
import { ImageViewerModalProps } from "./ImageViewerModal.types";
import { Button } from "@/src/system/atoms/Button";

export function ImageViewerModal({
  title,
  pages,
  isLoading,
  isLoadingMore,
  hasMorePages,
  onLoadMore,
  onClose,
}: ImageViewerModalProps) {
  const { selectedIndex, setSelectedIndex, showNext, showPrev } = useViewerNavigation(pages);

  // 🟢 ÚNICO PUNTO DE BLOQUEO DE SCROLL
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 w-screen h-screen overflow-hidden animate-fade-in">
      {/* 🟢 GPU FIX: Capa de desenfoque estática (se renderiza solo 1 vez) */}
      <div
        className="absolute inset-0 bg-black/85 backdrop-blur-md pointer-events-none"
        aria-hidden="true"
      />

      {/* 🟢 Capa de contenido (flota sobre el blur, desplazarse aquí es gratis para la GPU) */}
      <div className="relative z-10 flex flex-col h-full">
        {/* Header del visor */}
        <div className="flex justify-between items-center p-4 border-b-2 border-(--accent-color) bg-black/40">
          <h2 className="text-xl md:text-2xl font-black font-mono truncate uppercase tracking-tighter text-white drop-shadow-lg">
            {title}
          </h2>
          <Button onClick={onClose} variant="danger" size="sm" className="shadow-none">
            Cerrar ✖
          </Button>
        </div>

        {/* Área de Scroll */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
          <ViewerGrid
            pages={pages}
            galleryTitle={title}
            isLoading={isLoading}
            isLoadingMore={isLoadingMore}
            hasMorePages={hasMorePages}
            onLoadMore={onLoadMore}
            onSelectImage={setSelectedIndex}
          />
        </div>
      </div>

      {selectedIndex !== null && (
        <ViewerLightbox
          pages={pages}
          selectedIndex={selectedIndex}
          onClose={() => setSelectedIndex(null)}
          onNext={showNext}
          onPrev={showPrev}
        />
      )}
    </div>
  );
}
