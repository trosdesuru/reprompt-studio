import JSZip from "jszip";

export interface ZipExtractionResult {
  validFiles: File[];
  rejectedFiles: { name: string; reason: string }[];
  limitReached: boolean;
}

export async function extractFilesFromZip(
  zipFile: File,
  maxFilesAllowed: number, // 🟢 Usaremos este parámetro dinámico (10 o 200)
): Promise<ZipExtractionResult> {
  const zip = new JSZip();
  const loadedZip = await zip.loadAsync(zipFile);

  const validFiles: File[] = [];
  const rejectedFiles: { name: string; reason: string }[] = [];
  let limitReached = false;

  const supportedRegex = /\.(png|jpe?g|txt|json)$/i;
  let fileCount = 0;

  for (const [filename, zipEntry] of Object.entries(loadedZip.files)) {
    if (
      zipEntry.dir ||
      filename.includes("__MACOSX") ||
      filename.split("/").pop()?.startsWith(".")
    ) {
      continue;
    }

    // 🟢 CORRECCIÓN 1 Y 2: Usamos maxFilesAllowed y activamos la bandera
    if (fileCount >= maxFilesAllowed) {
      rejectedFiles.push({
        name: filename,
        reason: `Requiere plan superior. Límite: ${maxFilesAllowed} archivos.`,
      });
      limitReached = true; // 🟢 ¡Esto dispara el Pop-up de ventas!
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

  // 🟢 CORRECCIÓN 3: Devolvemos las 3 cosas que pide la interfaz
  return { validFiles, rejectedFiles, limitReached };
}

function getMimeType(filename: string): string {
  const lower = filename.toLowerCase();
  if (lower.endsWith(".png")) return "image/png";
  if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return "image/jpeg";
  if (lower.endsWith(".json")) return "application/json";
  return "text/plain";
}
