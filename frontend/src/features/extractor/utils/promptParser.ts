import { ExtractedPromptData, ExtractedPromptSchema } from "./parsers/validation";
import { cleanNullBytes } from "./parsers/stringUtils";
import { parseA1111 } from "./parsers/a1111Parser";
import { parseComfy } from "./parsers/comfyParser";
import { parseMidjourney } from "./parsers/midjourneyParser";

export type { ExtractedPromptData };

export function parsePromptData(rawText: string): ExtractedPromptData {
  const cleanText = cleanNullBytes(rawText);
  let parsed: Partial<ExtractedPromptData>;

  if (cleanText.trim().startsWith("{")) {
    try {
      const jsonObj = JSON.parse(cleanText);
      parsed = parseComfy(jsonObj, cleanText);
    } catch {
      parsed = parseA1111(cleanText);
    }
  } else if (/--ar|--v|--style|--niji|Job ID:/i.test(cleanText)) {
    parsed = parseMidjourney(cleanText, rawText);
    parsed.software = "Midjourney";
  } else {
    parsed = parseA1111(cleanText);
  }

  const validation = ExtractedPromptSchema.safeParse({
    ...parsed,
    rawText: rawText,
  });

  if (!validation.success) {
    console.error("❌ Fallo en contrato de extracción:", validation.error.format());

    return {
      prompt: cleanText,
      negativePrompt: "",
      resolution: undefined,
      rawText: rawText,
      software: "Desconocido",
      extractionConfidence: 0.1,
    };
  }

  return validation.data;
}
