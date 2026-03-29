import { useState } from "react";
import extract from "png-chunks-extract";
import text from "png-chunk-text";
import { parseA1111Parameters, ExtractedPromptData } from "../utils/promptParser";
import { ExtractionError } from "./errors/AppErrors";
import { handleError } from "./errors/ErrorHandler";
import { getRawTextFromFile } from "@/features/extractor/utils/fileExtractors";

export function usePromptExtractor() {
  const [isExtracting, setIsExtracting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [extractedData, setExtractedData] = useState<ExtractedPromptData | null>(null);

  const extractFromFile = async (file: File) => {
    setIsExtracting(true);
    setError(null);
    setExtractedData(null);

    try {
      const rawText = await getRawTextFromFile(file);

      if (!rawText) {
        throw new ExtractionError(
          "No se detectaron metadatos de IA en este archivo.",
          "NO_METADATA",
        );
      }

      const buffer = await file.arrayBuffer();
      const uint8 = new Uint8Array(buffer);
      const chunks = extract(uint8);

      const textChunks = chunks.filter(
        (chunk: any) => chunk.name === "tEXt" || chunk.name === "iTXt",
      );

      if (textChunks.length === 0) {
        throw new ExtractionError("No se encontraron metadatos en esta imagen.", "NO_METADATA");
      }

      let foundParameters = false;

      for (const chunk of textChunks) {
        try {
          const decoded = text.decode(chunk.data);

          if (decoded.keyword === "parameters" || decoded.keyword === "Comment") {
            const parsedData = parseA1111Parameters(decoded.text);
            setExtractedData(parsedData);

            foundParameters = true;
            break;
          }
        } catch (err: unknown) {
          const cleanMessage = handleError(err, "Extractor");
          setError(cleanMessage);
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
