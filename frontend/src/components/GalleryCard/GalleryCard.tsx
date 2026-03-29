import { useState } from "react";
import { Button } from "@/src/components/ui/Button";
import { GalleryCardProps } from "./GalleryCard.types";

export function GalleryCard({ item, onOpenVisor, onDownloadTotal }: GalleryCardProps) {
  const [imgError, setImgError] = useState(false);

  let thumbSrc = item.thumb;
  if (thumbSrc && thumbSrc.startsWith("//")) {
    thumbSrc = `https:${thumbSrc}`;
  }

  return (
    <div className="bg-(--bg-secondary) neo-border neo-shadow flex flex-col h-full group">
      <div
        className="h-64 relative border-b-2 border-(--border-color) overflow-hidden cursor-pointer bg-black"
        onClick={() => onOpenVisor(item)}
      >
        {imgError || !thumbSrc ? (
          <div className="w-full h-full flex items-center justify-center p-4 text-center bg-(--bg-secondary)">
            <span className="text-(--text-secondary) font-mono text-xs uppercase opacity-50 font-black">
              [IMG ERROR]
            </span>
          </div>
        ) : (
          <img
            src={thumbSrc}
            alt={item.title}
            loading="lazy"
            referrerPolicy="no-referrer"
            onError={() => setImgError(true)}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        )}

        {item.category && (
          <span className="absolute top-2 left-2 bg-background text-foreground text-xs font-black px-2 py-1 neo-border uppercase z-10">
            {item.category}
          </span>
        )}
      </div>

      <div className="p-4 flex flex-col grow justify-between gap-3">
        <h3
          className="text-sm font-bold leading-tight line-clamp-2 hover:text-(--accent-color) cursor-pointer"
          onClick={() => onOpenVisor(item)}
          title={item.title}
        >
          {item.title}
        </h3>
        <div className="mt-auto pt-2 border-t border-(--border-color)/30">
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
