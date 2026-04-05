import { useInView } from "react-intersection-observer";
import { useEffect } from "react";

interface Props {
  pages: any[];
  currentIndex: number;
  onSelect: (index: number) => void;
  hasMorePages?: boolean;
  isLoadingMore?: boolean;
  onLoadMore?: () => void;
}

export function ViewerGrid({ pages, currentIndex, onSelect, hasMorePages, isLoadingMore, onLoadMore }: Props) {
  const { ref, inView } = useInView({ rootMargin: "400px" });

  useEffect(() => {
    if (inView && hasMorePages && !isLoadingMore && onLoadMore) {
      onLoadMore();
    }
  }, [inView, hasMorePages, isLoadingMore, onLoadMore]);

  return (
    <div className="w-full h-full overflow-y-auto pr-2 custom-scrollbar">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 pb-20">
        {pages.map((page, index) => {
          // 🟢 Programación Defensiva: Buscamos cualquier tipo de miniatura disponible
          const imgSrc = page.thumb_url || page.thumb || page.image_url;

          return (
            <div
              key={page.page_url || page.image_url || `grid-${index}`}
              onClick={() => onSelect(index)}
              className={`cursor-pointer neo-border aspect-3/4 relative overflow-hidden transition-all bg-zinc-900 group ${
                currentIndex === index && pages.length > 1 ? "ring-4 ring-(--accent-color) scale-95" : "hover:scale-105"
              }`}
            >
              {imgSrc ? (
                <img 
                  src={imgSrc} 
                  alt={`Página ${index + 1}`} 
                  className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" 
                  loading="lazy" 
                />
              ) : (
                // 🟢 Fallback UI: Si no hay miniatura, mostramos un diseño elegante con el número de página
                <div className="w-full h-full flex flex-col items-center justify-center text-zinc-600 group-hover:text-zinc-400 transition-colors">
                  <span className="font-mono text-4xl font-black">{index + 1}</span>
                  <span className="font-mono text-[10px] uppercase mt-2 tracking-widest">Abrir</span>
                </div>
              )}
              
              <div className="absolute bottom-0 left-0 bg-black/90 text-white text-[10px] font-mono px-2 py-1 border-t border-r border-zinc-800">
                {index + 1}
              </div>
            </div>
          );
        })}
      </div>

      {hasMorePages && (
        <div ref={ref} className="w-full flex justify-center py-8">
          {isLoadingMore ? (
            <div className="w-8 h-8 rounded-full border-4 border-(--accent-color) border-t-transparent animate-spin" />
          ) : (
            <div className="h-4 w-full" />
          )}
        </div>
      )}
    </div>
  );
}
