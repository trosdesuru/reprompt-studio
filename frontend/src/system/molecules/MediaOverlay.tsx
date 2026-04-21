"use client";

import React from "react";
import { IconWand, IconDownload } from "@tabler/icons-react";
import { MediaVariant } from "@/src/types/models";

interface MediaOverlayProps {
  title: string;
  prompt?: string;
  tags?: string[];
  variant?: MediaVariant;
  onDownload?: (e: React.MouseEvent) => void;
}

export function MediaOverlay({
  title,
  prompt,
  tags,
  variant = "gallery",
  onDownload,
}: MediaOverlayProps) {
  const isViewer = variant === "viewer";

  return (
    <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4 pointer-events-none">
      {/* Botón de descarga interactivo (Top Right) */}
      {onDownload && (
        <div className="absolute top-3 right-3 flex gap-2 translate-y-2.5 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 delay-75 pointer-events-auto">
          <button
            onClick={onDownload}
            className="p-2 bg-black/50 hover:bg-black/80 backdrop-blur-md text-white rounded-lg transition-colors border border-white/10"
            title="Descargar imagen"
          >
            <IconDownload size={18} />
          </button>
        </div>
      )}

      {/* Contenido (Bottom) */}
      <div className="translate-y-2.5 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 delay-100 text-white">
        <h3 className="text-sm font-bold line-clamp-1 mb-1 shadow-black/50 drop-shadow-md">
          {title}
        </h3>

        {prompt && (
          <div className="flex items-start gap-1.5 mt-2 text-xs text-white/80 line-clamp-2 leading-tight">
            <IconWand size={14} className="shrink-0 text-var(--accent-color) mt-0.5" />
            <p className="font-mono">{prompt}</p>
          </div>
        )}

        {/* Los tags se esconden en el visor para mayor limpieza */}
        {!isViewer && tags && tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {tags.slice(0, 4).map(
              (
                tag,
              ) => (
                <span
                  key={tag}
                  className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 bg-black/60 text-white/90 backdrop-blur-md rounded-sm border border-white/10"
                >
                  {tag}
                </span>
              ),
            )}
            {tags.length > 4 && (
              <span className="text-[9px] font-black px-1.5 py-0.5 bg-black/40 text-white/70 rounded-sm">
                +{tags.length - 4}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
