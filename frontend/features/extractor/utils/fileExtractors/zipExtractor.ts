import JSZip from "jszip";

export interface ZipExtractionResult {
  validFiles: File[];
  rejectedFiles: { name: string; reason: string }[];
}

export async function extractFilesFromZip(zipFile: File): Promise<ZipExtractionResult> {
  const zip = new JSZip();
  const loadedZip = await zip.loadAsync(zipFile);

  const validFiles: File[] = [];
  const rejectedFiles: { name: string; reason: string }[] = [];

  const supportedRegex = /\.(png|jpe?g|txt|json)$/i;

  for (const [filename, zipEntry] of Object.entries(loadedZip.files)) {
    // Ignoramos carpetas y archivos del sistema silenciosamente (al usuario no le importan)
    if (
      zipEntry.dir ||
      filename.includes("__MACOSX") ||
      filename.split("/").pop()?.startsWith(".")
    ) {
      continue;
    }

    // Archivos reales pero no soportados: Se reportan
    if (!supportedRegex.test(filename)) {
      rejectedFiles.push({
        name: filename.split("/").pop() || filename,
        reason: "Formato no soportado",
      });
      continue;
    }

    try {
      const blob = await zipEntry.async("blob");
      const mimeType = getMimeType(filename);
      const file = new File([blob], filename.split("/").pop() || filename, { type: mimeType });
      validFiles.push(file);
    } catch (e) {
      rejectedFiles.push({ name: filename, reason: "Archivo corrupto dentro del ZIP" });
    }
  }

  return { validFiles, rejectedFiles };
}

function getMimeType(filename: string): string {
  const lower = filename.toLowerCase();
  if (lower.endsWith(".png")) return "image/png";
  if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return "image/jpeg";
  if (lower.endsWith(".json")) return "application/json";
  return "text/plain";
}
