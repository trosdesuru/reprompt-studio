// src/system/molecules/Cards/PromptCardMenu.tsx
import { IconFolder, IconTrash } from "@tabler/icons-react";

export function PromptCardMenu({ item, directories, onAssign, onDelete, isOpen }: any) {
  if (!isOpen) return null;

  return (
    <div className="absolute top-full right-0 mt-2 w-48 bg-background border border-border rounded-xl shadow-xl z-50 py-1">
      {onAssign && directories.length > 0 && (
        <div className="px-3 py-2 border-b border-border/10">
          <label className="text-[10px] font-bold uppercase text-muted-foreground flex items-center gap-1.5 mb-1.5">
            <IconFolder size={12} /> Colección
          </label>
          <select
            value={item.directory_id || ""}
            onChange={(e) => onAssign(item.id, e.target.value ? Number(e.target.value) : null)}
            className="w-full bg-muted/50 text-xs p-1.5 rounded border border-border focus:ring-1 focus:ring-(--accent-color)"
          >
            <option value="">Ninguna (Suelto)</option>
            {directories.map((d: any) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </div>
      )}
      <button
        onClick={onDelete}
        className="flex w-full items-center gap-2 px-3 py-2.5 text-xs text-red-500 hover:bg-red-500/10"
      >
        <IconTrash size={14} /> Eliminar
      </button>
    </div>
  );
}
