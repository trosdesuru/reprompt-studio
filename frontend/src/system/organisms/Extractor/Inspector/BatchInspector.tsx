import { useState } from "react";
import { BatchItem, SkippedFile } from "@/src/features/extractor/hooks/usePromptExtractor";
import { ExtractedPromptData } from "@/src/features/extractor/utils/promptParser";
import { Button } from "@/src/system/atoms/Button";
import {
  IconTrash,
  IconDeviceFloppy,
  IconAlertTriangle,
  IconX,
} from "@tabler/icons-react";
import { api } from "@/src/services/api";
import { handleError } from "@/src/utils/errors/ErrorHandler";
import { useNotificationStore } from "@/src/store/notificationStore";

interface Props {
  batch: BatchItem[];
  skippedFiles: SkippedFile[];
  onUpdateStatus: (id: string, status: BatchItem["status"]) => void;
  onUpdateItemData: (id: string, newData: Partial<ExtractedPromptData>) => void;
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
  onUpdateItemData,
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
        extra_data: {
          loras: item.data.loras || [],
          triggerWords: item.data.triggerWords || [],
        },
      };

      await api.savePrompt(payload);
      onUpdateStatus(item.id, "success");
      notify("Búnker", "Prompt guardado correctamente", "success");
      setTimeout(() => {
        onRemoveItem(item.id);
      }, 1000);
    } catch (err: unknown) {
      handleError(err, "SaveBatchItem");
      onUpdateStatus(item.id, "error");
    }
  };

  const handleSaveAll = async () => {
    setIsGlobalLoading(true);
    const pendingItems = batch.filter((i) => i.status !== "success");
    await Promise.allSettled(pendingItems.map((item) => handleSaveItem(item)));
    setIsGlobalLoading(false);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* FEEDBACK DE ARCHIVOS DESCARTADOS INTACTO AQUÍ */}
      {skippedFiles.length > 0 && (
        <div className="bg-orange-500/10 border-2 border-orange-500 p-4 neo-border relative">
          <button
            onClick={onClearSkipped}
            className="absolute top-2 right-2 text-orange-700 hover:text-orange-900"
          >
            <IconX size={20} />
          </button>
          <div className="flex items-center gap-2 text-orange-600 font-black font-mono uppercase mb-2">
            <IconAlertTriangle size={20} /> Se descartaron {skippedFiles.length} archivos
          </div>
          <div className="max-h-32 overflow-y-auto custom-scrollbar">
            <ul className="text-xs font-mono text-orange-800 space-y-1">
              {skippedFiles.map((f, i) => (
                <li key={i} className="flex gap-2">
                  <span className="font-bold truncate w-1/3" title={f.name}>
                    {f.name}
                  </span>
                  <span className="opacity-70 truncate w-2/3">{f.reason}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* 🎛️ CONTROLES GLOBALES */}
      <div className="flex flex-col sm:flex-row justify-between items-center bg-(--bg-secondary) p-4 neo-border gap-4">
        <div className="font-mono text-sm font-bold uppercase">
          <span className="text-(--accent-color)">{batch.length}</span> listos para búnker
        </div>
        <div className="flex w-full sm:w-auto gap-3">
          <Button
            onClick={onClearAll}
            variant="ghost"
            disabled={isGlobalLoading}
            className="text-red-500 hover:bg-red-500/10"
          >
            Descartar Todos
          </Button>
          <Button onClick={handleSaveAll} isLoading={isGlobalLoading} className="w-full sm:w-auto">
            <IconDeviceFloppy size={18} className="mr-2" /> Guardar Todo
          </Button>
        </div>
      </div>

      {/* 🖼️ GRID DE BATCH ITEMS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {batch.map((item) => {
          const isManual = item.data.software === "Desconocido";
          return (
            <div
              key={item.id}
              className={`neo-border bg-(--bg-secondary) flex flex-col h-420px relative group overflow-hidden transition-all ${
                item.status === "success" ? "opacity-50 grayscale" : "hover:neo-shadow-accent"
              }`}
            >
              {/* Imagen */}
              <div className="relative h-48 shrink-0 border-b-2 border-(--border-color) bg-black">
                {item.previewUrl ? (
                  <img
                    src={item.previewUrl}
                    alt={item.file.name}
                    className="w-full h-full object-cover opacity-90"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xs font-mono text-muted-foreground">
                    Sin visual
                  </div>
                )}

                <div className="absolute top-2 left-2 flex flex-col gap-1">
                  <span
                    className={`bg-black/80 ${isManual ? "text-yellow-400" : "text-white"} font-mono text-[10px] font-bold px-2 py-0.5 border border-(--border-color)`}
                  >
                    {item.data.software}
                  </span>
                </div>
              </div>

              {/* 🟢 Contenido: Lógica Híbrida (Formulario Manual o Texto Fijo) */}
              <div className="p-4 bg-background grow flex flex-col gap-2 overflow-hidden">
                {isManual ? (
                  <div className="flex flex-col h-full gap-2">
                    <textarea
                      placeholder="Escribe el prompt aquí..."
                      className="w-full grow text-xs font-mono p-2 neo-border bg-muted/10 focus:outline-none focus:ring-2 focus:ring-(--accent-color) resize-none custom-scrollbar"
                      value={item.data.prompt}
                      onChange={(e) => onUpdateItemData(item.id, { prompt: e.target.value })}
                    />
                    <div className="flex gap-2 shrink-0">
                      <input
                        type="text"
                        placeholder="Modelo (Ej. Midjourney v6)"
                        className="w-1/2 text-xs font-mono p-2 neo-border bg-muted/10 focus:outline-none focus:ring-2 focus:ring-(--accent-color)"
                        value={item.data.model || ""}
                        onChange={(e) => onUpdateItemData(item.id, { model: e.target.value })}
                      />
                      <input
                        type="text"
                        placeholder="Sampler (Ej. Euler a)"
                        className="w-1/2 text-xs font-mono p-2 neo-border bg-muted/10 focus:outline-none focus:ring-2 focus:ring-(--accent-color)"
                        value={item.data.sampler || ""}
                        onChange={(e) => onUpdateItemData(item.id, { sampler: e.target.value })}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="h-full overflow-y-auto custom-scrollbar pr-2">
                    <p className="font-mono text-xs text-(--text-secondary) leading-relaxed">
                      {item.data.prompt || (
                        <span className="italic opacity-50 text-red-500">
                          No se detectó un prompt en la metadata.
                        </span>
                      )}
                    </p>
                  </div>
                )}
              </div>

              {/* Barra de Acciones */}
              <div className="border-t-2 shrink-0 border-(--border-color) flex justify-between bg-muted/20">
                <button
                  onClick={() => handleSaveItem(item)}
                  disabled={item.status === "saving" || item.status === "success"}
                  className={`flex-1 p-3 font-bold font-mono text-xs uppercase tracking-wider transition-colors ${
                    item.status === "success"
                      ? "text-green-500"
                      : item.status === "error"
                        ? "text-red-500 hover:bg-red-500/10"
                        : "text-foreground hover:bg-(--accent-color) hover:text-white"
                  }`}
                >
                  {item.status === "saving"
                    ? "Guardando..."
                    : item.status === "success"
                      ? "¡Guardado!"
                      : item.status === "error"
                        ? "Reintentar"
                        : "Guardar en Búnker"}
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
          );
        })}
      </div>
    </div>
  );
}
