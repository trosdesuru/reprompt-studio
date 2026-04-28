export interface OptimizedImage {
  file: File;
  width: number;
  height: number;
}

function compressToWebP(
  file: File,
  maxWidthOrHeight = 1536,
  quality = 0.85,
): Promise<{ blob: Blob; width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
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

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        return reject(new Error("No se pudo obtener el contexto del canvas"));
      }

      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve({ blob, width, height });
          } else {
            reject(new Error("Fallo al convertir la imagen a WebP"));
          }
        },
        "image/webp",
        quality,
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("No se pudo cargar la imagen para comprimirla"));
    };

    img.src = url;
  });
}

export async function optimizeAndLogImage(file: File): Promise<OptimizedImage> {
  const startSize = (file.size / 1024 / 1024).toFixed(2);
  if (process.env.NODE_ENV === "development") {
    console.log(`📸 [IMAGEN-ORIGINAL] Nombre: ${file.name} | Tamaño: ${startSize} MB`);
  }

  try {
    if (file.size < 100 * 1024 || file.type === "image/gif") {
      return new Promise((resolve, reject) => {
        const img = new Image();
        const url = URL.createObjectURL(file);
        img.onload = () => {
          URL.revokeObjectURL(url);
          if (process.env.NODE_ENV === "development") {
            console.log(`✨ [OPTIMIZACIÓN-SKIPPED] Archivo ignorado por tamaño o tipo.`);
          }
          resolve({ file, width: img.width, height: img.height });
        };
        img.onerror = () => reject(new Error("Error leyendo dimensiones de imagen pequeña"));
        img.src = url;
      });
    }

    const { blob: compressedBlob, width, height } = await compressToWebP(file);

    const endSize = (compressedBlob.size / 1024).toFixed(2);
    const reduction = (((file.size - compressedBlob.size) / file.size) * 100).toFixed(1);

    if (process.env.NODE_ENV === "development") {
      console.log(
        `✨ [OPTIMIZACIÓN-FRONTEND] Nuevo Tamaño: ${endSize} KB | Reducción: ${reduction}%`,
      );
    }

    const newFileName = file.name.replace(/\.[^/.]+$/, "") + ".webp";
    const newFile = new File([compressedBlob], newFileName, { type: "image/webp" });

    return { file: newFile, width, height };
  } catch (error) {
    console.error("❌ [OPTIMIZACIÓN-ERROR] Falló la compresión, devolviendo original:", error);
    return { file, width: 0, height: 0 };
  }
}
