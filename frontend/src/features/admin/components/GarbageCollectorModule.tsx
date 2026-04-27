import { IconTrash } from "@tabler/icons-react";
export function GarbageCollectorModule() {
  return (
    <div className="p-6 bg-red-500/5 border border-red-500/20 rounded-xl flex flex-col justify-between">
      <h4 className="text-sm font-black uppercase text-red-500">Recolector de Basura</h4>
      <button className="flex items-center justify-center gap-2 text-[10px] font-mono font-bold uppercase text-red-500 hover:bg-red-500/10 p-2 rounded transition-colors">
        <IconTrash size={14} /> Ejecutar Purga
      </button>
    </div>
  );
}
