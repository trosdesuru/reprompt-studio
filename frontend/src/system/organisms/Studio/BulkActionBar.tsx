import { IconTrash, IconDownload, IconX } from "@tabler/icons-react";
import { FadeIn } from "../../atoms/FadeIn";

interface BulkActionBarProps {
  selectedCount: number;
  onClearSelection: () => void;
  onDeleteSelected: () => void;
  onDownloadSelected: () => void;
  isDeleting?: boolean;
}

export function BulkActionBar({
  selectedCount,
  onClearSelection,
  onDeleteSelected,
  onDownloadSelected,
  isDeleting = false,
}: BulkActionBarProps) {
  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-10 fade-in duration-300">
      <div className="bg-foreground text-background px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-6 border border-border/20">
        {/* Contador y Cancelar */}
        <div className="flex items-center gap-3 pr-6 border-r border-background/20">
          <span className="font-bold whitespace-nowrap">{selectedCount} seleccionadas</span>
          <button
            onClick={onClearSelection}
            className="p-1 hover:bg-background/20 rounded-full transition-colors"
            title="Cancelar selección"
          >
            <IconX size={18} />
          </button>
        </div>

        {/* Acciones */}
        <div className="flex items-center gap-4">
          <button
            onClick={onDownloadSelected}
            className="flex items-center gap-2 text-sm font-medium hover:text-brand-blue transition-colors"
          >
            <IconDownload size={20} />
            Descargar ZIP
          </button>

          <button
            onClick={onDeleteSelected}
            disabled={isDeleting}
            className="flex items-center gap-2 text-sm font-medium text-red-400 hover:text-red-300 transition-colors disabled:opacity-50"
          >
            <IconTrash size={20} />
            {isDeleting ? "Borrando..." : "Borrar"}
          </button>
        </div>
      </div>
    </div>
  );
}
