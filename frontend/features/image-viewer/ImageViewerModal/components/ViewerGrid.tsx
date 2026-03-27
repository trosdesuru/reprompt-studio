import { useEffect, useRef } from "react";
import { ImageCard } from "../../ImageCard";
import { ViewerPageItem } from "@/src/types/gallery";

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

  // 🟢 MAGIA: Intersection Observer para cargar más páginas
  useEffect(() => {
    if (!hasMorePages || !onLoadMore || isLoadingMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          onLoadMore();
        }
      },
      { rootMargin: "300px" },
    );

    if (observerRef.current) observer.observe(observerRef.current);
    return () => observer.disconnect();
  }, [hasMorePages, onLoadMore, isLoadingMore]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <svg
          className="animate-spin h-12 w-12 text-(--accent-color)"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
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

      {/* 🟢 SENSOR INVISIBLE EN EL FONDO DEL GRID */}
      {hasMorePages && (
        <div ref={observerRef} className="col-span-full flex justify-center p-8 h-24">
          {isLoadingMore && (
            <svg
              className="animate-spin h-8 w-8 text-(--accent-color)"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          )}
        </div>
      )}

      {pages.length === 0 && (
        <div className="col-span-full text-center p-8 font-mono text-(--text-secondary)">
          No se encontraron páginas en esta galería.
        </div>
      )}
    </div>
  );
}
