import { ExtractedPromptData, ExtractedPromptSchema } from "./parsers/validation";
import { cleanNullBytes } from "./parsers/stringUtils";
import { parseA1111 } from "./parsers/a1111Parser";
import { parseComfy } from "./parsers/comfyParser";
import { parseMidjourney } from "./parsers/midjourneyParser";

export type { ExtractedPromptData };

export function parsePromptData(rawText: string): ExtractedPromptData {
  // 🟢 Usamos la utilidad para limpiar nulos y normalizar el texto entrante
  const cleanText = cleanNullBytes(rawText);
  let parsed: Partial<ExtractedPromptData> = {};

  // Asumimos A1111 como el estándar genérico si no hay evidencias sólidas de lo contrario
  let detectedSoftware: ExtractedPromptData["software"] = "A1111";

  // =================================================================
  // 🕵️‍♂️ 1. FINGERPRINTING INTELIGENTE (Ordenado de mayor a menor especificidad)
  // =================================================================

  // ComfyUI SIEMPRE tiene el nodo "class_type" y "inputs" en su estructura de grafos
  const isComfyUI = cleanText.includes('"class_type"') && cleanText.includes('"inputs"');

  // Midjourney tiene parámetros únicos o incluye la firma de su bot
  const isMidjourney =
    /--ar|--v|--style|--niji|Job ID:/i.test(cleanText) || cleanText.includes("Midjourney Bot");

  // NovelAI suele usar un bloque JSON que contiene la key "uc" (undesired content)
  const isNovelAI = cleanText.includes('"uc":') && cleanText.startsWith("{");

  // =================================================================
  // 🧠 2. ENRUTAMIENTO Y EXTRACCIÓN SEGURA
  // =================================================================
  if (isComfyUI) {
    detectedSoftware = "ComfyUI";
    try {
      // 🟢 FIX CRÍTICO: Extracción matemática del JSON sin Regex (Evita el Catastrophic Backtracking)
      const firstBrace = cleanText.indexOf("{");
      const lastBrace = cleanText.lastIndexOf("}");

      if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
        const jsonStr = cleanText.substring(firstBrace, lastBrace + 1);
        const jsonObj = JSON.parse(jsonStr);
        parsed = parseComfy(jsonObj, cleanText);
      } else {
        throw new Error("Estructura JSON no delimitada correctamente");
      }
    } catch (e) {
      console.warn("⚠️ [PARSER] Fallo al decodificar JSON de ComfyUI. Fallback a A1111.", e);
      parsed = parseA1111(cleanText);
    }
  } else if (isMidjourney) {
    detectedSoftware = "Midjourney";
    parsed = parseMidjourney(cleanText, rawText);
  } else if (isNovelAI) {
    detectedSoftware = "NovelAI";
    // Si algún día creas parseNovelAI(), lo pondrías aquí.
    // Por ahora, A1111 hace un buen trabajo extrayendo los prompts básicos del texto.
    parsed = parseA1111(cleanText);
  } else {
    // Si no tiene firma reconocible, tiramos de la vieja confiable (A1111 / Texto plano)
    parsed = parseA1111(cleanText);
  }

  // =================================================================
  // 🛡️ 3. VALIDACIÓN DEL CONTRATO DE DATOS
  // =================================================================
  const validation = ExtractedPromptSchema.safeParse({
    ...parsed,
    software:
      parsed.software && parsed.software !== "Desconocido" ? parsed.software : detectedSoftware,
    rawText: rawText,
  });

  if (!validation.success) {
    console.error("❌ Fallo en contrato de extracción:", validation.error.format());

    // 🟢 PROTECCIÓN DE MEMORIA: Si la extracción falla catastróficamente,
    // truncamos los strings para no inyectar Megabytes de basura binaria en la UI de React.
    return {
      title: "Extracción Fallida",
      prompt: cleanText.substring(0, 800) + (cleanText.length > 800 ? "..." : ""),
      negativePrompt: "",
      resolution: undefined,
      rawText: rawText.substring(0, 1000),
      software: "Desconocido",
      extractionConfidence: 0.0,
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
