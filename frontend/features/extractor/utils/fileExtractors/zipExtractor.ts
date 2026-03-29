import JSZip from "jszip";

export async function extractFilesFromZip(zipFile: File): Promise<File[]> {
  const zip = new JSZip();
  const loadedZip = await zip.loadAsync(zipFile);
  const extractedFiles: File[] = [];

  // Expresión regular para archivos soportados
  const supportedRegex = /\.(png|jpe?g|txt|json)$/i;

  for (const [filename, zipEntry] of Object.entries(loadedZip.files)) {
    // Ignoramos carpetas y archivos ocultos/basura (ej: __MACOSX, .DS_Store)
    if (zipEntry.dir || filename.includes("__MACOSX") || filename.startsWith(".")) continue;

    // Ignoramos formatos no soportados
    if (!supportedRegex.test(filename)) continue;

    const blob = await zipEntry.async("blob");
    const mimeType = getMimeType(filename);

    // Reconstruimos el archivo físico
    const file = new File([blob], filename.split("/").pop() || filename, { type: mimeType });
    extractedFiles.push(file);
  }

  return extractedFiles;
}

function getMimeType(filename: string): string {
  const lower = filename.toLowerCase();
  if (lower.endsWith(".png")) return "image/png";
  if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return "image/jpeg";
  if (lower.endsWith(".json")) return "application/json";
  return "text/plain";
}
