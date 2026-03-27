"use client";

import { Button } from "@/src/components/ui/Button";
import { useImageCard } from "./useImageCard";
import { ImageCardProps } from "./ImageCard.types";

export function ImageCard({ pageUrl, index, galleryTitle, onOpenImage }: ImageCardProps) {
  const { cardRef, imageUrl, isLoading, isVisible, downloadStatus, handleDownload } = useImageCard(
    pageUrl,
    index,
    galleryTitle,
  );

  return (
    <div
      ref={cardRef}
      className="bg-(--bg-secondary) neo-border neo-shadow flex flex-col relative z-20 group"
    >
      <div
        className="h-56 relative bg-background border-b-2 border-(--border-color) flex items-center justify-center overflow-hidden cursor-pointer"
        onClick={() => imageUrl && onOpenImage(imageUrl)}
      >
        {!isVisible ? (
          <span className="text-(--text-secondary) font-mono text-xs pointer-events-none">
            Esperando...
          </span>
        ) : isLoading ? (
          <svg
            className="animate-spin h-8 w-8 text-(--accent-color)"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        ) : imageUrl ? (
          <img
            src={imageUrl}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 pointer-events-none"
            alt={`Página ${index}`}
          />
        ) : (
          <span className="text-red-500 font-mono font-bold text-xs pointer-events-none">
            Error
          </span>
        )}
        <span className="absolute top-2 left-2 bg-background text-foreground neo-border px-2 py-1 text-xs font-mono font-black pointer-events-none">
          #{index}
        </span>
      </div>

      <div className="p-3">
        <Button
          onClick={handleDownload}
          disabled={
            !imageUrl || isLoading || downloadStatus === "loading" || downloadStatus === "success"
          }
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
