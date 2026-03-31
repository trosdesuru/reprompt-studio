import { useEffect } from "react";
import { useInView } from "react-intersection-observer";
import { GalleryItem } from "@/src/types/gallery";
import { UniversalMediaCard } from "../Media/UniversalMediaCard";

interface Props {
  results: GalleryItem[];
  onOpenVisor: (item: GalleryItem) => void;
  onDownloadTotal: (item: GalleryItem) => void;
  hasMore?: boolean;
  isLoadingMore?: boolean;
  onLoadMore?: () => void;
}

export function SearchResults({
  results,
  onOpenVisor,
  onDownloadTotal,
  hasMore = false,
  isLoadingMore = false,
  onLoadMore,
}: Props) {
  const { ref, inView } = useInView({
    threshold: 0,
    rootMargin: "400px",
  });

  useEffect(() => {
    if (inView && hasMore && !isLoadingMore && onLoadMore) {
      onLoadMore();
    }
  }, [inView, hasMore, isLoadingMore, onLoadMore]);

  if (!results || results.length === 0) return null;

  return (
    <div className="flex flex-col gap-8 pb-20">
      {/* 1. La Cuadrícula de Resultados */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {results.map((item, index) => (
          <UniversalMediaCard
            key={item.id || item.url || `gallery-${index}`}
            item={item}
            onOpenVisor={onOpenVisor}
            onDownloadTotal={onDownloadTotal}
          />
        ))}
      </div>

      {/* 2. EL CENTINELA (Invisible o Spinner) */}
      {hasMore && (
        <div ref={ref} className="w-full flex justify-center py-10">
          {isLoadingMore ? (
            <div className="flex flex-col items-center gap-3 text-(--accent-color) animate-pulse">
              <div className="w-8 h-8 rounded-full border-4 border-current border-t-transparent animate-spin" />
              <span className="font-mono text-[10px] uppercase font-black tracking-widest text-(--text-secondary)">
                Decodificando más resultados...
              </span>
            </div>
          ) : (
            // Un div invisible que activa el observer justo antes de que se necesite el spinner
            <div className="h-4 w-full" />
          )}
        </div>
      )}
    </div>
  );
}
