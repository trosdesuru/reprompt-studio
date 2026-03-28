import { useState, useCallback } from "react";
import extract from "png-chunks-extract";
import text from "png-chunk-text";
import { parseA1111Parameters, ExtractedPromptData } from "../utils/promptParser";

export function usePromptExtractor() {
  const [isExtracting, setIsExtracting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [extractedData, setExtractedData] = useState<ExtractedPromptData | null>(null);

  const extractFromFile = useCallback(async (file: File) => {
    setIsExtracting(true);
    setError(null);
    setExtractedData(null);

    try {
      // 1. Validación de seguridad básica
      if (file.type !== "image/png") {
        throw new Error("Formato no soportado. Por favor, sube una imagen PNG generada por IA.");
      }

      // 2. Leemos el archivo en la memoria local del navegador (ArrayBuffer)
      const buffer = await file.arrayBuffer();
      const uint8 = new Uint8Array(buffer);

      // 3. Extraemos todos los fragmentos (chunks) del archivo PNG
      const chunks = extract(uint8);

      // 4. Filtramos solo los fragmentos diseñados para almacenar texto (tEXt o iTXt)
      const textChunks = chunks.filter(
        (chunk: any) => chunk.name === "tEXt" || chunk.name === "iTXt",
      );

      if (textChunks.length === 0) {
        throw new Error("No se encontraron metadatos ocultos en esta imagen.");
      }

      let foundParameters = false;

      // 5. Iteramos sobre los fragmentos de texto buscando la huella de la IA
      for (const chunk of textChunks) {
        try {
          const decoded = text.decode(chunk.data);

          // La convención de Stable Diffusion es usar la clave "parameters"
          if (decoded.keyword === "parameters" || decoded.keyword === "Comment") {
            const parsedData = parseA1111Parameters(decoded.text);
            setExtractedData(parsedData);
            foundParameters = true;
            break; // Si lo encontramos, dejamos de buscar
          }
        } catch (e) {
          // Ignoramos fragmentos corruptos de forma silenciosa
          continue;
        }
      }

      if (!foundParameters) {
        throw new Error(
          "La imagen tiene texto oculto, pero no coincide con el estándar de prompts de IA.",
        );
      }
    } catch (err: any) {
      setError(err.message || "Ocurrió un error desconocido al leer el archivo.");
    } finally {
      setIsExtracting(false);
    }
  }, []);

  const resetExtraction = useCallback(() => {
    setExtractedData(null);
    setError(null);
  }, []);

  return {
    extractFromFile,
    isExtracting,
    error,
    extractedData,
    resetExtraction,
  };
}
