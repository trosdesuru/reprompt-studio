import { useState, useEffect } from "react";
import { IconX } from "@tabler/icons-react";
import { useViewerNavigation } from "@/src/features/image-viewer/hooks/useViewerNavigation";
import { ViewerGrid } from "./components/ViewerGrid";
import { ViewerLightbox } from "./components/ViewerLightbox";

interface Props {
  title: string;
  pages: any[];
  isLoading: boolean;
  isLoadingMore: boolean;
  hasMorePages: boolean;
  onLoadMore: () => void;
  onClose: () => void;
}

export function ImageViewerModal({
  title,
  pages,
  isLoading,
  isLoadingMore,
  hasMorePages,
  onLoadMore,
  onClose,
}: Props) {
  // 🟢 Programación Defensiva: Siempre iniciamos en la cuadrícula
  const [viewMode, setViewMode] = useState<"grid" | "lightbox">("grid");

  const { selectedIndex, setSelectedIndex, showNext, showPrev } = useViewerNavigation(pages);
  const currentIndex = selectedIndex ?? 0;

  // 🟢 Pre-fetch inteligente (Solo actúa si estamos viendo fotos individuales)
  useEffect(() => {
    if (viewMode === "lightbox" && hasMorePages && !isLoadingMore && onLoadMore) {
      if (currentIndex >= pages.length - 3) onLoadMore();
    }
  }, [currentIndex, pages.length, hasMorePages, isLoadingMore, onLoadMore, viewMode]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  // Pantalla de carga inicial segura
  if (isLoading && pages.length === 0) {
    return (
      <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center">
        <div className="text-(--accent-color) animate-pulse font-mono flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-current border-t-transparent animate-spin" />
          <p>Decodificando galería...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-md animate-fade-in">
      {/* HEADER LIMPIO */}
      <div className="absolute top-0 left-0 w-full p-4 flex justify-between items-center bg-linear-to-b from-black/80 to-transparent z-10 pointer-events-none">
        <div className="flex-1 min-w-0 pr-4 pointer-events-auto">
          <h2 className="text-white font-mono font-black truncate drop-shadow-md text-sm md:text-base">
            {title}
          </h2>
          <p className="text-(--text-secondary) font-mono text-xs mt-1">
            {pages.length} imágenes listadas {hasMorePages && "(Buscando más...)"}
          </p>
        </div>
        <div className="flex items-center gap-2 md:gap-4 shrink-0 pointer-events-auto">
          {/* 🟢 Botón único de Cerrar Galería */}
          <button
            onClick={onClose}
            className="p-2 text-white bg-red-500/80 hover:bg-red-500 neo-border transition-colors"
            title="Cerrar Galería"
          >
            <IconX size={20} />
          </button>
        </div>
      </div>

      {/* CONTENIDO PRINCIPAL */}
      <div className="w-full h-full pt-20 pb-4 px-4 flex justify-center items-center" onClick={handleBackdropClick}>
        {viewMode === "grid" ? (
          <ViewerGrid
            pages={pages}
            currentIndex={currentIndex}
            onSelect={(idx) => {
              setSelectedIndex(idx);
              setViewMode("lightbox");
            }}
            hasMorePages={hasMorePages}
            isLoadingMore={isLoadingMore}
            onLoadMore={onLoadMore}
          />
        ) : (
          <ViewerLightbox
            pages={pages}
            selectedIndex={currentIndex}
            onNext={showNext}
            onPrev={showPrev}
            // 🟢 CRÍTICO: El botón 'cerrar' de la imagen individual ahora te devuelve a la cuadrícula
            onClose={() => setViewMode("grid")}
          />
        )}
      </div>
    </div>
  );
}
