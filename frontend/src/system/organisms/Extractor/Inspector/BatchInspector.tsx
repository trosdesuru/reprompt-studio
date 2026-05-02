import Link from "next/link";
import { useState } from "react";
import { BatchItem, SkippedFile } from "@/src/features/extractor/hooks/usePromptExtractor";
import {
  ExtractedPromptData,
  generateSmartTitle,
} from "@/src/features/extractor/utils/promptParser";
import { Button } from "@/src/system/atoms/Button/Button";
import {
  IconTrash,
  IconDeviceFloppy,
  IconAlertTriangle,
  IconX,
  IconInfoCircle,
} from "@tabler/icons-react";
import { api } from "@/src/services/api";
import { handleError } from "@/src/utils/errors/ErrorHandler";
import { useAuthStore } from "@/src/store/authStore";
import toast from "react-hot-toast";
import { useNotificationStore } from "@/src/store/notificationStore";
import { fetchSeguro } from "@/src/services/api/client";
import { optimizeAndLogImage } from "@/src/utils/lib/image-optimizer";
import { Modal } from "@/src/system/molecules/Modal/Modal";
import { NeoIconBadge } from "@/src/system/atoms/Badge/NeoIconBadge";

interface Props {
  batch: BatchItem[];
  skippedFiles: SkippedFile[];
  onUpdateStatus: (id: string, status: BatchItem["status"]) => void;
  onUpdateItemData: (id: string, newData: Partial<ExtractedPromptData>) => void;
  onRemoveItem: (id: string) => void;
  onClearAll: () => void;
  onClearSkipped: () => void;
}

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
  const [isQuotaModalOpen, setIsQuotaModalOpen] = useState(false);

  const notify = useNotificationStore((state) => state.notify);
  const user = useAuthStore((state) => state.user);

  // 🟢 Función para leer dimensiones sin destruir el ADN de la imagen
  const getImageDimensions = (file: File): Promise<{ width: number; height: number }> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        resolve({ width: img.width, height: img.height });
        URL.revokeObjectURL(img.src);
      };
      img.onerror = () => resolve({ width: 0, height: 0 });
      img.src = URL.createObjectURL(file);
    });
  };

  // ... (Tu lógica handleSaveItem y handleSaveAll se mantiene IDÉNTICA) ...
  const handleSaveItem = async (item: BatchItem) => {
    if (item.status === "success") return;
    onUpdateStatus(item.id, "saving");

    try {
      let finalWidth = 0;
      let finalHeight = 0;
      let finalImageUrl: string | null = null;

      if (item.previewUrl && item.previewUrl.startsWith("blob:")) {
        // 🟢 1. LÓGICA DE TIERS (Identificamos si es Premium)
        // Ajusta los roles según los que uses en tu base de datos ("Artist", "Artist Pro", etc.)
        const isPremium = user?.role === "Artist" || user?.role === "Artist Pro";

        let fileToUpload: File;

        if (isPremium) {
          // 💎 PREMIUM: Subimos archivo puro (Mantiene metadatos, pesa más)
          const dims = await getImageDimensions(item.file);
          finalWidth = dims.width;
          finalHeight = dims.height;
          fileToUpload = item.file;
        } else {
          // 🆓 GRATIS: Optimizamos (Destruye metadatos, aligera peso en R2)
          const optimizedData = await optimizeAndLogImage(item.file);
          fileToUpload = optimizedData.file;
          finalWidth = optimizedData.width;
          finalHeight = optimizedData.height;
        }

        const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

        const ticketRes = await fetchSeguro(`${API_URL}/prompts/generate-upload-url`, {
          method: "POST",
          credentials: "include",
          body: JSON.stringify({
            file_name: fileToUpload.name,
            content_type: fileToUpload.type,
          }),
        });

        if (ticketRes.status === 403) throw new Error("QUOTA_EXCEEDED");
        if (!ticketRes.ok) throw new Error("No se pudo obtener el ticket de subida de R2");

        const ticketData = await ticketRes.json();
        const uploadUrl = ticketData.upload_url;

        const fetchOptions = {
          method: "PUT",
          headers: {
            "Content-Type": fileToUpload.type,
            "Cache-Control": "public, max-age=31536000, immutable",
          },
          body: fileToUpload,
        };

        const uploadRes = await fetch(uploadUrl, fetchOptions);

        if (!uploadRes.ok) throw new Error("Fallo la subida física a Cloudflare R2");

        finalImageUrl = ticketData.file_url;
      }

      const payload = {
        title:
          item.data.title ||
          generateSmartTitle(item.file.name, item.data.prompt, item.data.software),
        prompt: item.data.prompt,
        negative_prompt: item.data.negativePrompt,
        software: item.data.software,
        model: item.data.model,
        sampler: item.data.sampler,
        steps: item.data.steps,
        cfg_scale: item.data.cfgScale,
        seed: item.data.seed,
        resolution: item.data.resolution,
        width: finalWidth,
        height: finalHeight,
        image_url: finalImageUrl,
        extra_data: {
          loras: item.data.loras || [],
          triggerWords: item.data.triggerWords || [],
        },
      };

      await api.savePrompt(payload);
      onUpdateStatus(item.id, "success");

      notify("Studio", "Prompt guardado correctamente", "success");

      setTimeout(() => {
        onRemoveItem(item.id);
      }, 1000);
    } catch (err: any) {
      if (err.message !== "QUOTA_EXCEEDED") handleError(err, "SaveBatchItem");
      onUpdateStatus(item.id, "error");
      throw err;
    }
  };

  const handleSaveAll = async () => {
    setIsGlobalLoading(true);
    try {
      const results = await Promise.allSettled(
        batch.map((item: BatchItem) => handleSaveItem(item)),
      );
      const fulfilled = results.filter(
        (r): r is PromiseFulfilledResult<any> => r.status === "fulfilled",
      );
      const rejected = results.filter((r): r is PromiseRejectedResult => r.status === "rejected");
      const hitQuotaLimit = rejected.some((r) => r.reason?.message === "QUOTA_EXCEEDED");

      if (hitQuotaLimit) {
        setIsQuotaModalOpen(true);
      } else if (rejected.length > 0) {
        toast.error(`Se han guardado ${fulfilled.length} imágenes. ${rejected.length} fallaron.`, {
          duration: 5000,
        });
      } else {
        toast.success("¡Lote guardado con éxito!");
      }

      if (fulfilled.length > 0) {
        const authState = useAuthStore.getState();
        if (typeof authState.checkAuth === "function") await authState.checkAuth(true);
      }
    } catch (error) {
      console.error("Error crítico en el lote", error);
      toast.error("Ocurrió un error inesperado al procesar el lote.");
    } finally {
      setIsGlobalLoading(false);
    }
  };

  return (
    <>
      <Modal isOpen={isQuotaModalOpen} onClose={() => setIsQuotaModalOpen(false)}>
        {/* Modal de Cuota Intacto */}
        <div className="p-8 flex flex-col items-center text-center space-y-6">
          <NeoIconBadge variant="danger" className="mb-2">
            <IconAlertTriangle size={32} stroke={2} />
          </NeoIconBadge>
          <div className="space-y-2">
            <h2 className="text-2xl font-black font-mono uppercase tracking-widest text-foreground">
              Límite Alcanzado
            </h2>
            <p className="text-muted-foreground font-mono text-sm leading-relaxed">
              Tu plan actual{" "}
              <strong className="text-foreground uppercase">({user?.role || "Voyager"})</strong> ha
              alcanzado su capacidad máxima.
            </p>
          </div>
          <div className="bg-muted/30 border border-border p-4 w-full flex flex-col gap-2">
            <div className="flex justify-between font-mono text-xs">
              <span>Imágenes Guardadas</span>
              <span className="font-bold">
                {user?.prompts_count || 0} / {user?.prompts_limit || 50}
              </span>
            </div>
            <div className="h-2 w-full bg-border overflow-hidden">
              <div className="h-full bg-red-500 w-full animate-pulse" />
            </div>
          </div>
          <div className="flex flex-col w-full gap-3 pt-4">
            <Link href="/settings/billing" className="w-full">
              <Button variant="primary" className="w-full justify-center">
                Mejorar Plan
              </Button>
            </Link>
            <Button
              variant="tertiary"
              onClick={() => setIsQuotaModalOpen(false)}
              className="w-full justify-center"
            >
              Entendido
            </Button>
          </div>
        </div>
      </Modal>

      <div className="space-y-6 animate-fade-in w-full pb-20">
        {/* ARCHIVOS DESCARTADOS (Minimizado) */}
        {skippedFiles.length > 0 && (
          <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-4 relative shadow-sm">
            <button
              onClick={onClearSkipped}
              className="absolute top-3 right-3 text-orange-700/50 hover:text-orange-900 transition-colors"
            >
              <IconX size={18} />
            </button>
            <div className="flex items-center gap-2 text-orange-600 font-semibold text-sm mb-3">
              <IconAlertTriangle size={16} /> Se descartaron {skippedFiles.length} archivos
            </div>
            <div className="max-h-24 overflow-y-auto custom-scrollbar">
              <ul className="text-xs font-mono text-orange-800/80 space-y-1.5">
                {skippedFiles.map((f, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="font-bold truncate max-w-[40%]" title={f.name}>
                      {f.name}
                    </span>
                    <span className="opacity-70 truncate flex-1">{f.reason}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* 🎛️ CONTROLES GLOBALES (Más limpios) */}
        <div className="flex flex-col sm:flex-row justify-between items-center bg-background border border-border/50 shadow-sm rounded-xl p-3 px-5 gap-4 sticky top-4 z-40">
          <div className="font-mono text-sm font-semibold text-muted-foreground">
            <span className="text-accent font-bold">{batch.length}</span> EXTRACCIONES LISTAS
          </div>
          <div className="flex w-full sm:w-auto gap-3">
            <Button size="sm" onClick={onClearAll} variant="tertiary" disabled={isGlobalLoading}>
              Descartar Todos
            </Button>
            <Button
              size="sm"
              variant="primary"
              onClick={handleSaveAll}
              isLoading={isGlobalLoading}
              className="shadow-md"
            >
              <IconDeviceFloppy size={16} className="mr-1.5" /> Guardar Todo
            </Button>
          </div>
        </div>

        {/* 🖼️ GRID DE BATCH ITEMS (El verdadero Refactor Visual) */}
        {/* 🟢 Pasamos de 4 columnas apretadas a 3 o 2 columnas anchas para leer bien el prompt */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 items-start">
          {batch.map((item) => {
            const isManual = item.data.software === "Desconocido";
            return (
              <div
                key={item.id}
                className={`bg-background border shadow-xs rounded-xl flex flex-col relative group overflow-hidden transition-all duration-300 ${
                  item.status === "success"
                    ? "opacity-40 grayscale pointer-events-none scale-95 border-green-500/30"
                    : "border-border/60 hover:shadow-md hover:border-border"
                }`}
              >
                {/* 1. Cabecera Visual y Título */}
                <div className="flex items-center gap-3 p-3 border-b border-border/40 bg-muted/10">
                  <div className="w-12 h-12 shrink-0 rounded-md overflow-hidden bg-black/5 border border-border/50 relative">
                    {item.previewUrl ? (
                      <img
                        src={item.previewUrl}
                        alt="preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground/30">
                        <IconInfoCircle size={16} />
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col flex-1 overflow-hidden">
                    <span
                      className="text-xs font-semibold text-foreground truncate"
                      title={item.file.name}
                    >
                      {item.file.name}
                    </span>
                    <span
                      className={`text-[10px] font-mono font-bold uppercase ${isManual ? "text-yellow-600" : "text-accent"}`}
                    >
                      {item.data.software}
                    </span>
                  </div>
                  <button
                    onClick={() => onRemoveItem(item.id)}
                    disabled={item.status === "saving"}
                    className="p-1.5 text-muted-foreground hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
                    title="Descartar imagen"
                  >
                    <IconTrash size={16} stroke={2} />
                  </button>
                </div>

                {/* 2. Cuerpo del Prompt (Compacto y Scrolleable) */}
                <div className="p-4 flex flex-col gap-3 flex-1 bg-background">
                  {isManual ? (
                    <div className="flex flex-col gap-3 animate-in fade-in">
                      <div className="text-xs font-medium text-amber-600/80 bg-amber-500/10 p-2 rounded flex items-center gap-2">
                        <IconAlertTriangle size={14} /> Faltan metadatos. Rellena los datos
                        manualmente.
                      </div>
                      <textarea
                        placeholder="Escribe el prompt de la imagen aquí..."
                        className="w-full text-xs font-mono p-3 border border-border/50 rounded-md bg-transparent focus:outline-none focus:border-accent resize-none min-h-25 max-h-37.5 custom-scrollbar transition-colors"
                        value={item.data.prompt || ""}
                        onChange={(e) => onUpdateItemData(item.id, { prompt: e.target.value })}
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          placeholder="Modelo (Ej. Midjourney)"
                          className="w-full text-xs font-mono p-2 border border-border/50 rounded-md bg-transparent focus:outline-none focus:border-accent"
                          value={item.data.model || ""}
                          onChange={(e) => onUpdateItemData(item.id, { model: e.target.value })}
                        />
                        <input
                          type="text"
                          placeholder="Sampler (Ej. Euler)"
                          className="w-full text-xs font-mono p-2 border border-border/50 rounded-md bg-transparent focus:outline-none focus:border-accent"
                          value={item.data.sampler || ""}
                          onChange={(e) => onUpdateItemData(item.id, { sampler: e.target.value })}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col h-full">
                      {/* 🟢 Bloque de Prompt con altura máxima y scroll */}
                      <div className="relative group/prompt">
                        <div className="text-[10px] font-bold text-muted-foreground uppercase mb-1">
                          Main Prompt
                        </div>
                        <div className="text-xs font-mono text-foreground/80 leading-relaxed bg-muted/20 p-2.5 rounded-md border border-border/30 max-h-32 overflow-y-auto custom-scrollbar">
                          {item.data.prompt || (
                            <span className="italic opacity-50">No detectado.</span>
                          )}
                        </div>
                      </div>

                      {/* 🟢 Parámetros técnicos en píldoras */}
                      {(item.data.model || item.data.resolution || item.data.steps) && (
                        <div className="flex flex-wrap gap-1.5 mt-3">
                          {item.data.model && (
                            <span
                              className="px-2 py-0.5 bg-accent/10 text-accent border border-accent/20 rounded text-[10px] font-mono truncate max-w-30"
                              title={item.data.model}
                            >
                              ⚙️ {item.data.model}
                            </span>
                          )}
                          {item.data.resolution && (
                            <span className="px-2 py-0.5 bg-muted text-muted-foreground border border-border/50 rounded text-[10px] font-mono">
                              📐 {item.data.resolution}
                            </span>
                          )}
                          {item.data.steps && (
                            <span className="px-2 py-0.5 bg-muted text-muted-foreground border border-border/50 rounded text-[10px] font-mono">
                              👣 {item.data.steps}
                            </span>
                          )}
                          {item.data.sampler && (
                            <span className="px-2 py-0.5 bg-muted text-muted-foreground border border-border/50 rounded text-[10px] font-mono">
                              🧪 {item.data.sampler}
                            </span>
                          )}
                          {item.data.loras && item.data.loras.length > 0 && (
                            <>
                              {item.data.loras.map((lora, idx) => (
                                <span
                                  key={`lora-${idx}`}
                                  className="px-2 py-0.5 bg-purple-500/10 text-purple-600 border border-purple-500/20 rounded text-[10px] font-mono truncate max-w-40"
                                  title={`${lora.name} (Fuerza: ${lora.strength})`}
                                >
                                  🔌 {lora.name} ({lora.strength})
                                </span>
                              ))}
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* 3. Botón de Acción Individual */}
                <div className="p-3 border-t border-border/40 bg-muted/5">
                  <Button
                    variant={item.status === "error" ? "tertiary" : "secondary"}
                    size="sm"
                    className="w-full justify-center text-xs"
                    onClick={() => handleSaveItem(item)}
                    isLoading={item.status === "saving"}
                    disabled={item.status === "success"}
                  >
                    {item.status === "success"
                      ? "¡Guardado!"
                      : item.status === "error"
                        ? "Fallo al guardar. Reintentar"
                        : "Guardar individualmente"}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
