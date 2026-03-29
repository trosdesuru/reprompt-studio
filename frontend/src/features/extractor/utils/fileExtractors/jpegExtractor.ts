import exifr from "exifr";

export async function extractJpegMetadata(file: File): Promise<string | null> {
  try {
    // Escaneamos solo lo necesario para no sobrecargar
    const metadata = await exifr.parse(file, {
      userComment: true,
      xmp: true,
      iptc: true,
      // Nota: exifr busca en ImageDescription por defecto si no se filtra
    });

    if (!metadata) return null;

    // 1. Prioridad: UserComment (Comfy/Civitai/A1111)
    if (metadata.userComment) {
      const raw =
        typeof metadata.userComment === "string"
          ? metadata.userComment
          : new TextDecoder("utf-8").decode(metadata.userComment);

      return raw.replace(/^(UNICODE|ASCII)\x00+/, "").trim();
    }

    // 2. Prioridad: ImageDescription (Midjourney/A1111 alternativo)
    // exifr suele mapear 'Description' a 'ImageDescription'
    if (metadata.ImageDescription) {
      return metadata.ImageDescription.trim();
    }

    // 3. Prioridad: description (Caso específico de algunos metadatos XMP)
    if (metadata.description) {
      return metadata.description.trim();
    }

    return null;
  } catch (error) {
    console.error("❌ Error en jpegExtractor:", error);
    return null;
  }
}
