import { IconDotsVertical, IconFolder, IconTrash } from "@tabler/icons-react";

export function PromptCardActions({
  item,
  directories,
  onAssign,
  onDelete,
  isOpen,
  setIsOpen,
}: any) {
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
        <div className="absolute top-full right-0 mt-2 w-48 bg-background border border-border rounded-xl shadow-xl py-1 z-50 animate-in fade-in zoom-in-95">
          {onAssign && directories.length > 0 && (
            <div className="px-3 py-2 border-b border-border/10">
              <label className="text-[10px] font-bold uppercase text-muted-foreground mb-1.5 flex items-center gap-1.5">
                <IconFolder size={12} /> Colección
              </label>
              <select
                className="w-full bg-muted/50 text-xs p-1.5 rounded border border-border"
                value={item.directory_id || ""}
                onChange={(e) => onAssign(item.id, e.target.value ? Number(e.target.value) : null)}
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
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (window.confirm("¿Exterminar rastro digital?")) onDelete(item.id);
            }}
            className="flex w-full items-center gap-2 px-3 py-2.5 text-xs font-medium text-red-500 hover:bg-red-500/10"
          >
            <IconTrash size={14} /> Borrar del Studio
          </button>
        </div>
      )}
    </div>
  );
}
