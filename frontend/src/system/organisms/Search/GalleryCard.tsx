import { GalleryItem } from "@/src/types/gallery";
import { IconDownload, IconEye } from "@tabler/icons-react";

interface Props {
  item: GalleryItem;
  onOpenVisor: (item: GalleryItem) => void;
  onDownloadTotal: (item: GalleryItem) => void;
}

export function GalleryCard({ item, onOpenVisor, onDownloadTotal }: Props) {
  return (
    <div className="group relative flex flex-col neo-border bg-(--bg-secondary) overflow-hidden h-full hover:neo-shadow-accent transition-all cursor-pointer" onClick={() => onOpenVisor(item)}>
      <div className="relative aspect-3/4 w-full overflow-hidden bg-black border-b-2 border-(--border-color)">
        <img src={item.thumb} alt={item.title} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all" loading="lazy" />
        <div className="absolute inset-0 bg-linear-to-t from-black/80 via-transparent to-transparent" />
        <div className="absolute bottom-0 left-0 p-3 w-full flex justify-between items-end">
            <span className="text-white font-black font-mono text-xs line-clamp-2 drop-shadow-md">{item.title}</span>
        </div>
      </div>
      <div className="p-3 flex justify-between items-center bg-background">
         <div className="flex items-center gap-1 text-[10px] font-mono text-(--text-secondary)">
            <IconEye size={14} /> {item.views || 0}
         </div>
         <button onClick={(e) => { e.stopPropagation(); onDownloadTotal(item); }} className="p-1.5 bg-(--accent-color) text-white neo-border hover:bg-white hover:text-black transition-colors" aria-label={`Descargar galería ${item.title}`} title={`Descargar galería ${item.title}`}>
            <IconDownload size={14} />
         </button>
      </div>
    </div>
  );
}
