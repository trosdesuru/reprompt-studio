// frontend/features/image-viewer/ImageViewerModal/ImageViewerModal.tsx
"use client";

import { useEffect } from "react";
import { useViewerNavigation } from "@/features/image-viewer/hooks/useViewerNavigation";
import { ViewerGrid } from "./components/ViewerGrid";
import { ViewerLightbox } from "./components/ViewerLightbox";
import { ImageViewerModalProps } from "./ImageViewerModal.types";
import { Button } from "@/src/components/ui/Button";

export function ImageViewerModal({ title, pages, isLoading, onClose }: ImageViewerModalProps) {
  const { selectedIndex, setSelectedIndex, showNext, showPrev } = useViewerNavigation(pages);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background/95 backdrop-blur-md w-screen h-screen overflow-hidden">
      {/* Header integrado del visor */}
      <div className="flex justify-between items-center p-4 border-b-2 border-primary bg-background">
        <h2 className="text-xl font-black font-mono truncate uppercase tracking-tighter">
          {title}
        </h2>
        <Button onClick={onClose} variant="danger" size="sm">
          Cerrar ✖
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
        <ViewerGrid
          pages={pages}
          galleryTitle={title}
          isLoading={isLoading}
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
