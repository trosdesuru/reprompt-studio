import { useState } from "react";
import { BatchItem } from "../../hooks/usePromptExtractor";
import { Button } from "@/src/components/ui/Button";
import { IconTrash, IconDeviceFloppy, IconCheck } from "@tabler/icons-react";
import { api } from "@/src/services/api";
import { handleError } from "@/src/utils/errors/ErrorHandler";
import { InspectorBadges } from "./InspectorBadges";

interface Props {
  batch: BatchItem[];
  onUpdateStatus: (id: string, status: BatchItem["status"]) => void;
  onRemoveItem: (id: string) => void;
  onClearAll: () => void;
}

// Utilidad Pura para Base64
const blobToBase64 = async (blobUrl: string): Promise<string> => {
  const response = await fetch(blobUrl);
  const blob = await response.blob();
  return new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.readAsDataURL(blob);
  });
};

export function BatchInspector({ batch, onUpdateStatus, onRemoveItem, onClearAll }: Props) {
  const [isGlobalLoading, setIsGlobalLoading] = useState(false);

  const handleSaveItem = async (item: BatchItem) => {
    if (item.status === "success") return;
    onUpdateStatus(item.id, "saving");

    try {
      let finalImageUrl = null;
      if (item.previewUrl && item.previewUrl.startsWith("blob:")) {
        finalImageUrl = await blobToBase64(item.previewUrl);
      }

      const payload = {
        title: `Gen - ${item.data.software || "IA"}`,
        prompt: item.data.prompt,
        negative_prompt: item.data.negativePrompt,
        software: item.data.software,
        model: item.data.model,
        sampler: item.data.sampler,
        steps: item.data.steps,
        cfg_scale: item.data.cfgScale,
        seed: item.data.seed,
        resolution: item.data.resolution,
        image_url: finalImageUrl,
        extra_data: {
          loras: item.data.loras || [],
          triggerWords: item.data.triggerWords || [],
        },
      };

      await api.guardarPrompt(payload);
      onUpdateStatus(item.id, "success");

      // Auto-eliminar después de 2 segundos para limpiar la pantalla
      setTimeout(() => {
        onRemoveItem(item.id);
      }, 2000);
    } catch (err: unknown) {
      handleError(err, "SaveBatchItem");
      onUpdateStatus(item.id, "error");
    }
  };

  const handleSaveAll = async () => {
    setIsGlobalLoading(true);
    const pendingItems = batch.filter((i) => i.status !== "success");

    // Promesas en paralelo para máxima velocidad
    await Promise.allSettled(pendingItems.map((item) => handleSaveItem(item)));
    setIsGlobalLoading(false);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Panel de Control Global */}
      <div className="bg-(--bg-secondary) p-4 neo-border flex flex-col sm:flex-row justify-between items-center gap-4 sticky top-20 z-30 shadow-2xl">
        <div className="font-mono font-black uppercase flex gap-4">
          <span className="text-(--accent-color)">Archivos Listos: {batch.length}</span>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button
            onClick={handleSaveAll}
            isLoading={isGlobalLoading}
            className="flex-1 sm:flex-none flex items-center gap-2"
          >
            <IconDeviceFloppy size={18} /> Guardar Todos
          </Button>
          <Button
            onClick={onClearAll}
            variant="danger"
            disabled={isGlobalLoading}
            className="flex-1 sm:flex-none flex items-center gap-2"
          >
            <IconTrash size={18} /> Descartar Todos
          </Button>
        </div>
      </div>

      {/* Cuadrícula de Resultados */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 pb-20">
        {batch.map((item) => (
          <div
            key={item.id}
            className={`bg-background neo-border neo-shadow flex flex-col overflow-hidden transition-all ${item.status === "success" ? "opacity-50 scale-95 border-green-500" : ""}`}
          >
            {/* Header / Preview */}
            <div className="h-48 relative border-b-2 border-(--border-color) bg-(--bg-secondary) flex items-center justify-center">
              {item.previewUrl ? (
                <img src={item.previewUrl} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <span className="font-mono text-xs opacity-50 font-black uppercase">
                  Modo Texto
                </span>
              )}
              {item.status === "success" && (
                <div className="absolute inset-0 bg-green-500/80 flex items-center justify-center text-white font-black text-2xl font-mono uppercase">
                  <IconCheck size={48} />
                </div>
              )}
            </div>

            {/* Datos Resumidos */}
            <div className="p-4 grow space-y-4">
              <InspectorBadges data={item.data} />
              <div className="bg-(--bg-secondary) p-2 border border-(--border-color) overflow-hidden h-24 relative">
                <p className="font-mono text-[10px] leading-relaxed line-clamp-4">
                  {item.data.prompt}
                </p>
                <div className="absolute bottom-0 left-0 w-full h-8 bg-linear-to-t from-(--bg-secondary) to-transparent" />
              </div>
            </div>

            {/* Acciones Individuales */}
            <div className="flex border-t-2 border-(--border-color)">
              <button
                onClick={() => handleSaveItem(item)}
                disabled={item.status === "saving" || item.status === "success"}
                className={`flex-1 p-3 font-mono font-black text-xs uppercase flex items-center justify-center gap-2 transition-colors ${item.status === "error" ? "bg-red-500 text-white" : "hover:bg-(--accent-color) hover:text-white"}`}
              >
                {item.status === "saving"
                  ? "Guardando..."
                  : item.status === "error"
                    ? "Reintentar"
                    : "Guardar"}
              </button>
              <button
                onClick={() => onRemoveItem(item.id)}
                disabled={item.status === "saving"}
                className="p-3 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-colors border-l-2 border-(--border-color)"
              >
                <IconTrash size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
