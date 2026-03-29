import extract from "png-chunks-extract";
import text from "png-chunk-text";

export async function extractPngMetadata(file: File): Promise<string | null> {
  const buffer = await file.arrayBuffer();
  const chunks = extract(new Uint8Array(buffer));
  const textChunks = chunks.filter((c: any) => c.name === "tEXt" || c.name === "iTXt");

  for (const chunk of textChunks) {
    const decoded = text.decode(chunk.data);
    if (decoded.keyword === "parameters" || decoded.keyword === "Comment") {
      return decoded.text;
    }
  }
  return null;
}