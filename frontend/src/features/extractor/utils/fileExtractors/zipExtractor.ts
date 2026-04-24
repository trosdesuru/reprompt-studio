import JSZip from "jszip";
import { string } from "zod";

export async function extractFilesFromZip(
  zipFile: File,
  maxFilesAllowed: number,
): Promise<ZipExtractionResult> {
  const zip = new JSZip();
  const loadedZip = await zip.loadAsync(zipFile);

  const validFiles: File[] = [];
  const rejectedFiles: { name: string; reason: string }[] = [];
  let limitReached = false;

  const supportedRegex = /\.(png|jpe?g|webp|txt|json)$/i;
  let fileCount = 0;

  for (const [filename, zipEntry] of Object.entries(loadedZip.files)) {
    if (
      zipEntry.dir ||
      filename.includes("__MACOSX") ||
      filename.split("/").pop()?.startsWith(".")
    ) {
      continue;
    }

    if (fileCount >= maxFilesAllowed) {
      rejectedFiles.push({
        name: filename,
        reason: `Requiere plan superior. Límite: ${maxFilesAllowed} archivos.`,
      });
      limitReached = true;
      continue;
    }

    if (!supportedRegex.test(filename)) {
      rejectedFiles.push({
        name: filename.split("/").pop() || filename,
        reason: "Formato no soportado",
      });
      continue;
    }

    try {
      const blob = await zipEntry.async("blob");

      if (blob.size > 50 * 1024 * 1024) {
        rejectedFiles.push({ name: filename, reason: "Archivo demasiado grande (>50MB)." });
        continue;
      }

      const mimeType = getMimeType(filename);
      const file = new File([blob], filename.split("/").pop() || filename, { type: mimeType });
      validFiles.push(file);
      fileCount++;
    } catch (e) {
      rejectedFiles.push({ name: filename, reason: "Archivo corrupto dentro del ZIP" });
    }
  }

  return { validFiles, rejectedFiles, limitReached };
}

function getMimeType(filename: string): string {
  const lower = filename.toLowerCase();
  if (lower.endsWith(".png")) return "image/png";
  if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return "image/jpeg";
  if (lower.endsWith(".webp")) return "image/webp";
  if (lower.endsWith(".json")) return "application/json";
  return "text/plain";
}
