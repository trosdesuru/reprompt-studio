import { ExtractedPromptData } from "./parsers/types";
import { cleanNullBytes } from "./parsers/stringUtils";
import { parseA1111 } from "./parsers/a1111Parser";
import { parseComfy } from "./parsers/comfyParser";
import { parseMidjourney } from "./parsers/midjourneyParser";

export type { ExtractedPromptData };

export function parsePromptData(rawText: string): ExtractedPromptData {
  const cleanText = cleanNullBytes(rawText);

  // 1. Si parece JSON (ComfyUI / Civitai)
  if (cleanText.startsWith("{") && cleanText.endsWith("}")) {
    try {
      const jsonObj = JSON.parse(cleanText);
      return parseComfy(jsonObj, cleanText);
    } catch (e) {
      // Si falla el JSON, intentamos tratarlo como A1111 por si es texto plano mal formado
      return parseA1111(cleanText);
    }
  }

  if (cleanText.includes("--ar") || cleanText.includes("--niji") || cleanText.includes("Job ID:")) {
    return parseMidjourney(cleanText, rawText);
  }

  // 2. Por defecto: Intentar parseo de Automatic1111 / Midjourney (texto plano)
  return parseA1111(cleanText);
}
