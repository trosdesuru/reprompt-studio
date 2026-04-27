import { SavedPrompt } from "@/src/types/models";
import { IconDotsVertical, IconFolder, IconTrash } from "@tabler/icons-react";

interface PromptCardActionsProps {
  item: SavedPrompt;
  directories?: any[];
  onAssign?: (promptId: string, dirId: string) => void;
  onDelete?: (id: string) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export function PromptCardActions({
  item,
  directories,
  onAssign,
  onDelete,
  isOpen,
  setIsOpen,
}: PromptCardActionsProps) {
  return (
    <div className="absolute top-3 right-3 z-50">
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className={`p-1.5 rounded-md backdrop-blur-md border shadow-sm transition-colors ${
          isOpen ? "bg-background border-border" : "bg-black/40 border-white/20 text-white"
        }`}
      >
        <IconDotsVertical size={18} />
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 w-48 bg-background border border-border rounded-xl shadow-xl z-50 animate-in fade-in zoom-in-95 hover:border-red-500/50 overflow-hidden">
          {onAssign && directories && directories.length > 0 && (
            <div className="px-3 py-2 border-b border-border/10">
              <label className="text-[10px] font-bold uppercase text-muted-foreground mb-1.5 flex items-center gap-1.5">
                <IconFolder size={12} /> Colección
              </label>
              <select
                className="w-full bg-muted/50 text-xs p-1.5 rounded border border-border outline-none focus:ring-1 focus:ring-accent"
                value={item.directory_id || ""}
                onChange={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onAssign(String(item.id), e.target.value);
                }}
              >
                <option value="">Suelto</option>
                {directories.map((d: any) => (
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
                if (window.confirm("¿Exterminar rastro digital?")) {
                  onDelete(String(item.id));
                }
              }}
              className="flex w-full h-full items-center gap-2 px-3 py-3 text-xs font-mono font-normal text-red-400 hover:bg-red-500/10 transition-colors"
            >
              <IconTrash size={14} /> Eliminar
            </button>
          )}
        </div>
      )}
    </div>
  );
}
