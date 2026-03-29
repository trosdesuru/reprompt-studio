import { ExtractedPromptData } from "./types";
import { extractFileName } from "./stringUtils";

export function parseComfy(jsonObj: any, rawText: string): ExtractedPromptData {
  const result: ExtractedPromptData = { prompt: "", rawText, software: "ComfyUI" };

  // 1. Intentar por extraMetadata (Civitai)
  if (jsonObj.extraMetadata) {
    const meta =
      typeof jsonObj.extraMetadata === "string"
        ? JSON.parse(jsonObj.extraMetadata)
        : jsonObj.extraMetadata;

    result.prompt = meta.prompt || result.prompt;
    result.negativePrompt = meta.negativePrompt || "";
    result.steps = meta.steps?.toString();
    result.sampler = meta.sampler;
    result.cfgScale = meta.cfgScale?.toString();
    result.seed = meta.seed?.toString();

    if (meta.images?.[0]) result.resolution = `${meta.images[0].width}x${meta.images[0].height}`;

    if (meta.resources) {
      result.model = meta.resources
        .find((r: any) => r.type === "Checkpoint")
        ?.modelVersionId?.toString();
      result.loras = meta.resources
        .filter((r: any) => r.type === "LORA")
        .map((l: any) => ({ name: l.modelVersionId?.toString(), strength: l.strength }));
    }

    if (meta.triggerWords) {
      result.triggerWords = Array.isArray(meta.triggerWords)
        ? meta.triggerWords
            .flatMap((w: string) => w.split(","))
            .map((w: string) => w.trim()) // 👈 Agregamos : string aquí
            .filter(Boolean)
        : [];
    }

    if (result.prompt && result.steps) return result;
  }

  // 2. Fallback: Rastreo de nodos manual
  Object.values(jsonObj).forEach((node: any) => {
    if (node.class_type?.includes("KSampler")) {
      result.steps = node.inputs?.steps?.toString() || result.steps;
      result.seed = node.inputs?.seed?.toString() || result.seed;
      result.cfgScale = node.inputs?.cfg?.toString() || result.cfgScale;
      result.sampler = node.inputs?.sampler_name || result.sampler;
    }
    if (node.class_type?.includes("CLIPTextEncode")) {
      const text = node.inputs?.text;
      const isNeg = node._meta?.title?.toLowerCase().includes("negative");
      if (isNeg) result.negativePrompt = text;
      else if (!result.prompt) result.prompt = text;
    }
    if (node.class_type === "LoraLoader") {
      if (!result.loras) result.loras = [];
      result.loras.push({
        name: extractFileName(node.inputs?.lora_name),
        strength: node.inputs?.strength_model,
      });
    }
  });

  return result;
}
