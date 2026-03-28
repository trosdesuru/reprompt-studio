// frontend/features/image-viewer/ImageViewerModal/components/ViewerGrid.tsx
import { useEffect, useRef } from "react";
import { ImageCard } from "../../ImageCard";
import { ViewerPageItem } from "@/src/types/gallery";
import { Skeleton } from "@/src/components/ui/Skeleton"; // 🟢 Importamos el Skeleton Global

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

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) onLoadMore();
      },
      { rootMargin: "300px" },
    );

    if (observerRef.current) observer.observe(observerRef.current);
    return () => observer.disconnect();
  }, [hasMorePages, onLoadMore, isLoadingMore]);

  // 🟢 ESTADO DE CARGA INICIAL: Grid de Skeletons limpios
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
          key={i}
          item={item}
          index={i + 1}
          galleryTitle={galleryTitle}
          onOpenImage={() => onSelectImage(i)}
        />
      ))}

      {/* 🟢 ESTADO DE CARGA INFINITA: Skeletons en la parte inferior */}
      {hasMorePages && (
        <div
          ref={observerRef}
          className="col-span-full grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 mt-6"
        >
          {isLoadingMore &&
            Array.from({ length: 5 }).map((_, i) => (
              <div key={`more-skeleton-${i}`} className="flex flex-col gap-3">
                <Skeleton className="h-56 w-full" />
              </div>
            ))}
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
