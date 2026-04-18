"use client";

import { useState } from "react";
import Link from "next/link";
import {
  IconCopy,
  IconTrash,
  IconCheck,
  IconPhoto,
  IconDotsVertical,
  IconFolder,
} from "@tabler/icons-react";
import { SavedPrompt, Directory } from "@/src/types/models";
import { LazyImage } from "../../molecules/Media/LazyImage";

interface PromptCardProps {
  item: SavedPrompt;
  directories?: Directory[];
  onDelete?: (id: number) => void;
  onAssign?: (promptId: number, directoryId: number | null) => void;
  isPriority: boolean;
  isSelected?: boolean;
  onToggleSelect?: () => void;
  selectionModeActive?: boolean;
  index: number;
  lang?: string;
  isStudio?: boolean;
  authorUsername?: string;
}

export function PromptCard({
  item,
  directories = [],
  onAssign,
  onDelete,
  index = 0,
  isPriority = false,
  isSelected = false,
  onToggleSelect,
  selectionModeActive = false,
  lang = "es",
  isStudio = false,
  authorUsername = "unknown",
}: PromptCardProps) {
  const [copied, setCopied] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const queryParam = isStudio ? "?from=studio" : "";
  const href = `/${lang}/${authorUsername}/p/${item.id}${queryParam}`;

  const handleCopy = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (item.prompt) {
      navigator.clipboard.writeText(item.prompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div
      // 🟢 CORRECCIÓN 2: Quitamos "overflow-hidden" del padre para que el menú pueda salirse libremente
      className="group relative flex flex-col bg-background rounded-xl border border-border shadow-sm hover:shadow-lg transition-all duration-300"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setIsMenuOpen(false);
      }}
    >
      <Link href={href} className="absolute inset-0 z-0">
        <span className="sr-only">Ver detalles del prompt {item.title}</span>
      </Link>

      {(selectionModeActive || isHovered || isSelected) && (
        <div
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onToggleSelect?.();
          }}
          className="absolute top-3 left-3 z-30 cursor-pointer pointer-events-auto transition-opacity duration-200"
        >
          <div
            className={`w-6 h-6 rounded-full border-[1.5px] flex items-center justify-center transition-all shadow-sm ${
              isSelected
                ? "bg-(--accent-color) border-(--accent-color) text-white"
                : "bg-black/40 border-white/80 hover:bg-black/60 text-white/0 hover:text-white/50"
            }`}
          >
            <IconCheck
              size={14}
              stroke={3}
              className={isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100"}
            />
          </div>
        </div>
      )}

      {(onAssign || onDelete) && !selectionModeActive && (
        <div
          className={`absolute top-3 right-3 z-40 pointer-events-auto transition-opacity duration-300 ${isHovered || isMenuOpen ? "opacity-100" : "opacity-0"}`}
        >
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsMenuOpen(!isMenuOpen);
            }}
            className={`p-1.5 rounded-md backdrop-blur-md border shadow-sm transition-colors ${
              isMenuOpen
                ? "bg-background border-border text-foreground"
                : "bg-black/40 border-white/20 text-white hover:bg-black/60"
            }`}
          >
            <IconDotsVertical size={18} />
          </button>

          {isMenuOpen && (
            <div
              className="absolute top-full right-0 mt-2 w-48 bg-background border border-border rounded-xl shadow-xl overflow-hidden flex flex-col py-1 z-50 animate-in fade-in duration-200"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
            >
              {onAssign && directories.length > 0 && (
                <div className="px-3 py-2 border-b border-border/10">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1.5 flex items-center gap-1.5">
                    <IconFolder size={12} /> Colección
                  </label>
                  <select
                    className="w-full bg-muted/50 text-xs text-foreground p-1.5 rounded border border-border focus:outline-none focus:ring-1 focus:ring-(--accent-color) cursor-pointer"
                    value={item.directory_id || ""}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                    onChange={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onAssign(item.id, e.target.value ? Number(e.target.value) : null);
                      setIsMenuOpen(false);
                    }}
                  >
                    <option value="">Ninguna (Suelto)</option>
                    {directories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {onDelete && (
                <button
                  // 🟢 CORRECCIÓN 1: Devolvemos la protección del evento al botón y forzamos w-full
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (window.confirm("¿Seguro que deseas eliminar este prompt de Mi Studio?")) {
                      onDelete(item.id);
                    }
                    setIsMenuOpen(false);
                  }}
                  className="flex w-full items-center gap-2 px-3 py-2.5 text-xs font-medium text-red-500 hover:bg-red-500/10 text-left transition-colors"
                >
                  <IconTrash size={14} /> Borrar del Studio
                </button>
              )}
            </div>
          )}
        </div>
      )}

      <div className="relative aspect-square sm:aspect-4/5 bg-muted/10 z-10 pointer-events-none rounded-t-xl overflow-hidden">
        {item.image_url ? (
          <LazyImage
            src={item.image_url}
            alt={item.title}
            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-101"
            index={index}
            priority={isPriority}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground/50">
            <IconPhoto size={48} stroke={1} />
            <span className="text-xs font-mono mt-2">Sin imagen</span>
          </div>
        )}

        <div
          className={`absolute inset-0 bg-black/20 transition-opacity duration-300 ${isHovered || isMenuOpen ? "opacity-100" : "opacity-0"}`}
        />
      </div>

      <div className="p-5 flex flex-col grow gap-4 z-10 pointer-events-none">
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

        <div className="relative group/prompt bg-muted/30 rounded-lg p-3 border border-border/50 mt-auto pointer-events-auto">
          <p className="text-xs font-mono text-foreground/80 line-clamp-3 leading-relaxed">
            {item.prompt || <span className="italic opacity-50">Sin prompt</span>}
          </p>

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

        <div className="flex justify-between items-center text-[10px] text-muted-foreground font-mono uppercase tracking-widest pt-1 pointer-events-auto">
          <span>
            {new Date(item.created_at).toLocaleDateString(lang === "es" ? "es-ES" : "en-US")}
          </span>
          {item.resolution && <span>{item.resolution}</span>}
        </div>
      </div>
    </div>
  );
}
