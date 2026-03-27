// frontend/src/components/GalleryCard.tsx
import { GalleryItem } from "../types/gallery";
import { Button } from "./ui/Button";

interface Props {
  item: GalleryItem;
  onDownloadTotal: (url: string, title: string) => void;
  onOpenVisor: (url: string, title: string) => void;
}

export default function GalleryCard({ item, onDownloadTotal, onOpenVisor }: Props) {
  return (
    <div className="bg-(--bg-secondary)r neo-shadow flex flex-col overflow-hidden group">
      <div className="h-64 overflow-hidden bg-black border-b-2 border-(--border-color) relative">
        {item.thumb && item.thumb !== "N/A" ? (
          <img
            src={item.thumb}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            alt={item.title}
          />
        ) : (
          <div className="flex items-center justify-center h-full text-(--text-secondary) font-mono text-sm">
            [ SIN IMAGEN ]
          </div>
        )}
        {/* Etiqueta decorativa estilo Dev */}
        <div className="absolute top-2 right-2 bg-background text-foreground neo-border px-2 py-1 text-xs font-mono font-bold">
          IMG
        </div>
      </div>

      <div className="p-4 flex flex-col grow justify-between gap-4">
        <h2 className="text-sm font-bold text-foreground line-clamp-2" title={item.title}>
          {item.title}
        </h2>

        <div className="flex flex-col gap-2 mt-auto">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onOpenVisor(item.url, item.title)}
            className="w-full"
          >
            📖 Visor
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => onDownloadTotal(item.url, item.title)}
            className="w-full"
          >
            ⬇️ Bajar
          </Button>
        </div>
      </div>
    </div>
  );
}
