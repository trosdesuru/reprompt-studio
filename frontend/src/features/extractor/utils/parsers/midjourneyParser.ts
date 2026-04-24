import { ExtractedPromptData } from "./types";

export function parseMidjourney(description: string, rawText: string): ExtractedPromptData {
  const result: ExtractedPromptData = {
    prompt: description,
    rawText,
    software: "Desconocido",
  };

  if (description.includes("--") || description.includes("Job ID:")) {
    result.software = "Desconocido";

    const arMatch = description.match(/--ar\s+([0-9:]+)/);
    if (arMatch) result.resolution = arMatch[1];

    const noMatch = description.match(/--no\s+([^--]+)/);
    if (noMatch) {
      result.negativePrompt = noMatch[1].trim();
    }
  }

  return result;
}
