import { useState } from "react";
import { Button } from "@/src/components/ui/Button";

interface StandardImageCardProps {
  imageUrl: string;
  index?: number;
  isSprite?: boolean;
  spriteOffset?: string;
  spriteWidth?: number;
  spriteHeight?: number;
  onImageClick?: () => void;
  onDownloadClick?: () => void;
  downloadStatus?: "idle" | "loading" | "success" | "error";
}

export function StandardImageCard({
  imageUrl,
  index,
  isSprite,
  spriteOffset,
  spriteWidth = 100,
  spriteHeight = 140,
  onImageClick,
  onDownloadClick,
  downloadStatus = "idle",
}: StandardImageCardProps) {
  const [imgError, setImgError] = useState(false);

  const dynamicScale = 224 / spriteHeight;

  return (
    <div className="bg-(--bg-secondary) neo-border neo-shadow flex flex-col relative z-20 group">
      <div
        className="h-56 relative bg-background border-b-2 border-(--border-color) flex items-center justify-center overflow-hidden cursor-pointer"
        onClick={onImageClick}
      >
        {imgError || !imageUrl ? (
          <div className="w-full h-full bg-black flex items-center justify-center text-xs font-mono text-(--text-secondary) opacity-50 font-black">
            [IMG ERROR]
          </div>
        ) : isSprite ? (
          <div className="w-full h-full flex items-center justify-center overflow-hidden pointer-events-none">
            <div className="w-full h-full transition-transform duration-300 group-hover:scale-110 flex items-center justify-center">
              <div
                style={{
                  width: `${spriteWidth}px`,
                  height: `${spriteHeight}px`,
                  backgroundImage: `url(${imageUrl})`,
                  backgroundPosition: spriteOffset,
                  backgroundRepeat: "no-repeat",
                  transform: `scale(${dynamicScale})`,
                  transformOrigin: "center center",
                }}
              />
            </div>
          </div>
        ) : (
          <img
            src={imageUrl}
            referrerPolicy="no-referrer"
            onError={() => setImgError(true)}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 pointer-events-none"
            alt={index ? `Página ${index}` : "Imagen"}
            loading="lazy"
          />
        )}

        {index !== undefined && (
          <span className="absolute top-2 left-2 bg-background text-foreground neo-border px-2 py-1 text-xs font-mono font-black pointer-events-none shadow-md z-10">
            #{index}
          </span>
        )}
      </div>

      <div className="p-3 z-30 relative bg-background">
        <Button
          onClick={(e) => {
            e.stopPropagation();
            if (onDownloadClick) onDownloadClick();
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
