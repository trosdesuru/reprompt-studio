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

// 🟢 AÑADE ESTO AL FINAL DEL ARCHIVO promptParser.ts

export function generateSmartTitle(filename: string, prompt?: string, software?: string): string {
  // 1. Limpiamos el nombre del archivo
  const cleanName = filename.replace(/\.[^/.]+$/, "").replace(/[_-]/g, " ");

  // 2. Lista negra: Nombres genéricos de móviles y SO
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

  // 3. Nivel 1: Si el nombre del archivo es descriptivo, lo usamos
  if (!isGeneric && cleanName.trim().length > 3 && !/\d{10,}/.test(cleanName)) {
    return cleanName.charAt(0).toUpperCase() + cleanName.slice(1);
  }

  // 4. Nivel 2: Intentamos extraer del Prompt (primeras 5-6 palabras)
  if (prompt && prompt.trim().length > 0) {
    const cleanPrompt = prompt.replace(/<[^>]*>?/gm, ""); // Quitar LORAs <lora:...>
    const words = cleanPrompt.trim().split(/\s+/);
    if (words.length >= 4) {
      return words.slice(0, 5).join(" ") + (words.length > 5 ? "..." : "");
    }
  }

  // 5. Nivel 3: Fallback Absoluto (Software + Hora)
  const softName = software && software !== "Desconocido" ? software : "Extracción";
  const timeId = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  return `${softName} - ${timeId}`;
}
