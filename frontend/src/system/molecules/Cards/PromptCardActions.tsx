"use client";

import { SavedPrompt } from "@/src/types/models";
import {
  IconDotsVertical,
  IconFolder,
  IconTrash,
  IconBookmark,
  IconWand,
  IconDownload,
  IconSquareCheck, // 🟢 Importado
} from "@tabler/icons-react";
import { Tooltip } from "../../atoms/Tooltip/Tooltip";
import { useDownloadImage } from "@/src/features/prompts/hooks/useDownloadImage";
import { useStudioUI } from "@/src/store/useStudioUI"; // 🟢 Importamos el store

// 🏛️ Directriz 12: Tipado estricto. Cero "any".
interface Directory {
  id: string;
  name: string;
}

interface PromptCardActionsProps {
  item: SavedPrompt;
  directories?: Directory[];
  onAssign?: (promptId: string, dirId: string) => void;
  onDelete?: (id: string) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  isOwner: boolean;
}

export function PromptCardActions({
  item,
  directories,
  onAssign,
  onDelete,
  isOpen,
  setIsOpen,
  isOwner,
}: PromptCardActionsProps) {
  const { downloadImage, isDownloading } = useDownloadImage();
  // 🟢 Instanciamos la función del estado global
  const togglePromptSelection = useStudioUI((state) => state.togglePromptSelection);

  return (
    <div className="absolute top-2 right-2 z-50">
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        // 🕸️ Directriz 9: Área táctil ampliada
        className={`p-2 rounded-md backdrop-blur-md border shadow-sm transition-colors ${
          isOpen
            ? "bg-background border-border text-foreground"
            : "bg-black/40 border-white/20 text-white hover:bg-black/60"
        }`}
        aria-label="Opciones del prompt"
      >
        <IconDotsVertical size={18} />
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-1 w-48 bg-background border border-border rounded-xl shadow-xl z-50 animate-in fade-in zoom-in-95 overflow-hidden">
          {/* 🌍 ACCIONES UNIVERSALES (Para todos: Dueños y Visitantes) */}
          <div className="flex flex-col">
            {/* 🟢 NUEVO BOTÓN: Seleccionar (Solo Dueño) */}
            {isOwner && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  togglePromptSelection(String(item.id));
                  setIsOpen(false);
                }}
                className="flex w-full items-center gap-2 px-3 py-3 text-xs font-mono font-bold text-foreground hover:bg-muted transition-colors border-b border-border/10"
              >
                <IconSquareCheck size={14} className="text-(--accent-color)" />
                Seleccionar
              </button>
            )}

            {item.image_url && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  downloadImage(item.image_url || null, item.title || "prompt");
                  setIsOpen(false);
                }}
                disabled={isDownloading}
                className="flex w-full items-center gap-2 px-3 py-3 text-xs font-mono font-bold text-foreground/70 hover:bg-muted hover:text-foreground transition-colors border-b border-border/10"
              >
                <IconDownload
                  size={14}
                  className={isDownloading ? "animate-pulse text-accent" : ""}
                />
                {isDownloading ? "Descargando..." : "Descargar Imagen"}
              </button>
            )}

            <Tooltip variant="default" content="Servicio en desarrollo" side="left">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                className="flex w-full items-center gap-2 px-3 py-3 text-xs font-mono font-bold text-foreground/70 hover:bg-muted hover:text-foreground transition-colors border-b border-border/10 cursor-not-allowed opacity-70"
              >
                <IconWand size={14} /> Copiar Prompt
              </button>
            </Tooltip>

            <Tooltip variant="default" content="Servicio en desarrollo" side="left">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                className={`flex w-full items-center gap-2 px-3 py-3 text-xs font-mono font-bold text-foreground/70 hover:bg-muted hover:text-foreground transition-colors cursor-not-allowed opacity-70 ${isOwner ? "border-b border-border/30" : ""}`}
              >
                <IconBookmark size={14} /> Guardar
              </button>
            </Tooltip>
          </div>

          {/* 👑 ACCIONES DE DUEÑO (OWNER) - Zona Administrativa */}
          {isOwner && (
            <div className="bg-muted/10">
              {onAssign && directories && directories.length > 0 && (
                <div className="px-3 py-3 border-b border-border/10">
                  <label className="text-[10px] font-bold uppercase text-muted-foreground mb-1.5 flex items-center gap-1.5">
                    <IconFolder size={12} /> Colección
                  </label>
                  <select
                    className="w-full bg-muted/50 text-xs p-2 rounded border border-border outline-none focus:ring-1 focus:ring-accent cursor-pointer"
                    value={item.directory_id || ""}
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onAssign(String(item.id), e.target.value);
                      setIsOpen(false);
                    }}
                  >
                    <option value="">Suelto</option>
                    {directories.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {onDelete && (
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsOpen(false);
                    if (window.confirm("¿Eliminar este prompt del Studio?")) {
                      onDelete(String(item.id));
                    }
                  }}
                  className="flex w-full items-center gap-2 px-3 py-3 text-xs font-mono font-bold text-red-500 hover:bg-red-500 hover:text-white transition-colors"
                >
                  <IconTrash size={14} /> Eliminar
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
