import { useState, useEffect } from "react";
import { IconX, IconGridDots, IconMaximize } from "@tabler/icons-react";
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
  const [viewMode, setViewMode] = useState<"grid" | "lightbox">("lightbox");
  const { selectedIndex, setSelectedIndex, showNext, showPrev } = useViewerNavigation(pages);
  const currentIndex = selectedIndex ?? 0;

  useEffect(() => {
    if (viewMode === "lightbox" && hasMorePages && !isLoadingMore && onLoadMore) {
      if (currentIndex >= pages.length - 3) {
        onLoadMore();
      }
    }
  }, [currentIndex, pages.length, hasMorePages, isLoadingMore, onLoadMore, viewMode]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

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
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/95 backdrop-blur-md animate-fade-in">
      {/* HEADER */}
      <div className="absolute top-0 left-0 w-full p-4 flex justify-between items-center bg-linear-to-b from-black/80 to-transparent z-10">
        <div className="flex-1 min-w-0 pr-4">
          <h2 className="text-white font-mono font-black truncate drop-shadow-md text-sm md:text-base">
            {title}
          </h2>
          <p className="text-(--text-secondary) font-mono text-xs mt-1">
            {pages.length} imágenes cargadas {hasMorePages && "(Cargando más...)"}
          </p>
        </div>
        <div className="flex items-center gap-2 md:gap-4 shrink-0">
          <button
            onClick={() => setViewMode(viewMode === "grid" ? "lightbox" : "grid")}
            className="p-2 text-white hover:text-(--accent-color) transition-colors bg-black/50 neo-border"
          >
            {viewMode === "grid" ? <IconMaximize size={20} /> : <IconGridDots size={20} />}
          </button>
          <button
            onClick={onClose}
            className="p-2 text-white bg-red-500/80 hover:bg-red-500 neo-border transition-colors"
          >
            <IconX size={20} />
          </button>
        </div>
      </div>

      {/* CONTENIDO PRINCIPAL */}
      <div
        className="w-full h-full pt-20 pb-4 px-4 flex justify-center items-center"
        onClick={handleBackdropClick}
      >
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
            onClose={onClose}
          />
        )}
      </div>
    </div>
  );
}
