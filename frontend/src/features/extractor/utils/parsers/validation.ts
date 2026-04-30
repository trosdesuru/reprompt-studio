import { z } from "zod";

export const ExtractedPromptSchema = z.object({
  title: z.string().default("Sin título"),
  prompt: z
    .string()
    .min(1, "El prompt es obligatorio")
    .max(20000, "El prompt excede el límite de 20,000 caracteres")
    .transform((t) => t.replace(/[\r\n]+/g, " ").trim()),
  negativePrompt: z
    .string()
    .max(20000, "El prompt negativo excede el límite de 20,000 caracteres")
    .default(""),
  steps: z.string().optional(),
  sampler: z.string().optional(),
  cfgScale: z.string().optional(),
  seed: z.string().optional(),
  model: z.string().optional(),
  resolution: z
    .string()
    .optional()
    .transform((r) => r?.replace(/\s+/g, "")),
  software: z.enum(["A1111", "ComfyUI", "Midjourney", "NovelAI", "Desconocido"]),
  rawText: z.string(),
  extractionConfidence: z.number().min(0).max(1).default(1),

  loras: z
    .array(
      z.object({
        name: z.string(),
        strength: z.union([z.string(), z.number()]),
      }),
    )
    .optional(),
  triggerWords: z.array(z.string()).optional(),
});

export type ExtractedPromptData = z.infer<typeof ExtractedPromptSchema>;
