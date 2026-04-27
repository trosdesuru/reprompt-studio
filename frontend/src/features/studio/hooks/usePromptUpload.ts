// src/features/studio/hooks/usePromptUpload.ts

import { useState } from "react";
import { api } from "@/src/services/api";
import { optimizeAndLogImage } from "@/src/utils/lib/image-optimizer";
import toast from "react-hot-toast";

export function usePromptUpload() {
  const [isUploading, setIsUploading] = useState(false);

  const uploadPrompt = async (fileOriginal: File) => {
    setIsUploading(true);
    console.log(
      `🚀 [UPLOAD-START] Iniciando flujo de subida para: ${fileOriginal.name} (${(fileOriginal.size / 1024 / 1024).toFixed(2)} MB)`,
    );

    try {
      console.log(`⏳ [UPLOAD-STEP-1] Optimizando imagen en el cliente...`);
      const archivoOptimizado = await optimizeAndLogImage(fileOriginal);

      // 💡 Extraemos el archivo real del contenedor para que el código quede más limpio
      const finalFile = archivoOptimizado.file;

      // 🟢 PASO 2: Pedir URL pre-firmada
      console.log(
        `⏳ [UPLOAD-STEP-2] Solicitando URL pre-firmada al Backend para: ${finalFile.name} (${finalFile.type})`,
      );
      const resUrl = await api.prompts.getPresignedUrl({
        filename: finalFile.name,
        contentType: finalFile.type, // 🟢 CORRECCIÓN: Pasamos el string del tipo MIME (ej. "image/webp")
      });

      if (!resUrl.ok) {
        throw new Error(`Error del servidor al obtener firma (Status: ${resUrl.status})`);
      }

      const { url, public_url } = await resUrl.json();
      console.log(`✅ [UPLOAD-STEP-2] Firma obtenida. URL Pública esperada: ${public_url}`);

      // 🟢 PASO 3: Subida directa a R2
      console.log(`☁️ [UPLOAD-STEP-3] Transfiriendo bytes a Cloudflare R2...`);
      const uploadRes = await fetch(url, {
        method: "PUT",
        body: finalFile, // 🟢 CORRECCIÓN: Pasamos solo el archivo nativo a fetch
        headers: {
          "Content-Type": finalFile.type, // 🟢 CORRECCIÓN: Usamos el tipo correcto
          "Cache-Control": "public, max-age=31536000, immutable",
        },
      });

      if (!uploadRes.ok) {
        console.error(
          `❌ [UPLOAD-STEP-3] Cloudflare R2 rechazó el archivo. Status: ${uploadRes.status} - ${uploadRes.statusText}`,
        );
        throw new Error("Fallo al subir imagen al almacenamiento de Cloudflare");
      }

      console.log(`✅ [UPLOAD-STEP-3] Transferencia a R2 completada con éxito.`);

      // 🟢 PASO 4: Finalización
      console.log(
        `🎉 [UPLOAD-FINISH] Flujo de subida perfecto. Pasando el testigo a la Cuarentena del Backend.`,
      );

      return {
        success: true,
        image_url: public_url,
      };
    } catch (error: any) {
      console.error(`🚨 [UPLOAD-CRASH] El flujo de subida fue interrumpido:`, error);
      toast.error(error.message || "Fallo en la subida");
      return { success: false };
    } finally {
      setIsUploading(false);
    }
  };

  return { uploadPrompt, isUploading };
}
