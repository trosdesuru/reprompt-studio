import { ExtractedPromptData } from "./types";
import { cleanA1111Prefixes } from "./stringUtils";

export function parseA1111(rawText: string): Partial<ExtractedPromptData> {
  const cleanText = cleanA1111Prefixes(rawText);
  const result: any = { software: "A1111", rawText: cleanText };

  const lines = cleanText.split("\n");
  const metadataLineIndex = lines.findIndex((l) => l.trim().startsWith("Steps:"));

  if (metadataLineIndex !== -1) {
    const metadataLine = lines[metadataLineIndex];
    const promptParts = lines.slice(0, metadataLineIndex).join("\n");

    if (promptParts.toLocaleLowerCase().includes("negative prompt:")) {
      const [pos, neg] = promptParts.split(/negative prompt:/i);
      result.prompt = pos.trim();
      result.negativePrompt = neg.trim();
    } else {
      result.prompt = promptParts.trim();
    }

    const params = metadataLine.split(",").reduce((acc: any, curr) => {
      const [key, ...val] = curr.split(":");
      if (key && val) acc[key.trim().toLowerCase()] = val.join(":").trim();
      return acc;
    }, {});

    result.steps = params["steps"];
    result.sampler = params["sampler"];
    result.cfgScale = params["cfg scale"];
    result.seed = params["seed"];
    result.resolution = params["size"];
    result.model = params["model"];
  } else {
    result.prompt = cleanText.trim();
  }

  return result;
}
