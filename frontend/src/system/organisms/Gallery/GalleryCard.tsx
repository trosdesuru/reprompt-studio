"use client";

import Image from "next/image";
import { IconWand, IconDownload } from "@tabler/icons-react";
import { cn } from "@/src/utils/lib/cn";
import { AgnosticImageCard } from "@/src/types/gallery";

interface GalleryCardProps {
  data: AgnosticImageCard;
  onClick?: () => void;
  onDownload?: () => void;
}

export function GalleryCard({ data, onClick, onDownload }: GalleryCardProps) {
  return (
    <div
      className="group relative w-full overflow-hidden rounded-xl bg-muted/20 cursor-pointer border border-border/10 shadow-sm hover:shadow-md transition-all duration-300"
      onClick={onClick}
    >
      {/* 1. LA IMAGEN BASE */}
      {/* Usamos un aspect-ratio por defecto, en un grid tipo Masonry esto puede ser dinámico */}
      <div
        className={cn(
          "relative w-full overflow-hidden",
          data.aspectRatio === "portrait"
            ? "aspect-2/3"
            : data.aspectRatio === "landscape"
              ? "aspect-3/2"
              : "aspect-square",
        )}
      >
        <Image
          src={data.imageUrl}
          alt={data.title}
          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          loading="lazy"
        />
      </div>

      {/* 2. EL OVERLAY MÁGICO (Estilo Civitai) */}
      {/* Solo aparece al hacer hover (group-hover:opacity-100) */}
      <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
        {/* Acciones Rápidas (Top Right) */}
        <div className="absolute top-3 right-3 flex gap-2 translate-y-2.5 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 delay-75">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDownload?.();
            }}
            className="p-2 bg-black/50 hover:bg-black/80 backdrop-blur-md text-white rounded-lg transition-colors"
            title="Descargar"
          >
            <IconDownload size={18} />
          </button>
        </div>

        {/* Contenido (Bottom) */}
        <div className="translate-y-10px opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 delay-100 text-white">
          <h3 className="text-sm font-bold line-clamp-1 mb-1 shadow-black/50 drop-shadow-md">
            {data.title}
          </h3>

          {/* El Prompt (Si existe) */}
          {data.prompt && (
            <div className="flex items-start gap-1.5 mt-2 text-xs text-white/80 line-clamp-2 leading-tight">
              <IconWand size={14} className="shrink-0 text-(--accent-color) mt-0.5" />
              <p className="font-mono">{data.prompt}</p>
            </div>
          )}

          {/* Tags */}
          {data.tags && data.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-3">
              {data.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-white/20 backdrop-blur-sm rounded-sm"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
