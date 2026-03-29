import { useState } from "react";
import { BatchItem, SkippedFile } from "@/src/features/extractor/hooks/usePromptExtractor";
import { Button } from "@/src/system/atoms/Button";
import {
  IconTrash,
  IconDeviceFloppy,
  IconCheck,
  IconAlertTriangle,
  IconX,
} from "@tabler/icons-react";
import { api } from "@/src/services/api";
import { handleError } from "@/src/utils/errors/ErrorHandler";
import { InspectorBadges } from "./InspectorBadges";
import { useNotificationStore } from "@/src/store/notificationStore";

interface Props {
  batch: BatchItem[];
  skippedFiles: SkippedFile[];
  onUpdateStatus: (id: string, status: BatchItem["status"]) => void;
  onRemoveItem: (id: string) => void;
  onClearAll: () => void;
  onClearSkipped: () => void;
}

const blobToBase64 = async (blobUrl: string): Promise<string> => {
  const response = await fetch(blobUrl);
  const blob = await response.blob();
  return new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.readAsDataURL(blob);
  });
};

export function BatchInspector({
  batch,
  skippedFiles,
  onUpdateStatus,
  onRemoveItem,
  onClearAll,
  onClearSkipped,
}: Props) {
  const [isGlobalLoading, setIsGlobalLoading] = useState(false);
  const notify = useNotificationStore((state) => state.notify);

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
        extra_data: { loras: item.data.loras || [], triggerWords: item.data.triggerWords || [] },
      };

      await api.guardarPrompt(payload);
      onUpdateStatus(item.id, "success");
      notify("Búnker", "Prompt guardado correctamente", "success");

      setTimeout(() => {
        onRemoveItem(item.id);
        notify("Búnker", "Prompt eliminado correctamente", "success");
      }, 1000);
    } catch (err: unknown) {
      handleError(err, "SaveBatchItem");
      onUpdateStatus(item.id, "error");
    }
  };

  const handleSaveAll = async () => {
    setIsGlobalLoading(true);
    const pendingItems = batch.filter((i) => i.status !== "success");
    // Procesamos uno a uno o en Promise.allSettled. Para evitar saturar tu base de datos, Promise.allSettled es ideal:
    await Promise.allSettled(pendingItems.map((item) => handleSaveItem(item)));
    setIsGlobalLoading(false);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* 🚨 FEEDBACK DE ARCHIVOS DESCARTADOS */}
      {skippedFiles.length > 0 && (
        <div className="bg-orange-500/10 border-2 border-orange-500 p-4 neo-border relative">
          <button
            onClick={onClearSkipped}
            className="absolute top-2 right-2 text-orange-700 hover:text-orange-900"
          >
            <IconX size={20} />
          </button>
          <div className="flex items-center gap-2 text-orange-600 font-black font-mono uppercase mb-2">
            <IconAlertTriangle size={20} />
            Se descartaron {skippedFiles.length} archivos
          </div>
          <div className="max-h-32 overflow-y-auto custom-scrollbar">
            <ul className="text-xs font-mono text-orange-800 space-y-1">
              {skippedFiles.map((f, i) => (
                <li key={i} className="flex gap-2">
                  <span className="font-bold truncate w-1/3" title={f.name}>
                    {f.name}
                  </span>
                  <span className="opacity-70 truncate w-2/3">- {f.reason}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* PANEL DE CONTROL GLOBAL */}
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

      {/* CUADRÍCULA DE RESULTADOS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 pb-20">
        {batch.map((item) => (
          <div
            key={item.id}
            className={`bg-background neo-border neo-shadow flex flex-col overflow-hidden transition-all ${item.status === "success" ? "opacity-50 scale-95 border-green-500" : ""}`}
          >
            <div className="h-48 relative border-b-2 border-(--border-color) bg-black flex items-center justify-center">
              {item.previewUrl ? (
                <img src={item.previewUrl} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <span className="font-mono text-xs opacity-50 font-black uppercase text-white">
                  Modo Texto
                </span>
              )}
              {item.status === "success" && (
                <div className="absolute inset-0 bg-green-500/80 flex items-center justify-center text-white font-black text-2xl font-mono uppercase">
                  <IconCheck size={48} />
                </div>
              )}
            </div>

            <div className="p-4 grow space-y-4">
              <InspectorBadges data={item.data} />
              <div className="bg-(--bg-secondary) p-2 border border-(--border-color) overflow-hidden h-24 relative">
                <p className="font-mono text-[10px] leading-relaxed line-clamp-4">
                  {item.data.prompt}
                </p>
                <div className="absolute bottom-0 left-0 w-full h-8 bg-linear-to-t from-(--bg-secondary) to-transparent" />
              </div>
            </div>

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
