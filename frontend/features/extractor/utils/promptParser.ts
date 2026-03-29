// frontend/features/extractor/utils/promptParser.ts

export interface ExtractedPromptData {
  prompt: string;
  negativePrompt?: string;
  steps?: string;
  sampler?: string;
  cfgScale?: string;
  seed?: string;
  model?: string;
  software?: "A1111" | "ComfyUI" | "NovelAI" | "Desconocido";
  resolution?: string;
  loras?: Array<{ name: string; strength: string | number }>;
  triggerWords?: string[];
  rawText: string;
}

export function parsePromptData(rawText: string): ExtractedPromptData {
  // 1. LIMPIEZA EXTREMA: Eliminamos caracteres nulos y basura de codificación
  const cleanText = rawText.replace(/\0/g, '').trim();

  if (cleanText.startsWith("{") && cleanText.endsWith("}")) {
    try {
      const jsonObj = JSON.parse(cleanText);
      return parseComfyUIJson(jsonObj, cleanText);
    } catch (e) {
      console.warn("Fallo en el parseo JSON, intentando como texto plano...");
    }
  }

  return parseA1111Parameters(cleanText);
}

function parseComfyUIJson(jsonObj: any, rawText: string): ExtractedPromptData {
  const result: ExtractedPromptData = { prompt: "", rawText, software: "ComfyUI" };

  // --- ESCENARIO A: RESUMEN DE CIVITAI (extraMetadata) ---
  if (jsonObj.extraMetadata) {
    try {
      const meta = typeof jsonObj.extraMetadata === "string" 
        ? JSON.parse(jsonObj.extraMetadata) 
        : jsonObj.extraMetadata;

      result.prompt = meta.prompt || result.prompt;
      result.negativePrompt = meta.negativePrompt || "";
      result.steps = meta.steps?.toString();
      result.sampler = meta.sampler;
      result.cfgScale = meta.cfgScale?.toString();
      result.seed = meta.seed?.toString();
      
      if (meta.images?.[0]) {
        result.resolution = `${meta.images[0].width}x${meta.images[0].height}`;
      }

      if (meta.resources) {
        const ckpt = meta.resources.find((r: any) => r.type === "Checkpoint");
        if (ckpt) result.model = ckpt.modelVersionId?.toString();
        
        const loras = meta.resources.filter((r: any) => r.type === "LORA");
        if (loras.length > 0) {
          result.loras = loras.map((l: any) => ({
            name: l.modelVersionId?.toString() || "Lora",
            strength: l.strength || 1
          }));
        }
      }

      if (meta.triggerWords) {
        result.triggerWords = Array.isArray(meta.triggerWords) 
          ? meta.triggerWords.flatMap((w: string) => w.split(",")).map((w: string) => w.trim()).filter(Boolean)
          : [];
      }
      
      // Si hemos conseguido los datos clave, retornamos ya
      if (result.steps && result.prompt) return result;
    } catch (e) {
      console.error("Error en extraMetadata:", e);
    }
  }

  // --- ESCENARIO B: RASTREO DE NODOS (Si falla el anterior o no existe) ---
  // Buscamos en todo el grafo de nodos
  Object.values(jsonObj).forEach((node: any) => {
    // Extraer del KSampler
    if (node.class_type === "KSampler" || node.class_type === "KSamplerAdvanced") {
      result.steps = node.inputs?.steps?.toString() || result.steps;
      result.seed = node.inputs?.seed?.toString() || result.seed;
      result.cfgScale = node.inputs?.cfg?.toString() || result.cfgScale;
      result.sampler = node.inputs?.sampler_name || result.sampler;
    }

    // Extraer Prompts (Buscamos nodos de texto)
    if (node.class_type?.includes("CLIPTextEncode")) {
      const text = node.inputs?.text;
      const title = node._meta?.title?.toLowerCase() || "";
      if (text && typeof text === "string") {
        if (title.includes("negative")) {
          result.negativePrompt = text;
        } else if (!result.prompt || title.includes("positive")) {
          result.prompt = text;
        }
      }
    }

    // Extraer Modelo
    if (node.class_type === "CheckpointLoaderSimple") {
      result.model = node.inputs?.ckpt_name?.split('/')?.pop() || result.model;
    }

    // Extraer LoRAs del grafo
    if (node.class_type === "LoraLoader") {
      const loraName = node.inputs?.lora_name?.split('/')?.pop() || "Lora";
      if (!result.loras) result.loras = [];
      result.loras.push({ name: loraName, strength: node.inputs?.strength_model || 1 });
    }
  });

  return result;
}

// (La función parseA1111Parameters se mantiene igual que antes)
export function parseA1111Parameters(rawText: string): ExtractedPromptData {
    const result: ExtractedPromptData = { prompt: "", rawText, software: "A1111" };
    // ... (Mantén tu código actual de A1111 aquí abajo)
    const stepsMatch = rawText.match(/Steps:\s*([^,]+)/i);
    const samplerMatch = rawText.match(/Sampler:\s*([^,]+)/i);
    const cfgMatch = rawText.match(/CFG scale:\s*([^,]+)/i);
    const seedMatch = rawText.match(/Seed:\s*([^,]+)/i);
    const sizeMatch = rawText.match(/Size:\s*([^,]+)/i);
    const modelMatch = rawText.match(/Model:\s*([^,]+)/i);

    if (stepsMatch) result.steps = stepsMatch[1].trim();
    if (samplerMatch) result.sampler = samplerMatch[1].trim();
    if (cfgMatch) result.cfgScale = cfgMatch[1].trim();
    if (seedMatch) result.seed = seedMatch[1].trim();
    if (sizeMatch) result.resolution = sizeMatch[1].trim();
    if (modelMatch) result.model = modelMatch[1].trim();

    const negativePromptRegex = /Negative prompt:\s*([\s\S]*?)(?=\nSteps:|$)/i;
    const negativeMatch = rawText.match(negativePromptRegex);
    if (negativeMatch) {
      result.negativePrompt = negativeMatch[1].trim();
      result.prompt = rawText.split(/Negative prompt:/i)[0].trim();
    } else {
      result.prompt = rawText.split(/\nSteps:/i)[0].trim();
    }

    return result;
}