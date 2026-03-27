"use client";

import { useViewerNavigation } from "../hooks/useViewerNavigation";
import { ViewerHeader } from "./ViewerHeader";
import { ViewerGrid } from "./ViewerGrid";
import { ViewerLightbox } from "./ViewerLightbox";

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
  // El hook sigue gestionando la lógica de navegación (teclas, índices)
  const { selectedIndex, setSelectedIndex, showNext, showPrev } = useViewerNavigation(pages);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background w-screen h-screen overflow-hidden">
      {/* 1. Cabecera Aislada */}
      <ViewerHeader title={title} onClose={onClose} />

      {/* 2. Grid de Miniaturas Aislado */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-background custom-scrollbar">
        <ViewerGrid
          pages={pages}
          galleryTitle={title}
          isLoading={isLoading}
          onSelectImage={setSelectedIndex}
        />
      </div>

      {/* 3. Lightbox de Pantalla Completa Aislado */}
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
