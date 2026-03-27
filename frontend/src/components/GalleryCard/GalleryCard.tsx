import { Button } from "@/src/components/ui/Button";
import { GalleryCardProps } from "./GalleryCard.types";

export function GalleryCard({ item, onOpenVisor, onDownloadTotal }: GalleryCardProps) {
  return (
    <article className="flex flex-col bg-(--bg-secondary) neo-border neo-shadow h-full group overflow-hidden transition-all duration-300 hover:neo-shadow-accent">
      {/* 🖼️ IMAGEN (Thumbnail) - Clickable */}
      <div
        className="relative h-64 sm:h-56 overflow-hidden cursor-pointer border-b-[3px] border-(--border-color) bg-black"
        onClick={() => onOpenVisor(item.url, item.title)}
      >
        <img
          src={item.thumb}
          alt={`Portada de ${item.title}`}
          referrerPolicy="no-referrer"
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 opacity-90 group-hover:opacity-100"
        />

        {/* Overlay Hover para indicar acción (Afordancia) */}
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <span className="bg-(--accent-color) text-white px-4 py-2 font-mono font-bold neo-border">
            👁️ LEER AHORA
          </span>
        </div>

        {/* Badges de Categoría y Métricas */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {item.category && (
            <span className="bg-(--bg-primary) text-(--foreground) text-[10px] font-black font-mono px-2 py-1 neo-border uppercase">
              {item.category}
            </span>
          )}
        </div>

        {/* Métricas de BD Local (Si existen) */}
        {(item.views !== undefined || item.downloads !== undefined) && (
          <div className="absolute bottom-2 left-2 flex gap-2">
            {item.views !== undefined && item.views > 0 && (
              <span className="bg-black text-white text-[10px] font-bold px-2 py-1 neo-border">
                👁️ {item.views}
              </span>
            )}
            {item.downloads !== undefined && item.downloads > 0 && (
              <span className="bg-yellow-400 text-black text-[10px] font-bold px-2 py-1 neo-border">
                ⬇️ {item.downloads}
              </span>
            )}
          </div>
        )}
      </div>

      {/* 📝 CONTENIDO Y TÍTULO */}
      <div className="p-4 flex flex-col grow bg-(--bg-secondary)">
        <h3
          className="text-sm font-bold leading-tight mb-4 line-clamp-3 text-(--foreground) cursor-pointer hover:text-(--accent-color) transition-colors"
          onClick={() => onOpenVisor(item.url, item.title)}
          title={item.title}
        >
          {item.title}
        </h3>

        {/* 🛠️ ACCIONES (Mobile First: Botones grandes y fáciles de tocar) */}
        <div className="mt-auto flex flex-col gap-2">
          <Button
            onClick={() => onDownloadTotal(item.url, item.title)}
            variant="secondary"
            className="w-full justify-center h-11 text-xs font-black uppercase tracking-wider"
          >
            📥 Descargar .ZIP
          </Button>
        </div>
      </div>
    </article>
  );
}
