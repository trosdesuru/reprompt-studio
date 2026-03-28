// frontend/features/image-viewer/ImageViewerModal/ImageViewerModal.tsx
"use client";

import { useEffect } from "react";
import { useViewerNavigation } from "@/features/image-viewer/hooks/useViewerNavigation";
import { ViewerGrid } from "./components/ViewerGrid";
import { ViewerLightbox } from "./components/ViewerLightbox";
import { ImageViewerModalProps } from "./ImageViewerModal.types";
import { Button } from "@/src/components/ui/Button";

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

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  return (
    // 🟢 Aplicado bg-black/85 (85% de opacidad) y backdrop-blur-md
    <div className="fixed inset-0 z-50 flex flex-col bg-black/85 backdrop-blur-md w-screen h-screen overflow-hidden animate-fade-in">
      {/* 🟢 Header del visor en modo oscuro para contrastar con el blur */}
      <div className="flex justify-between items-center p-4 border-b-2 border-(--accent-color) bg-black/40">
        <h2 className="text-xl md:text-2xl font-black font-mono truncate uppercase tracking-tighter text-white drop-shadow-lg">
          {title}
        </h2>
        <Button onClick={onClose} variant="danger" size="sm" className="shadow-none">
          Cerrar ✖
        </Button>
      </div>

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
