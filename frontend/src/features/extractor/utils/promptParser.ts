import { ExtractedPromptData, ExtractedPromptSchema } from "./parsers/validation";
import { cleanNullBytes } from "./parsers/stringUtils"; // 🟢 Usado ahora
import { parseA1111 } from "./parsers/a1111Parser";
import { parseComfy } from "./parsers/comfyParser";
import { parseMidjourney } from "./parsers/midjourneyParser";

export type { ExtractedPromptData };

export function parsePromptData(rawText: string): ExtractedPromptData {
  // 🟢 Usamos la utilidad para limpiar nulos (Fix TS 6133) y normalizar
  const cleanText = cleanNullBytes(rawText);
  let parsed: Partial<ExtractedPromptData>;

  // Fingerprinting: Buscamos firmas de software en todo el bloque
  const isJson = cleanText.includes('{"') || cleanText.startsWith("{");
  const isComfyUI =
    cleanText.toLowerCase().includes("comfyui") || cleanText.includes('"class_type"');
  const isMidjourney = /--ar|--v|--style|--niji|Job ID:/i.test(cleanText);

  if (isJson || isComfyUI) {
    try {
      // Extraemos el JSON puro si hay basura alrededor (común en Comfy)
      const jsonMatch = cleanText.match(/\{[\s\S]*\}/);
      const jsonStr = jsonMatch ? jsonMatch[0] : cleanText;
      const jsonObj = JSON.parse(jsonStr);
      parsed = parseComfy(jsonObj, cleanText);
    } catch {
      // Fallback a A1111 si el JSON está roto pero hay texto legible
      parsed = parseA1111(cleanText);
    }
  } else if (isMidjourney) {
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
      title: "Extracción",
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

// generateSmartTitle se queda igual, está perfecto.
export function generateSmartTitle(filename: string, prompt?: string, software?: string): string {
  const cleanName = filename.replace(/\.[^/.]+$/, "").replace(/[_-]/g, " ");
  const genericNames = [
    "image",
    "img",
    "descarga",
    "download",
    "untitled",
    "sin titulo",
    "whatsapp",
    "unknown",
    "foto",
    "captura",
    "screenshot",
  ];
  const isGeneric = genericNames.some((gn) => cleanName.toLowerCase().includes(gn));

  if (!isGeneric && cleanName.trim().length > 3 && !/\d{10,}/.test(cleanName)) {
    return cleanName.charAt(0).toUpperCase() + cleanName.slice(1);
  }

  if (prompt && prompt.trim().length > 0) {
    const cleanPrompt = prompt.replace(/<[^>]*>?/gm, "");
    const words = cleanPrompt.trim().split(/\s+/);
    if (words.length >= 4) {
      return words.slice(0, 5).join(" ") + (words.length > 5 ? "..." : "");
    }
  }

  const softName = software && software !== "Desconocido" ? software : "Extracción";
  const timeId = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  return `${softName} - ${timeId}`;
}
