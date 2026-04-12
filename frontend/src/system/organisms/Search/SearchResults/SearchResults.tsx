"use client";
import { useEffect } from "react";
import { useInView } from "react-intersection-observer";
import { IconLoader2, IconRefresh } from "@tabler/icons-react";
import { UniversalMediaCard } from "@/src/system/organisms/Media/UniversalMediaCard";
import { mapSearchToMediaCard } from "@/src/utils/adapters/mediaAdapters";
import { GalleryItem } from "@/src/types/models";

interface SearchResultsProps {
  results: GalleryItem[];
  onOpenVisor: (item: GalleryItem) => void;
  onDownloadTotal: (item: GalleryItem) => void;
  hasMore: boolean;
  isLoadingMore: boolean;
  onLoadMore: () => void;
}

export function SearchResults({
  results,
  onOpenVisor,
  onDownloadTotal,
  hasMore,
  isLoadingMore,
  onLoadMore,
}: SearchResultsProps) {
  // Margen de 400px para cargar con antelación y que el usuario ni note la carga
  const { ref, inView } = useInView({ rootMargin: "400px" });

  useEffect(() => {
    if (inView && hasMore && !isLoadingMore) {
      onLoadMore();
    }
  }, [inView, hasMore, isLoadingMore, onLoadMore]);

  if (!results || results.length === 0) return null;

  return (
    <section className="w-full py-8 animate-in fade-in duration-700">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold uppercase tracking-widest text-foreground/80">
          Resultados de la <span className="text-var(--accent-color)">Búsqueda</span>
        </h2>
        <span className="text-sm font-mono text-muted-foreground bg-muted/30 px-3 py-1 neo-border shadow-sm">
          {results.length} recuperados
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 min-h-[50vh]">
        {results.map((item, index) => {
          const stableKey = item.gid ? `search-${item.gid}` : `search-idx-${index}`;
          return (
            <UniversalMediaCard
              key={stableKey}
              data={mapSearchToMediaCard(item)}
              variant="search"
              onClick={() => onOpenVisor(item)}
              onDownload={() => onDownloadTotal(item)}
            />
          );
        })}
      </div>

      {/* 🛡️ CENTINELA HÍBRIDO (Auto Scroll + Fallback Manual + End of Line) */}
      <div className="mt-16 flex justify-center items-center h-24">
        {hasMore ? (
          <div ref={ref} className="w-full flex justify-center">
            {isLoadingMore ? (
              <div className="flex flex-col items-center gap-3 text-var(--accent-color) animate-pulse">
                <IconLoader2 className="animate-spin" size={32} />
                <span className="font-mono text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  Decodificando Red...
                </span>
              </div>
            ) : (
              <button
                onClick={onLoadMore}
                className="group flex items-center gap-2 px-6 py-3 bg-muted/20 border-2 border-border text-muted-foreground hover:text-foreground hover:border-foreground hover:bg-muted/50 neo-border font-mono text-xs font-bold uppercase transition-all"
              >
                <IconRefresh
                  size={16}
                  className="group-hover:rotate-180 transition-transform duration-500"
                />
                Forzar Carga
              </button>
            )}
          </div>
        ) : (
          <div className="text-center font-mono text-xs text-muted-foreground uppercase tracking-widest bg-muted/10 px-6 py-3 neo-border border-dashed">
            Has llegado al final del abismo
          </div>
        )}
      </div>
    </section>
  );
}
