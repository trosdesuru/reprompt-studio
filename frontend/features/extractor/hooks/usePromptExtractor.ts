import { useState, useCallback } from "react";
import extract from "png-chunks-extract";
import text from "png-chunk-text";
import exifr from "exifr";
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
      let rawText = null;

      // ==========================================
      // 🟦 MOTOR PNG (Chunks)
      // ==========================================
      if (file.type === "image/png") {
        const buffer = await file.arrayBuffer();
        const uint8 = new Uint8Array(buffer);
        const chunks = extract(uint8);
        const textChunks = chunks.filter(
          (chunk: any) => chunk.name === "tEXt" || chunk.name === "iTXt",
        );

        if (textChunks.length === 0) throw new Error("PNG sin metadatos ocultos.");

        for (const chunk of textChunks) {
          try {
            const decoded = text.decode(chunk.data);
            if (decoded.keyword === "parameters" || decoded.keyword === "Comment") {
              rawText = decoded.text;
              break;
            }
          } catch (e) {
            continue;
          }
        }
      }
      // ==========================================
      // 🟧 MOTOR JPEG (EXIF)
      // ==========================================
      else if (file.type === "image/jpeg" || file.type === "image/jpg") {
        // Le pedimos a exifr que extraiga absolutamente todo (EXIF, IPTC, XMP)
        const exifData = await exifr.parse(file, { userComment: true });

        // Stable Diffusion suele meter el prompt en el UserComment
        if (exifData && exifData.userComment) {
          // A veces viene como String, a veces como Uint8Array. Lo normalizamos:
          rawText =
            typeof exifData.userComment === "string"
              ? exifData.userComment
              : new TextDecoder("utf-8").decode(exifData.userComment);

          // Limpiamos la basura binaria que a veces mete A1111 al principio
          rawText = rawText.replace(/^UNICODE\x00/, "").trim();
          rawText = rawText.replace(/^ASCII\x00\x00\x00/, "").trim();
        } else if (exifData && exifData.parameters) {
          rawText = exifData.parameters;
        }
      }
      // ❌ FORMATO INVÁLIDO
      else {
        throw new Error("Formato no soportado. Sube una imagen PNG o JPEG.");
      }

      // ==========================================
      // 🧠 TRADUCTOR FINAL (Común para ambos)
      // ==========================================
      if (!rawText) {
        throw new Error("La imagen no contiene parámetros de generación IA.");
      }

      const parsedData = parseA1111Parameters(rawText);
      setExtractedData(parsedData);
    } catch (err: any) {
      setError(err.message || "Error desconocido al procesar la imagen.");
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
