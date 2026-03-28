// frontend/features/image-viewer/ImageCard/ImageCard.tsx
"use client";

import { Button } from "@/src/components/ui/Button";
import { useImageCard } from "./useImageCard";
import { ImageCardProps } from "./ImageCard.types";

export function ImageCard({ item, index, galleryTitle, onOpenImage }: ImageCardProps) {
  const { downloadStatus, handleDownload } = useImageCard(item.page_url, index, galleryTitle);

  const isValidImage = item && typeof item.thumb_url === "string" && item.thumb_url.length > 5;
  const isSprite = Boolean(item.offset && item.offset.trim() !== "");

  // 🟢 CÁLCULO DINÁMICO DEL SPRITE
  // Usamos los datos extraídos del backend, o un fallback de 100x140
  const spriteWidth = item.width || 100;
  const spriteHeight = item.height || 140;

  // Tailwind h-56 equivale exactamente a 224px de altura.
  // Calculamos la escala exacta para que el sprite llene la altura de la tarjeta sin deformarse.
  const dynamicScale = 224 / spriteHeight;

  return (
    <div className="bg-(--bg-secondary) neo-border neo-shadow flex flex-col relative z-20 group">
      <div
        className="h-56 relative bg-background border-b-2 border-(--border-color) flex items-center justify-center overflow-hidden cursor-pointer"
        onClick={onOpenImage}
      >
        {isValidImage ? (
          isSprite ? (
            <div className="w-full h-full flex items-center justify-center overflow-hidden pointer-events-none">
              <div className="w-full h-full transition-transform duration-300 group-hover:scale-110 flex items-center justify-center">
                {/* 🟢 LIENZO DINÁMICO PERFECTO (Y sin el error de TypeScript) */}
                <div
                  style={{
                    width: `${spriteWidth}px`,
                    height: `${spriteHeight}px`,
                    backgroundImage: `url(${item.thumb_url})`,
                    backgroundPosition: item.offset,
                    backgroundRepeat: "no-repeat",
                    transform: `scale(${dynamicScale})`, // Escala matemática exacta
                    transformOrigin: "center center", // Asegura el centrado absoluto
                  }}
                />
              </div>
            </div>
          ) : (
            <img
              src={item.thumb_url}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 pointer-events-none"
              alt={`Página ${index}`}
              loading="lazy"
            />
          )
        ) : (
          <div className="w-full h-full bg-gray-800 flex items-center justify-center text-xs font-mono text-gray-400">
            [IMG ERROR]
          </div>
        )}

        <span className="absolute top-2 left-2 bg-background text-foreground neo-border px-2 py-1 text-xs font-mono font-black pointer-events-none shadow-md z-10">
          #{index}
        </span>
      </div>

      <div className="p-3 z-30 relative bg-background">
        <Button
          onClick={(e) => {
            e.stopPropagation();
            handleDownload();
          }}
          disabled={downloadStatus === "loading" || downloadStatus === "success"}
          variant={downloadStatus === "error" ? "danger" : "secondary"}
          size="sm"
          className="w-full text-xs font-black"
          isLoading={downloadStatus === "loading"}
        >
          {downloadStatus === "success" && "✅ ENCOLADA"}
          {downloadStatus === "error" && "❌ FALLÓ"}
          {downloadStatus === "idle" && "⬇️ GUARDAR"}
        </Button>
      </div>
    </div>
  );
}
