export async function extractRawText(file: File): Promise<string | null> {
  return await file.text();
}