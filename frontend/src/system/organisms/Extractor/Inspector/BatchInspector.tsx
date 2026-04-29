import Link from "next/link";
import { useState } from "react";
import { BatchItem, SkippedFile } from "@/src/features/extractor/hooks/usePromptExtractor";
import { ExtractedPromptData } from "@/src/features/extractor/utils/promptParser";
import { Button } from "@/src/system/atoms/Button/Button";
import { IconTrash, IconDeviceFloppy, IconAlertTriangle, IconX } from "@tabler/icons-react";
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

  const handleSaveItem = async (item: BatchItem) => {
    if (item.status === "success") return;
    onUpdateStatus(item.id, "saving");

    try {
      let finalWidth = 0;
      let finalHeight = 0;
      let finalImageUrl: string | null = null;

      if (item.previewUrl && item.previewUrl.startsWith("blob:")) {
        const optimizedData = await optimizeAndLogImage(item.file);
        const archivoOptimizado = optimizedData.file;
        finalWidth = optimizedData.width;
        finalHeight = optimizedData.height;

        const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

        const ticketRes = await fetchSeguro(`${API_URL}/prompts/generate-upload-url`, {
          method: "POST",
          credentials: "include",
          body: JSON.stringify({
            file_name: archivoOptimizado.name,
            content_type: archivoOptimizado.type,
          }),
        });

        if (ticketRes.status === 403) {
          throw new Error("QUOTA_EXCEEDED");
        }

        if (!ticketRes.ok) throw new Error("No se pudo obtener el ticket de subida de R2");

        const ticketData = await ticketRes.json();
        const uploadUrl = ticketData.upload_url;

        const fetchOptions = {
          method: "PUT",
          headers: {
            "Content-Type": archivoOptimizado.type,
            "Cache-Control": "public, max-age=31536000, immutable",
          },
          body: archivoOptimizado,
        };

        const uploadRes = await fetch(uploadUrl, fetchOptions);

        if (!uploadRes.ok) {
          throw new Error("Fallo la subida física a Cloudflare R2");
        }

        finalImageUrl = ticketData.file_url;
      }

      const payload = {
        title: `${item.data.software || "IA"}`,
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
      if (err.message !== "QUOTA_EXCEEDED") {
        handleError(err, "SaveBatchItem");
      }
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
        if (typeof authState.checkAuth === "function") {
          await authState.checkAuth(true);
        }
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
              alcanzado su capacidad máxima de almacenamiento.
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

      <div className="space-y-6 animate-fade-in">
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
            <span className="text-(--accent-color)">{batch.length}</span> listos para studio
          </div>
          <div className="flex w-full sm:w-auto gap-3">
            <Button
              size="md"
              onClick={onClearAll}
              variant="tertiary"
              disabled={isGlobalLoading}
              className="text-sm!"
            >
              Descartar Todos
            </Button>
            <Button
              size="sm"
              variant="primary"
              onClick={handleSaveAll}
              isLoading={isGlobalLoading}
              className="text-sm! w-full sm:w-auto"
            >
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
                          : "Guardar en Mi Studio"}
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
    </>
  );
}
