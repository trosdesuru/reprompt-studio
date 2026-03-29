import { ExtractedPromptData } from "./parsers/types";
import { cleanNullBytes } from "./parsers/stringUtils";
import { parseA1111 } from "./parsers/a1111Parser";
import { parseComfy } from "./parsers/comfyParser";

export type { ExtractedPromptData };

export function parsePromptData(rawText: string): ExtractedPromptData {
  const cleanText = cleanNullBytes(rawText);

  // Detector de Formato
  if (cleanText.startsWith("{") && cleanText.endsWith("}")) {
    try {
      const jsonObj = JSON.parse(cleanText);
      return parseComfy(jsonObj, cleanText);
    } catch (e) {
      return parseA1111(cleanText);
    }
  }

  return parseA1111(cleanText);
}
