"use client";

import { useState } from "react";
import { IconCopy, IconTrash, IconCheck, IconPhoto, IconFolderPlus } from "@tabler/icons-react";
import { Collection, SavedPrompt } from "@/src/features/studio/hooks/useStudio";
import { LazyImage } from "../../molecules/Media/LazyImage";

interface PromptCardProps {
  item: SavedPrompt;
  collections?: Collection[];
  onDelete?: (id: number) => void;
  onAssign?: (promptId: number, collectionId: number | null) => void;
}

export function PromptCard({ item, collections = [], onAssign, onDelete }: PromptCardProps) {
  const [copied, setCopied] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (item.prompt) {
      navigator.clipboard.writeText(item.prompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div
      className="group flex flex-col bg-background rounded-xl border border-border shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative aspect-square sm:aspect-4/5 bg-muted/10 overflow-hidden">
        {item.image_url ? (
          <LazyImage
            src={item.image_url}
            alt={item.title}
            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-101"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground/50">
            <IconPhoto size={48} stroke={1} />
            <span className="text-xs font-mono mt-2">Sin imagen</span>
          </div>
        )}

        {/* Capa de oscurecimiento on hover para que resalten los botones */}
        <div
          className={`absolute inset-0 bg-black/20 transition-opacity duration-300 ${isHovered ? "opacity-100" : "opacity-0"}`}
        />

        {onAssign && collections.length > 0 && (
          <div
            className={`absolute top-3 left-3 transition-opacity duration-300 ${isHovered ? "opacity-100" : "opacity-0"}`}
          >
            <div className="relative flex items-center bg-background/90 backdrop-blur-sm border border-border/50 rounded-md overflow-hidden shadow-sm">
              <div className="pl-2 text-muted-foreground">
                <IconFolderPlus size={14} />
              </div>
              <select
                className="bg-transparent text-[10px] font-bold uppercase tracking-widest text-foreground py-1.5 pl-1 pr-4 focus:outline-none cursor-pointer appearance-none"
                value={item.collection_id || ""}
                onChange={(e) => onAssign(item.id, e.target.value ? Number(e.target.value) : null)}
                onClick={(e) => e.stopPropagation()}
              >
                <option value="">Suelto</option>
                {collections.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* 🏷️ Badge de Software */}
        {item.software && (
          <div
            className={`absolute top-3 left-3 transition-opacity duration-300 ${isHovered ? "opacity-100" : "opacity-0"}`}
          >
            <span className="bg-background/90 backdrop-blur-sm text-foreground text-[10px] font-bold px-2.5 py-1 rounded-md border border-border/50 uppercase tracking-widest shadow-sm">
              {item.software}
            </span>
          </div>
        )}

        {onDelete && (
          <div
            className={`absolute top-3 right-3 transition-opacity duration-300 ${isHovered ? "opacity-100" : "opacity-0"}`}
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (window.confirm("¿Seguro que deseas eliminar este prompt de Mi Studio?")) {
                  onDelete(item.id);
                }
              }}
              className="bg-background/90 backdrop-blur-sm hover:bg-red-500/10 hover:text-red-500 text-foreground p-2 rounded-full border border-border/50 transition-colors shadow-sm"
              title="Eliminar"
            >
              <IconTrash size={16} stroke={1.5} />
            </button>
          </div>
        )}
      </div>

      {/* 📝 ÁREA DE CONTENIDO */}
      <div className="p-5 flex flex-col grow gap-4">
        {/* Cabecera: Título y Modelo */}
        <div>
          <h3 className="font-bold text-base tracking-tight truncate" title={item.title}>
            {item.title}
          </h3>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-muted-foreground truncate">
              {item.model || "Modelo desconocido"}
            </span>
            {item.sampler && (
              <>
                <span className="text-muted-foreground/30 text-[10px]">•</span>
                <span className="text-xs text-muted-foreground truncate">{item.sampler}</span>
              </>
            )}
          </div>
        </div>

        {/* Caja del Prompt */}
        <div className="relative group/prompt bg-muted/30 rounded-lg p-3 border border-border/50 mt-auto">
          <p className="text-xs font-mono text-foreground/80 line-clamp-3 leading-relaxed">
            {item.prompt || <span className="italic opacity-50">Sin prompt</span>}
          </p>

          {/* Botón de Copiar (Aparece al hacer hover en la caja del prompt) */}
          {item.prompt && (
            <button
              onClick={handleCopy}
              className="absolute top-2 right-2 p-1.5 bg-background border border-border rounded-md shadow-sm opacity-0 group-hover/prompt:opacity-100 hover:bg-accent hover:text-accent-foreground transition-all"
              title="Copiar Prompt"
            >
              {copied ? (
                <IconCheck size={14} className="text-green-500" stroke={2} />
              ) : (
                <IconCopy size={14} stroke={1.5} />
              )}
            </button>
          )}
        </div>

        {/* Pie de tarjeta (Fecha y dimensiones) */}
        <div className="flex justify-between items-center text-[10px] text-muted-foreground font-mono uppercase tracking-widest pt-1">
          <span>{new Date(item.created_at).toLocaleDateString()}</span>
          {item.resolution && <span>{item.resolution}</span>}
        </div>
      </div>
    </div>
  );
}
