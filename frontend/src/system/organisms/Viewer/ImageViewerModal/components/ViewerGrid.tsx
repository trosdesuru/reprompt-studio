import { Skeleton } from "@/src/system/atoms/Skeleton";
import { useInView } from "react-intersection-observer";
import { useEffect } from "react";

interface Props {
  pages: any[];
  currentIndex: number;
  onSelect: (index: number) => void;
  // Nuevas props
  hasMorePages?: boolean;
  isLoadingMore?: boolean;
  onLoadMore?: () => void;
}

export function ViewerGrid({
  pages,
  currentIndex,
  onSelect,
  hasMorePages,
  isLoadingMore,
  onLoadMore,
}: Props) {
  // 🟢 El centinela del Grid
  const { ref, inView } = useInView({
    rootMargin: "400px",
  });

  useEffect(() => {
    if (inView && hasMorePages && !isLoadingMore && onLoadMore) {
      onLoadMore();
    }
  }, [inView, hasMorePages, isLoadingMore, onLoadMore]);

  return (
    <div className="w-full h-full overflow-y-auto pr-2 custom-scrollbar">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 pb-20">
        {pages.map((page, index) => (
          <div
            key={page.image_url || `grid-${index}`}
            onClick={() => onSelect(index)}
            className={`cursor-pointer neo-border aspect-3/4 relative overflow-hidden transition-all ${
              currentIndex === index ? "ring-4 ring-(--accent-color) scale-95" : "hover:scale-105"
            }`}
          >
            {page.image_url ? (
              <img
                src={page.image_url}
                alt={`Page ${index}`}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            ) : (
              <Skeleton className="w-full h-full" />
            )}
            <div className="absolute bottom-0 left-0 bg-black/80 text-white text-[10px] font-mono px-2 py-1">
              {index + 1}
            </div>
          </div>
        ))}
      </div>

      {/* 🟢 El Centinela en la parte inferior del Grid */}
      {hasMorePages && (
        <div ref={ref} className="w-full flex justify-center py-8">
          {isLoadingMore && (
            <div className="w-8 h-8 rounded-full border-4 border-(--accent-color) border-t-transparent animate-spin" />
          )}
        </div>
      )}
    </div>
  );
}
