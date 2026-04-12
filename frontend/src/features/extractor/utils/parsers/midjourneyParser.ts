import { ExtractedPromptData } from "./types";

export function parseMidjourney(description: string, rawText: string): ExtractedPromptData {
  const result: ExtractedPromptData = {
    prompt: description,
    rawText,
    software: "Desconocido", // Midjourney no suele poner su nombre, pero lo identificaremos por los comandos
  };

  // Si contiene comandos típicos de Midjourney
  if (description.includes("--") || description.includes("Job ID:")) {
    result.software = "Desconocido"; // Podrías añadir "Midjourney" a la interfaz de tipos si quieres

    // Extraer resolución de --ar
    const arMatch = description.match(/--ar\s+([0-9:]+)/);
    if (arMatch) result.resolution = arMatch[1];

    // Extraer Negativo (lo que va después de --no)
    const noMatch = description.match(/--no\s+([^--]+)/);
    if (noMatch) {
      result.negativePrompt = noMatch[1].trim();
    }
  }

  return result;
}
