// frontend/features/search/TrendingSection/TrendingSection.tsx
import { GalleryCard } from "@/src/system/organisms/Search/GalleryCard";
import { TrendingSectionProps } from "./TrendingSection.types";

export function TrendingSection({ trending, onOpenVisor, onDownloadTotal }: TrendingSectionProps) {
  if (!trending || trending.length === 0) return null;

  return (
    <div className="mb-16 mt-8">
      <div className="flex items-center gap-3 mb-6 border-b-4 border-yellow-500 pb-2">
        <span className="text-3xl animate-bounce">🔥</span>
        <h2 className="text-3xl font-black font-mono uppercase tracking-tighter text-foreground">
          Top <span className="text-yellow-500">Descargas</span>
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
        {trending.map((item, index) => (
          <div key={item.url} className="relative group">
            {/* Medalla del Top */}
            <div className="absolute -top-4 -left-4 w-10 h-10 bg-yellow-400 text-black font-black font-mono text-xl flex items-center justify-center rounded-full neo-border neo-shadow z-30 transform group-hover:scale-110 transition-transform">
              #{index + 1}
            </div>

            <div className="border-4 border-transparent group-hover:border-yellow-400 transition-colors duration-300 h-full">
              {/* 🟢 Pasamos las funciones que ahora aceptan el item completo */}
              <GalleryCard
                item={item}
                onOpenVisor={onOpenVisor}
                onDownloadTotal={onDownloadTotal}
              />
            </div>

            {/* Contador de descargas */}
            <div className="absolute top-2 right-2 bg-black text-yellow-400 text-xs font-bold px-2 py-1 neo-border z-30 shadow-[2px_2px_0px_#facc15]">
              {item.downloads} ⬇️
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
