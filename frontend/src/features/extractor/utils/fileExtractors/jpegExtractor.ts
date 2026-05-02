import exifr from "exifr";
import { cleanNullBytes } from "../parsers/stringUtils"; // Asegúrate de que la ruta sea la correcta

export async function extractJpegMetadata(file: File): Promise<string | null> {
  try {
    // =================================================================
    // 1. INTENTO ESTÁNDAR (La ruta feliz con EXIFR)
    // =================================================================
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
          if (typeof tag === "string") {
            decoded = tag;
          } else if (tag instanceof ArrayBuffer || ArrayBuffer.isView(tag)) {
            decoded = new TextDecoder("utf-8", { fatal: false }).decode(tag);
          } else {
            decoded = String(tag);
          }
        } catch (e) {
          decoded = String(tag);
        }

        const clean = cleanNullBytes(decoded).replace(/^(UNICODE|ASCII|UTF8)\x00*/i, "");

        if (clean.length > 20 && !clean.includes("[object Object]")) {
          return clean;
        }
      }
    }

    // =================================================================
    // 🚀 2. FALLBACK GREEDY: ESCANEO BINARIO TOTAL
    // =================================================================
    // Leemos el archivo entero. Las imágenes de IA pesan <20MB, la RAM del navegador lo soporta de sobra.
    const buffer = await file.arrayBuffer();

    // 🟢 EL FIX CRÍTICO: { fatal: false } evita que bytes de imagen corruptos rompan el decodificador
    const decoder = new TextDecoder("utf-8", { fatal: false });
    const fullText = decoder.decode(buffer);

    // --- ESTRATEGIA A: Caza de JSON (ComfyUI) ---
    // Buscamos la firma inconfundible de Comfy
    const comfyMarker = fullText.indexOf('"class_type"');
    if (comfyMarker !== -1) {
      // Somos "Greedy": Buscamos la apertura de JSON antes de la firma y el cierre al final del archivo
      const jsonStart = fullText.lastIndexOf("{", comfyMarker);
      const jsonEnd = fullText.lastIndexOf("}");

      if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
        // Extraemos solo el trozo limpio y lo mandamos al parser
        const chunk = fullText.substring(jsonStart, jsonEnd + 1);
        return cleanNullBytes(chunk);
      }
    }

    // --- ESTRATEGIA B: Caza de A1111 ---
    // Buscamos la firma de los parámetros técnicos
    const stepsIndex = fullText.indexOf("Steps:");
    if (stepsIndex !== -1) {
      // A1111 suele guardar el prompt bajo la cabecera "parameters\x00" en el binario
      let start = fullText.lastIndexOf("parameters", stepsIndex);

      if (start === -1) {
        // Si no existe la palabra parameters, cogemos hasta 4000 caracteres por detrás (suficiente para prompts enormes)
        start = Math.max(0, stepsIndex - 4000);
      } else {
        start += 10; // Saltamos la propia palabra "parameters"
      }

      // El final del prompt suele estar poco después de los Steps (donde acaba la config)
      const end = Math.min(fullText.length, stepsIndex + 1500);

      const chunk = fullText.substring(start, end);
      return cleanNullBytes(chunk);
    }

    // Si llegamos aquí, la imagen es verdaderamente sorda y muda.
    return null;
  } catch (error) {
    console.error("❌ Error crítico en jpegExtractor:", error);
    return null; // Fallo silencioso elegante para que UI muestre estado "Desconocido"
  }
}
