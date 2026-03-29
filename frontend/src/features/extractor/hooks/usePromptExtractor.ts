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

export interface SkippedFile {
  name: string;
  reason: string;
}

export function usePromptExtractor() {
  const [isExtracting, setIsExtracting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [batch, setBatch] = useState<BatchItem[]>([]);
  const [skippedFiles, setSkippedFiles] = useState<SkippedFile[]>([]); // 🟢 NUEVO ESTADO

  const processFiles = useCallback(async (files: File[], fileRejections: any[] = []) => {
    setIsExtracting(true);
    setError(null);

    let allFilesToProcess: File[] = [];
    const currentSkipped: SkippedFile[] = fileRejections.map((r) => ({
      name: r.file.name,
      reason: "Formato no aceptado o archivo inválido.",
    }));

    try {
      // 1. Expandir ZIPs o aceptar múltiples archivos sueltos
      for (const file of files) {
        if (
          file.type === "application/zip" ||
          file.name.endsWith(".zip") ||
          file.name.endsWith(".x-zip-compressed")
        ) {
          const unzipped = await extractFilesFromZip(file);
          allFilesToProcess = [...allFilesToProcess, ...unzipped.validFiles];
          currentSkipped.push(...unzipped.rejectedFiles);
        } else {
          allFilesToProcess.push(file);
        }
      }

      if (allFilesToProcess.length === 0 && currentSkipped.length === 0) {
        throw new Error("No se recibieron archivos válidos.");
      }

      // 2. Extraer metadata de cada archivo
      const newBatchItems: BatchItem[] = [];

      for (const file of allFilesToProcess) {
        try {
          const rawText = await getRawTextFromFile(file);
          if (!rawText) {
            currentSkipped.push({ name: file.name, reason: "Sin metadatos de IA detectados." });
            continue;
          }

          const parsedData = parsePromptData(rawText);
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
    setSkippedFiles([]);
    setError(null);
  }, [batch]);

  const clearSkipped = useCallback(() => {
    setSkippedFiles([]);
  }, []);

  return {
    processFiles,
    isExtracting,
    error,
    batch,
    skippedFiles,
    updateItemStatus,
    removeItem,
    clearBatch,
    clearSkipped,
  };
}
