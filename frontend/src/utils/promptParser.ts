export interface ExtractedPromptData {
  prompt: string;
  negativePrompt?: string;
  steps?: string;
  sampler?: string;
  cfgScale?: string;
  seed?: string;
  model?: string;
  rawText: string;
}

export function parseA1111Parameters(rawText: string): ExtractedPromptData {
  const result: ExtractedPromptData = { prompt: "", rawText };

  // 1. Separar por "Negative prompt:" para aislar el prompt principal
  const negativePromptSplit = rawText.split("Negative prompt:");

  if (negativePromptSplit.length > 1) {
    result.prompt = negativePromptSplit[0].trim();

    // 2. Separar el Negative Prompt de los parámetros técnicos (Steps, Seed, etc.)
    const stepsSplit = negativePromptSplit[1].split("Steps:");
    if (stepsSplit.length > 1) {
      result.negativePrompt = stepsSplit[0].trim();
      const paramsText = "Steps:" + stepsSplit[1];
      extractKeyValuePairs(paramsText, result);
    } else {
      result.negativePrompt = negativePromptSplit[1].trim();
    }
  } else {
    // Si no hay Negative Prompt, separamos el prompt principal de los parámetros
    const stepsSplit = rawText.split("Steps:");
    if (stepsSplit.length > 1) {
      result.prompt = stepsSplit[0].trim();
      const paramsText = "Steps:" + stepsSplit[1];
      extractKeyValuePairs(paramsText, result);
    } else {
      result.prompt = rawText.trim();
    }
  }

  return result;
}

// Función auxiliar para leer los parámetros técnicos como "Seed: 12345"
function extractKeyValuePairs(paramsText: string, result: ExtractedPromptData) {
  // Busca patrones como "Palabra: Valor" separados por comas
  const regex = /([a-zA-Z\s]+):\s*([^,]+)/g;
  let match;

  while ((match = regex.exec(paramsText)) !== null) {
    const key = match[1].trim().toLowerCase();
    const value = match[2].trim();

    if (key === "steps") result.steps = value;
    if (key === "sampler") result.sampler = value;
    if (key === "cfg scale") result.cfgScale = value;
    if (key === "seed") result.seed = value;
    if (key === "model") result.model = value;
  }
}
