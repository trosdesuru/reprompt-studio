import { useState } from "react";
import { optimizeAvatar } from "@/src/utils/lib/avatar-optimizer";
import { fetchSeguro } from "@/src/services/api/client";
import { useAuthStore } from "@/src/store/authStore";
import { useNotificationStore } from "@/src/store/notificationStore";

export function useAvatarUpload(username: string, onAvatarUpdate?: (newUrl: string) => void) {
  const [isUploading, setIsUploading] = useState(false);
  const [localAvatar, setLocalAvatar] = useState<string | null | undefined>(undefined);

  const notify = useNotificationStore((s) => s.notify);
  const user = useAuthStore((s) => s.user);
  const checkAuth = useAuthStore((s) => s.checkAuth);

  const uploadAvatar = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      notify("Error", "El archivo debe ser una imagen", "error");
      return;
    }

    setIsUploading(true);
    try {
      const optimizedFile = await optimizeAvatar(file);
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

      // 1. Obtener ticket (Ruta Temporal)
      const ticketRes = await fetchSeguro(`${API_URL}/prompts/generate-upload-url`, {
        method: "POST",
        body: JSON.stringify({
          file_name: `avatars/${username}_${Date.now()}.webp`,
          content_type: "image/webp",
        }),
      });
      if (!ticketRes.ok) throw new Error("Error obteniendo ticket de R2");
      const { upload_url, file_url } = await ticketRes.json();

      // 2. Subir imagen a Cloudflare (Temporal)
      const uploadRes = await fetch(upload_url, {
        method: "PUT",
        headers: {
          "Content-Type": "image/webp",
          "Cache-Control": "public, max-age=31536000, immutable",
        },
        body: optimizedFile,
      });
      if (!uploadRes.ok) throw new Error("Error subiendo a R2");

      // 3. Guardar en DB (El backend mueve la imagen y nos da la URL definitiva)
      const updateRes = await fetchSeguro(`${API_URL}/auth/me/avatar`, {
        method: "PATCH",
        body: JSON.stringify({ avatar_url: file_url }),
      });
      if (!updateRes.ok) throw new Error("Error guardando en la Base de Datos");

      // 🟢 LA CLAVE: Leer la URL inmutable que devuelve el backend
      const responseData = await updateRes.json();
      const finalBackendUrl = responseData?.avatar_url || responseData?.data?.avatar_url;

      if (!finalBackendUrl) throw new Error("El backend no devolvió la URL del avatar");

      // 4. Actualizar Estado Global y Local (Cero hackeos, pura verdad de BD)
      setLocalAvatar(finalBackendUrl);

      const updateUser = useAuthStore.getState().updateUser;
      updateUser({ avatarUrl: finalBackendUrl });

      // Opcional: Sincronizar el resto
      if (user?.username.toLowerCase() === username.toLowerCase()) {
        await checkAuth(true);
      }

      notify("Perfil", "Avatar actualizado con éxito", "success");
      if (onAvatarUpdate) onAvatarUpdate(finalBackendUrl);
    } catch (error) {
      console.error(error);
      notify("Error", "Hubo un problema actualizando el avatar", "error");
    } finally {
      setIsUploading(false);
    }
  };

  return { isUploading, localAvatar, uploadAvatar };
}
