import { useState, useCallback, useEffect } from "react";
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

  const closeUpgradeModal = useCallback(() => {
    setUpgradeModal(false);
  }, []);

  useEffect(() => {
    return () => {
      batch.forEach((item) => {
        if (item.previewUrl) {
          URL.revokeObjectURL(item.previewUrl);
          console.log(`🗑️ RAM liberada: ${item.id}`);
        }
      });
    };
  }, [batch]);

  const processFiles = useCallback(async (files: File[], fileRejections: any[] = []) => {
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
      for (const file of files) {
        if (
          file.type === "application/zip" ||
          file.name.endsWith(".zip") ||
          file.name.endsWith(".x-zip-compressed")
        ) {
          const unzipped = await extractFilesFromZip(file, maxFilesAllowed);
          allFilesToProcess = [...allFilesToProcess, ...unzipped.validFiles];
          currentSkipped.push(...unzipped.rejectedFiles);

          if (unzipped.limitReached && user?.role === "voyager") {
            setUpgradeModal(true);
          }
        } else {
          if (allFilesToProcess.length < maxFilesAllowed) {
            allFilesToProcess.push(file);
          } else {
            currentSkipped.push({ name: file.name, reason: "Límite de subida alcanzado" });
            if (user?.role === "voyager") setUpgradeModal(true);
          }
        }
      }

      if (allFilesToProcess.length === 0 && currentSkipped.length === 0) {
        throw new Error("No se recibieron archivos válidos.");
      }

      const newBatchItems: BatchItem[] = [];

      for (const file of allFilesToProcess) {
        try {
          const rawText = await getRawTextFromFile(file);
          let parsedData: ExtractedPromptData;

          if (!rawText) {
            if (file.type.startsWith("image/")) {
              parsedData = {
                prompt: "",
                rawText: "",
                software: "Desconocido",
                negativePrompt: "",
                model: "",
                sampler: "",
                steps: "",
                cfgScale: "",
                seed: "",
                resolution: "",
                loras: [],
                triggerWords: [],
                extractionConfidence: 0,
              };
            } else {
              currentSkipped.push({ name: file.name, reason: "Sin metadatos de IA detectados." });
              continue;
            }
          } else {
            parsedData = parsePromptData(rawText);
          }

          const previewUrl = file.type.startsWith("image/") ? URL.createObjectURL(file) : null;

          newBatchItems.push({
            id: crypto.randomUUID(),
            file,
            previewUrl,
            data: parsedData,
            status: "idle",
          });
        } catch (e) {
          currentSkipped.push({ name: file.name, reason: "Error al procesar el archivo." });
        }
      }

      setSkippedFiles((prev) => [...prev, ...currentSkipped]);

      if (newBatchItems.length > 0) {
        setBatch((prev) => [...prev, ...newBatchItems]);
      } else if (currentSkipped.length > 0) {
        setError(
          `Se descartaron ${currentSkipped.length} archivos por no ser válidos o no tener metadatos.`,
        );
      }
    } catch (err: unknown) {
      setError(handleError(err, "ExtractorBatch"));
    } finally {
      setIsExtracting(false);
    }
  }, []);

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
      if (item?.previewUrl) URL.revokeObjectURL(item.previewUrl);
      return prev.filter((p) => p.id !== id);
    });
  }, []);

  const clearBatch = useCallback(() => {
    setBatch((prev) => {
      prev.forEach((item) => {
        if (item.previewUrl) URL.revokeObjectURL(item.previewUrl);
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
