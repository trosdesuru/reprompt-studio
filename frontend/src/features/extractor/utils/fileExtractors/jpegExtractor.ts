import exifr from "exifr";

export async function extractJpegMetadata(file: File): Promise<string | null> {
  try {
    // 1. Intento Estándar con exifr
    const metadata = await exifr.parse(file, {
      userComment: true,
      xmp: true,
      tiff: true,
      iptc: true,
    });

    if (metadata) {
      const tagsToTry = [
        metadata.userComment,
        metadata.ImageDescription,
        metadata.description,
        metadata.caption,
      ];

      for (const tag of tagsToTry) {
        if (!tag) continue;

        let decoded = "";
        try {
          // 🟢 FIX: Verificamos el tipo antes de decodificar para evitar el TypeError
          if (typeof tag === "string") {
            decoded = tag;
          } else if (tag instanceof ArrayBuffer || ArrayBuffer.isView(tag)) {
            decoded = new TextDecoder("utf-8").decode(tag);
          } else {
            decoded = String(tag);
          }
        } catch (e) {
          decoded = String(tag);
        }

        // Limpiamos nulos y prefijos (A1111 mete UNICODE\0...)
        const clean = decoded
          .replace(/\0/g, "")
          .replace(/^(UNICODE|ASCII|UTF8)\x00*/i, "")
          .trim();

        if (clean.length > 20 && !clean.includes("[object Object]")) {
          return clean;
        }
      }
    }

    // 🚀 2. FALLBACK: ESCANEO BINARIO (Red de seguridad para archivos "mudos")
    const slice = file.slice(0, 65536);
    const buffer = await slice.arrayBuffer();
    const text = new TextDecoder("utf-8").decode(new Uint8Array(buffer));

    if (text.includes("parameters") || text.includes("Steps:")) {
      const start = text.indexOf("parameters");
      if (start !== -1) {
        const potentialPrompt = text.substring(start + 10, start + 5000);
        // Eliminamos caracteres de control no imprimibles
        return potentialPrompt.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, "").trim();
      }
    }

    return null;
  } catch (error) {
    console.error("❌ Error crítico en jpegExtractor:", error);
    return null;
  }
}
