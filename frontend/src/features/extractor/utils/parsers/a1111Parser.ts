import { ExtractedPromptData } from "./types";
import { cleanA1111Prefixes } from "./stringUtils";

export function parseA1111(rawText: string): ExtractedPromptData {
  const result: ExtractedPromptData = {
    prompt: "",
    rawText,
    software: "A1111",
  };

  const cleanText = cleanA1111Prefixes(rawText);

  const negativePromptRegex = /Negative prompt:\s*([\s\S]*?)(?=\nSteps:|$)/i;
  const negativeMatch = cleanText.match(negativePromptRegex);

  if (negativeMatch) {
    result.negativePrompt = negativeMatch[1].trim();
    result.prompt = cleanText.split(/Negative prompt:/i)[0].trim();
  } else {
    result.prompt = cleanText.split(/\nSteps:/i)[0].trim();
  }

  const matchers = {
    steps: /Steps:\s*([^,]+)/i,
    sampler: /Sampler:\s*([^,]+)/i,
    cfgScale: /CFG scale:\s*([^,]+)/i,
    seed: /Seed:\s*([^,]+)/i,
    resolution: /Size:\s*([^,]+)/i,
    model: /Model:\s*([^,]+)/i,
  };

  Object.entries(matchers).forEach(([key, regex]) => {
    const match = cleanText.match(regex);
    if (match) (result as any)[key] = match[1].trim();
  });

  return result;
}
