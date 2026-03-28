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

/**
 * Procesa el bloque de texto bruto inyectado por Stable Diffusion / Automatic1111
 * y lo convierte en un objeto estructurado.
 */
export function parseA1111Parameters(rawText: string): ExtractedPromptData {
  // Inicializamos el objeto base
  const result: ExtractedPromptData = { prompt: "", rawText };

  // 1. Aislamos el Prompt Principal (Todo lo que va antes de "Negative prompt:" o "Steps:")
  const negativePromptSplit = rawText.split("Negative prompt:");

  if (negativePromptSplit.length > 1) {
    result.prompt = negativePromptSplit[0].trim();

    // 2. Aislamos el Negative Prompt de los parámetros técnicos
    const stepsSplit = negativePromptSplit[1].split("Steps:");
    if (stepsSplit.length > 1) {
      result.negativePrompt = stepsSplit[0].trim();
      const paramsText = "Steps:" + stepsSplit[1];
      extractKeyValuePairs(paramsText, result);
    } else {
      result.negativePrompt = negativePromptSplit[1].trim();
    }
  } else {
    // Si la imagen no tiene Negative Prompt
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

/**
 * Función auxiliar privada que extrae las píldoras técnicas (Seed, Steps, etc.)
 */
function extractKeyValuePairs(paramsText: string, result: ExtractedPromptData) {
  // Expresión Regular para encontrar patrones tipo "Clave: Valor,"
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
