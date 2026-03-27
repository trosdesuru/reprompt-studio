"use client";

import { useEffect } from "react";
import { useViewerNavigation } from "@/features/image-viewer/hooks/useViewerNavigation";
import { ViewerHeader } from "./components/ViewerHeader";
import { ViewerGrid } from "./components/ViewerGrid";
import { ViewerLightbox } from "./components/ViewerLightbox";
import { ImageViewerModalProps } from "./ImageViewerModal.types";

export function ImageViewerModal({ title, pages, isLoading, onClose }: ImageViewerModalProps) {
  const { selectedIndex, setSelectedIndex, showNext, showPrev } = useViewerNavigation(pages);

  // 🟢 MAGIA UX: Bloqueamos el scroll de la página de fondo al abrir el modal
  useEffect(() => {
    // Al montarse, congelamos el body
    document.body.style.overflow = "hidden";

    // Al desmontarse (cerrar el modal), lo liberamos
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  return (
    // 🟢 MAGIA UI: Fondo negro al 95% de opacidad con desenfoque (blur)
    <div className="fixed inset-0 z-50 flex flex-col bg-black/95 backdrop-blur-md w-screen h-screen overflow-hidden animate-fade-in">
      {/* Cabecera adaptada al modo oscuro inmersivo */}
      <ViewerHeader title={title} onClose={onClose} />

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
