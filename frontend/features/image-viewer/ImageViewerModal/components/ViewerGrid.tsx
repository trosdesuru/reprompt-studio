// frontend/features/image-viewer/ImageViewerModal/components/ViewerGrid.tsx
import { useEffect, useRef } from "react";
import { ImageCard } from "../../ImageCard";
import { ViewerPageItem } from "@/src/types/gallery";
import { Skeleton } from "@/src/components/ui/Skeleton";

interface ViewerGridProps {
  pages: ViewerPageItem[];
  galleryTitle: string;
  isLoading: boolean;
  isLoadingMore?: boolean;
  hasMorePages?: boolean;
  onLoadMore?: () => void;
  onSelectImage: (index: number) => void;
}

export function ViewerGrid({
  pages,
  galleryTitle,
  isLoading,
  isLoadingMore,
  hasMorePages,
  onLoadMore,
  onSelectImage,
}: ViewerGridProps) {
  const observerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!hasMorePages || !onLoadMore || isLoadingMore) return;

    // Aumentamos el rootMargin a 600px para que empiece a cargar mucho antes de llegar al final
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) onLoadMore();
      },
      { rootMargin: "600px" },
    );

    if (observerRef.current) observer.observe(observerRef.current);
    return () => observer.disconnect();
  }, [hasMorePages, onLoadMore, isLoadingMore]);

  if (isLoading && pages.length === 0) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 max-w-7xl mx-auto w-full pb-20">
        {Array.from({ length: 15 }).map((_, i) => (
          <div key={`skeleton-${i}`} className="flex flex-col gap-3">
            <Skeleton className="h-56 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="relative z-10 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 max-w-7xl mx-auto w-full pb-20">
      {pages.map((item, i) => (
        <ImageCard
          key={`img-${i}`}
          item={item}
          index={i + 1}
          galleryTitle={galleryTitle}
          onOpenImage={() => onSelectImage(i)}
        />
      ))}

      {/* 🟢 FIX CRÍTICO: El Centinela ahora tiene min-h-[100px] siempre */}
      {hasMorePages && (
        <div
          ref={observerRef}
          className="col-span-full w-full min-h-100px flex items-center justify-center mt-8 border-t-2 border-dashed border-gray-700/50"
        >
          {isLoadingMore ? (
            <div className="flex flex-col items-center gap-3">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-(--accent-color)"></div>
              <span className="font-mono text-xs text-white uppercase tracking-widest opacity-70">
                Extrayendo más imágenes...
              </span>
            </div>
          ) : (
            // Esto asegura que el div exista para el observer aunque no estemos cargando
            <div className="w-full h-full"></div>
          )}
        </div>
      )}

      {!isLoading && pages.length === 0 && (
        <div className="col-span-full text-center p-8 font-mono text-white text-lg">
          No se encontraron páginas en esta galería.
        </div>
      )}
    </div>
  );
}
