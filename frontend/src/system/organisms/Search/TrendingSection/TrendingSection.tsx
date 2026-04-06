"use client";

import { UniversalMediaCard } from "@/src/system/organisms/Media/UniversalMediaCard";
import { mapSearchToMediaCard } from "@/src/utils/adapters/mediaAdapters";
import { GalleryItem } from "@/src/types/models";

interface TrendingSectionProps {
  trending: GalleryItem[];
  onOpenVisor: (item: GalleryItem) => void;
  onDownloadTotal: (item: GalleryItem) => void;
}

export function TrendingSection({ trending, onOpenVisor, onDownloadTotal }: TrendingSectionProps) {
  if (!trending || trending.length === 0) return null;

  return (
    <section className="w-full mt-8 animate-in fade-in duration-700">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold uppercase tracking-widest text-foreground/80">
          Tendencias <span className="text-var(--accent-color)">E-Hentai</span>
        </h2>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {trending.map((item, index) => {
          // 🛡️ PRAGMATISMO: Clave compuesta hiper-estable para evitar re-renders.
          const stableKey = item.gid ? `trend-${item.gid}` : `trend-idx-${index}`;
          return (
            <UniversalMediaCard
              key={stableKey}
              data={mapSearchToMediaCard(item)}
              variant="gallery"
              onClick={() => onOpenVisor(item)}
              onDownload={() => onDownloadTotal(item)}
            />
          );
        })}
      </div>
    </section>
  );
}
