"use client";

import { SavedPrompt } from "@/src/types/models";
import {
  IconDotsVertical,
  IconFolder,
  IconTrash,
  IconBookmark,
  IconWand,
} from "@tabler/icons-react";
import { Tooltip } from "../../atoms/Tooltip/Tooltip";

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
  isOwner: boolean; // 🟢 Inyectamos el estado de propiedad
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
  return (
    <div className="absolute top-2 right-2 z-50">
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        // 🕸️ Directriz 9: Área táctil ampliada (p-2) para evitar errores en móvil
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
          {/* 👑 ACCIONES DE DUEÑO (OWNER) */}
          {isOwner ? (
            <>
              {onAssign && directories && directories.length > 0 && (
                <div className="px-3 py-3 border-b border-border/10">
                  <label className="text-[10px] font-bold uppercase text-muted-foreground mb-1.5 flex items-center gap-1.5">
                    <IconFolder size={12} /> Colección
                  </label>
                  <select
                    className="w-full bg-muted/50 text-xs p-2 rounded border border-border outline-none focus:ring-1 focus:ring-accent cursor-pointer"
                    value={item.directory_id || ""}
                    onChange={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onAssign(String(item.id), e.target.value);
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
                    // 🛡️ Directriz 6: Programación defensiva. Confirmación antes de mutar la DB.
                    if (window.confirm("Eliminar prompt?")) {
                      onDelete(String(item.id));
                    }
                  }}
                  className="flex w-full items-center gap-2 px-3 py-3 text-xs font-mono font-bold text-red-500 hover:bg-red-500/10 transition-colors"
                >
                  <IconTrash size={14} /> Eliminar
                </button>
              )}
            </>
          ) : (
            /* 👁️ ACCIONES DE VISITANTE (VISITOR) */
            <div className="flex flex-col">
              <Tooltip variant="default" content="Servicio en desarrollo" side="left">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  className="flex w-full items-center gap-2 px-3 py-3 text-xs font-mono font-bold text-foreground/70 hover:bg-muted hover:text-foreground transition-colors border-b border-border/10 cursor-not-allowed opacity-70"
                >
                  <IconBookmark size={14} /> Guardar
                </button>
              </Tooltip>

              <Tooltip variant="default" content="Servicio en desarrollo" side="left">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  className="flex w-full items-center gap-2 px-3 py-3 text-xs font-mono font-bold text-foreground/70 hover:bg-muted hover:text-foreground transition-colors cursor-not-allowed opacity-70"
                >
                  <IconWand size={14} /> Copiar Prompt
                </button>
              </Tooltip>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
