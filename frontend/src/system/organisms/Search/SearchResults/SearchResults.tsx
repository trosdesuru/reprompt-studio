"use client";

import { useInView } from "react-intersection-observer";
import { IconLoader2 } from "@tabler/icons-react";
import { UniversalMediaCard } from "@/src/system/organisms/Media/UniversalMediaCard";
import { mapSearchToMediaCard } from "@/src/utils/adapters/mediaAdapters";
import { GalleryItem } from "@/src/types/gallery";
import { useEffect } from "react";

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
  // 🛡️ PRAGMATISMO: rootMargin de 200px para que empiece a cargar un poco antes del final real
  const { ref, inView } = useInView({ rootMargin: "200px" });

  useEffect(() => {
    // Si el centinela es visible, hay más páginas y NO estamos cargando ya, disparamos
    if (inView && hasMore && !isLoadingMore) {
      console.log("🚨 TELEMETRÍA [OBSERVER]: Centinela detectado. Cargando más...");
      onLoadMore();
    }
  }, [inView, hasMore, isLoadingMore, onLoadMore]);

  if (!results || results.length === 0) return null;

  return (
    <section className="w-full py-8 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold uppercase tracking-widest text-foreground/80">
          Resultados de la <span className="text-var(--accent-color)">Búsqueda</span>
        </h2>
        <span className="text-sm font-mono text-muted-foreground bg-muted/30 px-3 py-1 neo-border">
          {results.length} prompts
        </span>
      </div>

      {/* 🛡️ FIX CRÍTICO: min-h-screen asegura que la cuadrícula siempre tenga al menos el alto de la pantalla, empujando al centinela fuera de la vista y ROMPIENDO EL BUCLE */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 min-h-screen">
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

      {/* EL CENTINELA */}
      {hasMore && (
        <div ref={ref} className="mt-12 flex justify-center items-center h-20">
          {isLoadingMore ? (
            <div className="flex flex-col items-center gap-2 text-var(--accent-color)">
              <IconLoader2 className="animate-spin" size={32} />
              <span className="font-mono text-[10px] font-black uppercase tracking-widest">
                Decodificando Red...
              </span>
            </div>
          ) : (
            <div className="h-4 w-full" />
          )}
        </div>
      )}
    </section>
  );
}
