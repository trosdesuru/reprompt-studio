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

  // 🟢 LOG DE RENDERIZADO
  useEffect(() => {
    console.log("🎨 [QA DEBUG - CAPA 3] RENDER DEL GRID.");
    console.log("➡️ isLoading:", isLoading, "| Total páginas:", pages?.length);

    if (pages && pages.length > 0) {
      // Extraemos solo las URLs de las primeras 5 miniaturas para compararlas
      const urls = pages.slice(0, 5).map((p) => p.thumb_url);

      console.log("🔍 [QA DEBUG - SPRITE CHECK] Comprobando URLs de miniaturas:");
      urls.forEach((url, i) => console.log(`   Thumb ${i + 1}: ${url}`));

      // Comprobación matemática de duplicados
      const sonTodasIguales = urls.every((val) => val === urls[0]);
      if (sonTodasIguales) {
        console.warn("⚠️ [QA ALERTA] ¡DETECTADO CSS SPRITE! Todas las URLs son idénticas.");
      } else {
        console.log("✅ [QA OK] Las URLs de las miniaturas son diferentes.");
      }
    }
  }, [isLoading, pages]);

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

  if (isLoading && (!pages || pages.length === 0)) {
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
      {pages &&
        pages.map((item, i) => (
          <ImageCard
            key={`img-card-${i}`}
            item={item}
            index={i + 1}
            galleryTitle={galleryTitle}
            onOpenImage={() => onSelectImage(i)}
          />
        ))}

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

      {!isLoading && (!pages || pages.length === 0) && (
        <div className="col-span-full text-center p-8 font-mono text-white text-lg">
          No se encontraron páginas en esta galería.
        </div>
      )}
    </div>
  );
}
