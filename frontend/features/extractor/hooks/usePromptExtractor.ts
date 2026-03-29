import { useState, useCallback } from "react";
import { parsePromptData, ExtractedPromptData } from "../utils/promptParser";
import { getRawTextFromFile } from "../utils/fileExtractors";

export function usePromptExtractor() {
  const [isExtracting, setIsExtracting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [extractedData, setExtractedData] = useState<ExtractedPromptData | null>(null);

  const extractFromFile = useCallback(async (file: File) => {
    setIsExtracting(true);
    setError(null);
    setExtractedData(null);

    try {
      // 1. Delegamos la extracción física del texto
      const rawText = await getRawTextFromFile(file);

      if (!rawText) {
        throw new Error("No se detectaron metadatos de IA en este archivo.");
      }

      // 2. Delegamos el parseo lógico del contenido
      const parsedData = parsePromptData(rawText);
      setExtractedData(parsedData);
    } catch (err: any) {
      setError(err.message || "Error al procesar el archivo");
    } finally {
      setIsExtracting(false);
    }
  }, []);

  const resetExtraction = useCallback(() => {
    setExtractedData(null);
    setError(null);
  }, []);

  return { extractFromFile, isExtracting, error, extractedData, resetExtraction };
}
