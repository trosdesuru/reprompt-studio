import { useState } from "react";
import extract from "png-chunks-extract";
import text from "png-chunk-text";
import { parseA1111Parameters, ExtractedPromptData } from "@/src/utils/promptParser";

export function usePromptExtractor() {
  const [isExtracting, setIsExtracting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [extractedData, setExtractedData] = useState<ExtractedPromptData | null>(null);

  const extractFromFile = async (file: File) => {
    setIsExtracting(true);
    setError(null);
    setExtractedData(null);

    try {
      if (file.type !== "image/png") {
        throw new Error("Formato no soportado. Sube una imagen PNG generada por IA.");
      }

      // 1. Leemos el archivo físico usando la API del navegador (Coste de servidor 0$)
      const buffer = await file.arrayBuffer();
      const uint8 = new Uint8Array(buffer);

      // 2. Extraemos los bloques (chunks) del PNG
      const chunks = extract(uint8);

      // 3. Filtramos solo los bloques que contienen texto (tEXt o iTXt)
      const textChunks = chunks.filter(
        (chunk: any) => chunk.name === "tEXt" || chunk.name === "iTXt",
      );

      if (textChunks.length === 0) {
        throw new Error("No se encontraron metadatos en esta imagen.");
      }

      let foundParameters = false;

      // 4. Buscamos el bloque que contiene el "Prompt"
      for (const chunk of textChunks) {
        try {
          const decoded = text.decode(chunk.data);

          // Automatic1111 (Stable Diffusion) guarda la info en la clave "parameters"
          if (decoded.keyword === "parameters" || decoded.keyword === "Comment") {
            // Pasamos el texto bruto a nuestro Traductor Semántico
            const parsedData = parseA1111Parameters(decoded.text);
            setExtractedData(parsedData);
            foundParameters = true;
            break;
          }
        } catch (e) {
          // Si un bloque está corrupto, lo ignoramos y seguimos buscando
          continue;
        }
      }

      if (!foundParameters) {
        throw new Error(
          "La imagen tiene metadatos, pero no detectamos prompts de IA (Stable Diffusion/Midjourney).",
        );
      }
    } catch (err: any) {
      setError(err.message || "Error desconocido al procesar la imagen.");
    } finally {
      setIsExtracting(false);
    }
  };

  const resetExtraction = () => {
    setExtractedData(null);
    setError(null);
  };

  return { extractFromFile, isExtracting, error, extractedData, resetExtraction };
}
