"use client";

import { Button } from "@/src/components/ui/Button";
import { useImageCard } from "./useImageCard";
import { ImageCardProps } from "./ImageCard.types";

export function ImageCard({ item, index, galleryTitle, onOpenImage }: ImageCardProps) {
  const { downloadStatus, handleDownload } = useImageCard(item.page_url, index, galleryTitle);

  // 🟢 VALIDACIÓN EXTREMA: Evitamos el bug catastrófico del src=""
  const hasValidImage = item.thumb_url && item.thumb_url.trim() !== "";

  return (
    <div className="bg-(--bg-secondary) neo-border neo-shadow flex flex-col relative z-20 group">
      <div
        className="h-56 relative bg-background border-b-2 border-(--border-color) flex items-center justify-center overflow-hidden cursor-pointer"
        onClick={onOpenImage}
      >
        {hasValidImage ? (
          <img
            src={item.thumb_url}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 pointer-events-none"
            alt={`Página ${index}`}
            loading="lazy"
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-gray-500 font-mono text-[10px] w-full h-full bg-gray-900 pointer-events-none">
            <span>[ SIN MINIATURA ]</span>
          </div>
        )}
        <span className="absolute top-2 left-2 bg-background text-foreground neo-border px-2 py-1 text-xs font-mono font-black pointer-events-none">
          #{index}
        </span>
      </div>

      <div className="p-3">
        <Button
          onClick={(e) => {
            e.stopPropagation();
            handleDownload();
          }}
          disabled={downloadStatus === "loading" || downloadStatus === "success"}
          variant={downloadStatus === "error" ? "danger" : "secondary"}
          size="sm"
          className="w-full text-xs"
          isLoading={downloadStatus === "loading"}
        >
          {downloadStatus === "success" && "✅ ¡Encolada!"}
          {downloadStatus === "error" && "❌ Falló"}
          {downloadStatus === "idle" && "⬇️ Guardar"}
        </Button>
      </div>
    </div>
  );
}
