// En src/features/extractor/utils/parsers/comfyParser.ts

import { ExtractedPromptData } from "./validation";

export function parseComfy(jsonObj: any, rawText: string): Partial<ExtractedPromptData> {
  const result: any = { software: "ComfyUI", rawText, loras: [] };

  // 1. Intentar leer metadatos de Civitai embebidos
  const meta = jsonObj.extraMetadata || jsonObj.metadata || {};
  if (meta.prompt) result.prompt = meta.prompt;

  // 2. Recorrer nodos (la imagen 4 usa IDs numéricos como "6" o "7")
  const nodes = Object.values(jsonObj);

  nodes.forEach((node: any) => {
    if (!node || typeof node !== "object") return;
    const type = (node.class_type || "").toLowerCase();
    const inputs = node.inputs || {};

    // 🎯 Buscador de Prompts por contenido (No por ID)
    if (inputs.text && typeof inputs.text === "string" && inputs.text.length > 5) {
      const title = (node._meta?.title || "").toLowerCase();
      const isNegative = title.includes("negative") || type.includes("negative");

      if (isNegative) {
        result.negativePrompt = inputs.text;
      } else {
        // Guardamos el primer prompt largo que encontremos como positivo
        if (!result.prompt || title.includes("positive")) {
          result.prompt = inputs.text;
        }
      }
    }

    // ⚙️ Buscador de Parámetros
    if (type.includes("ksampler")) {
      result.steps = inputs.steps?.toString();
      result.sampler = inputs.sampler_name;
      result.cfgScale = inputs.cfg?.toString();
      result.seed = inputs.seed?.toString();
    }
  });

  return result;
}
