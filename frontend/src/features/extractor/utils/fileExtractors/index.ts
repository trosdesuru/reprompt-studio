import { extractPngMetadata } from "./pngExtractor";
import { extractJpegMetadata } from "./jpegExtractor";
import { extractRawText } from "./rawExtractor";

export async function getRawTextFromFile(file: File): Promise<string | null> {
  const type = file.type;

  if (type === "image/png") {
    return extractPngMetadata(file);
  }

  if (type === "image/jpeg" || type === "image/jpg") {
    return extractJpegMetadata(file);
  }

  if (type === "text/plain" || type === "application/json") {
    return extractRawText(file);
  }

  return null;
}
