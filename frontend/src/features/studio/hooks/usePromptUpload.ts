import { useState } from "react";

import { api } from "@/src/services/api";
import { useAuthStore } from "@/src/store/authStore";
import { optimizeAndLogImage } from "@/src/utils/lib/image-optimizer";

import toast from "react-hot-toast";

export function usePromptUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const { incrementPromptCount } = useAuthStore();

  const uploadPrompt = async (fileOriginal: File, targetDirectoryId: string | null = null) => {
    setIsUploading(true);

    console.log(
      `🚀 [UPLOAD-START] Iniciando flujo de subida para: ${fileOriginal.name} (${(fileOriginal.size / 1024 / 1024).toFixed(2)} MB)`,
    );

    try {
      console.log(`⏳ [UPLOAD-STEP-1] Optimizando imagen en el cliente...`);
      const archivoOptimizado = await optimizeAndLogImage(fileOriginal);
      const finalFile = archivoOptimizado.file;

      console.log(
        `⏳ [UPLOAD-STEP-2] Solicitando URL pre-firmada al Backend para: ${finalFile.name} (${finalFile.type})`,
      );

      const resUrl = await api.prompts.getPresignedUrl({
        filename: finalFile.name,
        contentType: finalFile.type,
      });

      if (!resUrl.ok) {
        throw new Error(`Error del servidor al obtener firma (Status: ${resUrl.status})`);
      }

      const { url, public_url } = await resUrl.json();
      console.log(`✅ [UPLOAD-STEP-2] Firma obtenida. URL Pública esperada: ${public_url}`);
      console.log(`☁️ [UPLOAD-STEP-3] Transfiriendo bytes a Cloudflare R2...`);

      const uploadRes = await fetch(url, {
        method: "PUT",
        body: finalFile,
        headers: {
          "Content-Type": finalFile.type,
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

      incrementPromptCount();

      console.log(
        `🎉 [UPLOAD-FINISH] Flujo de subida perfecto. Pasando el testigo a la Cuarentena del Backend.`,
      );

      return {
        success: true,
        image_url: public_url,
        directory_id: targetDirectoryId,
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
