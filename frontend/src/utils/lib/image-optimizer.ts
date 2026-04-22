// src/utils/lib/image-optimizer.ts

/**
 * Convierte un File (Imagen) a un formato WebP optimizado usando Canvas.
 * Limita el tamaño máximo para evitar archivos gigantes.
 */
function compressToWebP(file: File, maxWidthOrHeight = 1536, quality = 0.85): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url); // Liberamos memoria (Directriz 11)

      // Calculamos nuevas dimensiones manteniendo el Aspect Ratio
      let width = img.width;
      let height = img.height;

      if (width > maxWidthOrHeight || height > maxWidthOrHeight) {
        if (width > height) {
          height = Math.round((height * maxWidthOrHeight) / width);
          width = maxWidthOrHeight;
        } else {
          width = Math.round((width * maxWidthOrHeight) / height);
          height = maxWidthOrHeight;
        }
      }

      // Creamos el Canvas para redibujar
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        return reject(new Error("No se pudo obtener el contexto del canvas"));
      }

      // Dibujamos la imagen redimensionada
      ctx.drawImage(img, 0, 0, width, height);

      // Extraemos como WebP
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error("Fallo al convertir la imagen a WebP"));
          }
        },
        "image/webp", // 🟢 Forzamos el formato WebP
        quality       // Calidad (0.85 es el sweet spot visual/peso)
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("No se pudo cargar la imagen para comprimirla"));
    };

    img.src = url;
  });
}

/**
 * Función principal para usar antes de pedir la pre-signed URL.
 * Devuelve un File nuevo en formato WebP y loguea el rendimiento.
 */
export async function optimizeAndLogImage(file: File): Promise<File> {
  const startSize = (file.size / 1024 / 1024).toFixed(2);
  console.log(`📸 [IMAGEN-ORIGINAL] Nombre: ${file.name} | Tamaño: ${startSize} MB`);

  try {
    // Si ya es muy pequeña o es un gif animado, no la tocamos
    if (file.size < 100 * 1024 || file.type === "image/gif") {
      console.log(`✨ [OPTIMIZACIÓN-SKIPPED] Archivo ignorado por tamaño o tipo.`);
      return file;
    }

    const compressedBlob = await compressToWebP(file);
    
    const endSize = (compressedBlob.size / 1024).toFixed(2);
    const reduction = (((file.size - compressedBlob.size) / file.size) * 100).toFixed(1);

    console.log(`✨ [OPTIMIZACIÓN-FRONTEND] Nuevo Tamaño: ${endSize} KB | Reducción: ${reduction}%`);

    // Reempaquetamos el Blob en un objeto File para que sea compatible con tu lógica de subida
    const newFileName = file.name.replace(/\.[^/.]+$/, "") + ".webp";
    return new File([compressedBlob], newFileName, { type: "image/webp" });

  } catch (error) {
    console.error("❌ [OPTIMIZACIÓN-ERROR] Falló la compresión, devolviendo original:", error);
    return file; // Si falla, devolvemos el original para no bloquear al usuario
  }
}

// Utilidad para depurar el CDN
export async function auditCDNHeaders(url: string) {
  try {
    const response = await fetch(url, { method: "HEAD" });
    const cacheStatus = response.headers.get("cf-cache-status") || "NO-HEADER";
    const cacheControl = response.headers.get("cache-control") || "NO-HEADER";
    const age = response.headers.get("age") || "0";

    console.log(`🌐 [CDN-AUDIT] URL: ${url}`);
    console.log(`👉 Status: ${cacheStatus} | Age: ${age}s | Policy: ${cacheControl}`);
  } catch (error) {
    console.log(`🌐 [CDN-AUDIT-FAILED] No se pudieron leer las cabeceras de ${url}`);
  }
}