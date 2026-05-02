import { ExtractedPromptData } from "./validation";
import { cleanNullBytes } from "./stringUtils";

export function parseComfy(jsonObj: any, rawText: string): Partial<ExtractedPromptData> {
  const result: Partial<ExtractedPromptData> = {
    software: "ComfyUI",
    rawText,
    loras: [],
    extractionConfidence: 0.9,
  };

  try {
    // =================================================================
    // 1. FAST PATH: Metadatos embebidos (Civitai)
    // =================================================================
    let meta = jsonObj.extraMetadata || jsonObj.metadata || {};

    // 🟢 FIX: Si Civitai nos manda el metadata como un string escapado, lo parseamos
    if (typeof meta === "string") {
      try {
        meta = JSON.parse(meta);
      } catch (e) {
        meta = {};
      }
    }

    if (meta.prompt) result.prompt = cleanNullBytes(meta.prompt);
    if (meta.negativePrompt) result.negativePrompt = cleanNullBytes(meta.negativePrompt);
    if (meta.resources && Array.isArray(meta.resources)) {
      result.loras = meta.resources
        .filter((r: any) => r.type?.toUpperCase() === "LORA")
        .map((r: any) => ({
          // Civitai suele devolver IDs. Si tienes el nombre real, úsalo.
          name: r.name || `ModelID:${r.modelVersionId}`,
          strength: r.strength || 1,
        }));
    }

    // =================================================================
    // 2. CONVERSIÓN Y CLASIFICACIÓN DE NODOS
    // Ignoramos los IDs (1, 2, 3...) y agrupamos los nodos por su verdadera identidad
    // =================================================================
    const nodes = Object.values(jsonObj) as any[];

    const samplers = nodes.filter((n) => n?.class_type?.toLowerCase().includes("ksampler"));
    const textEncoders = nodes.filter((n) => n?.class_type === "CLIPTextEncode");
    const latentImages = nodes.filter((n) => n?.class_type === "EmptyLatentImage");
    const loaders = nodes.filter((n) => n?.class_type === "CheckpointLoaderSimple");

    // =================================================================
    // 🕸️ 3. TRAZABILIDAD DESDE EL SAMPLER (El Core del Grafo)
    // =================================================================
    if (samplers.length > 0) {
      // Tomamos el primer Sampler (el nodo principal que genera la imagen)
      const sampler = samplers[0];
      const inputs = sampler.inputs || {};

      // Parámetros técnicos
      result.steps = inputs.steps?.toString();
      result.sampler = inputs.sampler_name?.toString();
      result.cfgScale = inputs.cfg?.toString();
      result.seed = (inputs.seed || inputs.noise_seed)?.toString();

      // TRAZABILIDAD: ComfyUI guarda los links como arrays ["id_del_nodo", indice_puerto]
      const posLink = Array.isArray(inputs.positive) ? inputs.positive[0]?.toString() : null;
      const negLink = Array.isArray(inputs.negative) ? inputs.negative[0]?.toString() : null;

      // Seguimos el cable del link directamente al nodo original usando el jsonObj
      if (posLink && jsonObj[posLink] && !result.prompt) {
        const text = jsonObj[posLink].inputs?.text || jsonObj[posLink].inputs?.text_g;
        if (text) result.prompt = text;
      }
      if (negLink && jsonObj[negLink] && !result.negativePrompt) {
        const text = jsonObj[negLink].inputs?.text || jsonObj[negLink].inputs?.text_g;
        if (text) result.negativePrompt = text;
      }
    }

    // =================================================================
    // 🛟 4. FALLBACK HEURÍSTICO (Si la trazabilidad estricta falla)
    // =================================================================
    if (!result.prompt && textEncoders.length > 0) {
      // Recorremos los encoders buscando el texto más largo como positivo
      let longestText = "";
      let potentialNegative = "";

      textEncoders.forEach((node: any) => {
        const text = node.inputs?.text || "";
        if (typeof text === "string" && text.length > 5) {
          const title = (node._meta?.title || "").toLowerCase();

          if (title.includes("negative")) {
            potentialNegative = text;
          } else if (text.length > longestText.length) {
            longestText = text;
          }
        }
      });

      if (longestText) result.prompt = longestText;
      if (potentialNegative && !result.negativePrompt) result.negativePrompt = potentialNegative;
    }

    // =================================================================
    // 📐 5. EXTRACCIÓN DE RESOLUCIÓN Y MODELO
    // =================================================================
    if (latentImages.length > 0) {
      const latent = latentImages[0];
      if (latent.inputs?.width && latent.inputs?.height) {
        result.resolution = `${latent.inputs.width}x${latent.inputs.height}`;
      }
    }

    if (loaders.length > 0) {
      const loader = loaders[0];
      let modelName = loader.inputs?.ckpt_name?.toString();
      if (modelName) {
        result.model = modelName.replace(/\.[^/.]+$/, ""); // Quita la extensión .safetensors
      }
    }

    // Limpieza final de null bytes
    if (result.prompt) result.prompt = cleanNullBytes(result.prompt);
    if (result.negativePrompt) result.negativePrompt = cleanNullBytes(result.negativePrompt);
  } catch (error) {
    console.error("❌ Error rastreando el grafo de ComfyUI:", error);
    result.extractionConfidence = 0.2;
  }

  return result;
}
