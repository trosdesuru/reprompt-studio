"use client";

import { useEffect } from "react";

import { useViewerNavigation } from "@/features/image-viewer/hooks/useViewerNavigation";
import { Header } from "@/src/components/layout/Header";
import { ViewerGrid } from "./components/ViewerGrid";
import { ViewerLightbox } from "./components/ViewerLightbox";
import { ImageViewerModalProps } from "./ImageViewerModal.types";

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
    // Congelamos el scroll del body
    document.body.style.overflow = "hidden";
    // Al desmontarse (cerrar el modal), lo liberamos
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  return (
    // 🟢 Restauramos el fondo claro y quitamos el blur de la V2
    <div className="fixed inset-0 z-50 flex flex-col bg-background w-screen h-screen overflow-hidden animate-fade-in">
      {/* Header restaurado */}
      <Header variant="viewer" title={title} onCloseViewer={onClose} />

      {/* Grid de miniaturas restaurado */}
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
