import { useState, useCallback } from "react";
import { parsePromptData, ExtractedPromptData } from "../utils/promptParser";
import { getRawTextFromFile } from "../utils/fileExtractors";
import { extractFilesFromZip } from "../utils/fileExtractors/zipExtractor";
import { handleError } from "@/src/utils/errors/ErrorHandler";

export interface BatchItem {
  id: string;
  file: File;
  previewUrl: string | null;
  data: ExtractedPromptData;
  status: "idle" | "saving" | "success" | "error";
}

export function usePromptExtractor() {
  const [isExtracting, setIsExtracting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [batch, setBatch] = useState<BatchItem[]>([]);

  const processFiles = useCallback(async (files: File[]) => {
    setIsExtracting(true);
    setError(null);

    let allFilesToProcess: File[] = [];

    try {
      // 1. Expandir ZIPs si los hay
      for (const file of files) {
        if (file.type === "application/zip" || file.name.endsWith(".zip")) {
          const unzipped = await extractFilesFromZip(file);
          allFilesToProcess = [...allFilesToProcess, ...unzipped];
        } else {
          allFilesToProcess.push(file);
        }
      }

      if (allFilesToProcess.length === 0) {
        throw new Error("No se encontraron archivos válidos para procesar.");
      }

      // 2. Extraer metadata de cada archivo
      const newBatchItems: BatchItem[] = [];

      for (const file of allFilesToProcess) {
        try {
          const rawText = await getRawTextFromFile(file);
          if (!rawText) continue; // Ignoramos si no hay metadatos

          const parsedData = parsePromptData(rawText);

          // Generar preview solo si es imagen
          const previewUrl = file.type.startsWith("image/") ? URL.createObjectURL(file) : null;

          newBatchItems.push({
            id: crypto.randomUUID(),
            file,
            previewUrl,
            data: parsedData,
            status: "idle",
          });
        } catch (e) {
          console.warn(`No se pudo procesar ${file.name}:`, e);
        }
      }

      if (newBatchItems.length === 0) {
        throw new Error(
          "Se analizaron los archivos pero ninguno contenía metadatos de IA válidos.",
        );
      }

      // 3. Añadir a la cola existente
      setBatch((prev) => [...prev, ...newBatchItems]);
    } catch (err: unknown) {
      setError(handleError(err, "ExtractorBatch"));
    } finally {
      setIsExtracting(false);
    }
  }, []);

  const updateItemStatus = useCallback((id: string, status: BatchItem["status"]) => {
    setBatch((prev) => prev.map((item) => (item.id === id ? { ...item, status } : item)));
  }, []);

  const removeItem = useCallback((id: string) => {
    setBatch((prev) => {
      const item = prev.find((p) => p.id === id);
      if (item?.previewUrl) URL.revokeObjectURL(item.previewUrl);
      return prev.filter((p) => p.id !== id);
    });
  }, []);

  const clearBatch = useCallback(() => {
    batch.forEach((item) => {
      if (item.previewUrl) URL.revokeObjectURL(item.previewUrl);
    });
    setBatch([]);
    setError(null);
  }, [batch]);

  return { processFiles, isExtracting, error, batch, updateItemStatus, removeItem, clearBatch };
}
