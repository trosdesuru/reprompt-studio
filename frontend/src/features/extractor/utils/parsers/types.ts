export interface ExtractedPromptData {
  prompt: string;
  negativePrompt?: string;
  steps?: string;
  sampler?: string;
  cfgScale?: string;
  seed?: string;
  model?: string;
  software?: "A1111" | "ComfyUI" | "Midjourney" | "NovelAI" | "Desconocido";
  resolution?: string;
  loras?: Array<{ name: string; strength: string | number }>;
  triggerWords?: string[];
  rawText: string;
}
