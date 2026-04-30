import { useState, useCallback, useEffect, useRef } from "react";
import { parsePromptData, ExtractedPromptData } from "../utils/promptParser";
import { getRawTextFromFile } from "../utils/fileExtractors";
import { extractFilesFromZip } from "../utils/fileExtractors/zipExtractor";
import { handleError } from "@/src/utils/errors/ErrorHandler";
import { useAuthStore } from "@/src/store/authStore";

export interface BatchItem {
  id: string;
  file: File;
  previewUrl: string | null;
  data: ExtractedPromptData;
  status: "idle" | "saving" | "success" | "error";
}

export interface SkippedFile {
  name: string;
  reason: string;
}

export function usePromptExtractor() {
  const [isExtracting, setIsExtracting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [batch, setBatch] = useState<BatchItem[]>([]);
  const [skippedFiles, setSkippedFiles] = useState<SkippedFile[]>([]);
  const [upgradeModal, setUpgradeModal] = useState(false);

  const { user } = useAuthStore();

  const activeUrls = useRef<Set<string>>(new Set());

  const closeUpgradeModal = useCallback(() => {
    setUpgradeModal(false);
  }, []);

  useEffect(() => {
    return () => {
      activeUrls.current.forEach((url) => {
        URL.revokeObjectURL(url);
        if (process.env.NODE_ENV === "development") {
          console.log(`🗑️ RAM liberada (Cleanup): ${url}`);
        }
      });
      activeUrls.current.clear();
    };
  }, []);

  const processFiles = useCallback(
    async (files: File[], fileRejections: any[] = []) => {
      setUpgradeModal(false);
      setIsExtracting(true);
      setError(null);

      let allFilesToProcess: File[] = [];
      const currentSkipped: SkippedFile[] = fileRejections.map((r) => ({
        name: r.file.name,
        reason: "Formato no aceptado o archivo inválido.",
      }));

      const maxFilesAllowed = user?.role === "artist" ? 200 : 10;

      try {
        // 1. Fase de expansión (ZIPs) - Sigue siendo igual
        for (const file of files) {
          if (
            file.type === "application/zip" ||
            file.name.endsWith(".zip") ||
            file.name.endsWith(".x-zip-compressed")
          ) {
            const unzipped = await extractFilesFromZip(file, maxFilesAllowed);
            allFilesToProcess = [...allFilesToProcess, ...unzipped.validFiles];
            currentSkipped.push(...unzipped.rejectedFiles);
            if (unzipped.limitReached && user?.role === "voyager") setUpgradeModal(true);
          } else {
            if (allFilesToProcess.length < maxFilesAllowed) {
              allFilesToProcess.push(file);
            } else {
              currentSkipped.push({ name: file.name, reason: "Límite de subida alcanzado" });
              if (user?.role === "voyager") setUpgradeModal(true);
            }
          }
        }

        // 🚀 2. LA MAGIA: PROCESAMIENTO CONCURRENTE LIMITADO (2 a la vez)
        const newBatchItems: BatchItem[] = [];
        const queue = [...allFilesToProcess]; // Copiamos la lista de archivos

        // Definimos un "trabajador" que procesa la cola
        const worker = async () => {
          while (queue.length > 0) {
            const file = queue.shift(); // Sacamos el primer archivo de la lista
            if (!file) continue;

            try {
              // Extracción de texto (Esta es la parte pesada de CPU)
              const rawText = await getRawTextFromFile(file);

              if (rawText) {
                console.group(`🔍 Metadata Debug: ${file.name}`);
                console.log("Raw Text:", rawText);
                console.log("Software Detectado:", parsePromptData(rawText).software);
                console.groupEnd();
              }

              let parsedData = rawText
                ? parsePromptData(rawText)
                : {
                    prompt: "",
                    rawText: "",
                    software: "Desconocido",
                    negativePrompt: "",
                    model: "",
                    loras: [],
                    extractionConfidence: 0,
                  };

              const previewUrl = file.type.startsWith("image/") ? URL.createObjectURL(file) : null;

              newBatchItems.push({
                id: crypto.randomUUID(),
                file,
                previewUrl,
                data: parsedData as ExtractedPromptData,
                status: "idle",
              });
            } catch (e) {
              currentSkipped.push({ name: file.name, reason: "Error al procesar el archivo." });
            }
          }
        };

        // Lanzamos exactamente 2 trabajadores.
        // El ventilador de tu Mac bajará de revoluciones al instante.
        await Promise.all([worker(), worker()]);

        // 3. Actualización de estado final
        setSkippedFiles((prev) => [...prev, ...currentSkipped]);
        if (newBatchItems.length > 0) setBatch((prev) => [...prev, ...newBatchItems]);
      } catch (err: unknown) {
        setError(handleError(err, "ExtractorBatch"));
      } finally {
        setIsExtracting(false);
      }
    },
    [user],
  );

  const updateItemStatus = useCallback((id: string, status: BatchItem["status"]) => {
    setBatch((prev) => prev.map((item) => (item.id === id ? { ...item, status } : item)));
  }, []);

  const updateItemData = useCallback((id: string, newData: Partial<ExtractedPromptData>) => {
    setBatch((prev) =>
      prev.map((item) => (item.id === id ? { ...item, data: { ...item.data, ...newData } } : item)),
    );
  }, []);

  const removeItem = useCallback((id: string) => {
    setBatch((prev) => {
      const item = prev.find((p) => p.id === id);
      if (item?.previewUrl) {
        URL.revokeObjectURL(item.previewUrl);
        activeUrls.current.delete(item.previewUrl);
      }
      return prev.filter((p) => p.id !== id);
    });
  }, []);

  const clearBatch = useCallback(() => {
    setBatch((prev) => {
      prev.forEach((item) => {
        if (item.previewUrl) {
          URL.revokeObjectURL(item.previewUrl);
          activeUrls.current.delete(item.previewUrl);
        }
      });
      return [];
    });
    setSkippedFiles([]);
    setError(null);
  }, []);

  const clearSkipped = useCallback(() => {
    setSkippedFiles([]);
  }, []);

  return {
    isExtracting,
    error,
    batch,
    skippedFiles,
    processFiles,
    upgradeModal,
    updateItemStatus,
    updateItemData,
    removeItem,
    clearBatch,
    clearSkipped,
    closeUpgradeModal,
  };
}
