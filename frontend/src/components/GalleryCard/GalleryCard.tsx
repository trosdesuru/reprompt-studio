import { Button } from "@/src/components/ui/Button";
import { GalleryCardProps } from "./GalleryCard.types";

export function GalleryCard({ item, onOpenVisor, onDownloadTotal }: GalleryCardProps) {
  return (
    <div className="bg-(--bg-secondary) neo-border neo-shadow flex flex-col h-full group">
      <div
        className="h-64 relative border-b-2 border-(--border-color) overflow-hidden cursor-pointer"
        onClick={() => onOpenVisor(item)}
      >
        <img
          src={item.thumb}
          alt={item.title}
          loading="lazy"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        {item.category && (
          <span className="absolute top-2 left-2 bg-background text-foreground text-xs font-black px-2 py-1 neo-border uppercase">
            {item.category}
          </span>
        )}
      </div>
      <div className="p-4 flex flex-col grow">
        <h3
          className="text-sm font-bold leading-tight mb-4 line-clamp-3 hover:text-(--accent-color) cursor-pointer"
          onClick={() => onOpenVisor(item)}
          title={item.title}
        >
          {item.title}
        </h3>
        <div className="mt-auto">
          <Button
            onClick={() => onDownloadTotal(item)}
            variant="secondary"
            className="w-full text-xs"
          >
            ⬇️ Descargar
          </Button>
        </div>
      </div>
    </div>
  );
}