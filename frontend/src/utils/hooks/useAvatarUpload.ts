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
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

      const ticketRes = await fetchSeguro(`${API_URL}/prompts/generate-upload-url`, {
        method: "POST",
        body: JSON.stringify({
          file_name: `avatars/${username}_${Date.now()}.webp`,
          content_type: "image/webp",
        }),
      });
      if (!ticketRes.ok) throw new Error("Error obteniendo ticket de R2");
      const { upload_url, file_url } = await ticketRes.json();

      const uploadRes = await fetch(upload_url, {
        method: "PUT",
        headers: {
          "Content-Type": "image/webp",
          "Cache-Control": "public, max-age=31536000, immutable",
        },
        body: optimizedFile,
      });
      if (!uploadRes.ok) throw new Error("Error subiendo a R2");

      // 3. Guardar en DB
      const updateRes = await fetchSeguro(`${API_URL}/auth/me/avatar`, {
        method: "PATCH",
        body: JSON.stringify({ avatar_url: file_url }),
      });
      if (!updateRes.ok) throw new Error("Error guardando en la Base de Datos");

      // 4. Actualizar Estado Global y Local
      setLocalAvatar(file_url);

      if (user?.username === username && checkAuth) {
        await checkAuth(true);
      }

      notify("Perfil", "Avatar actualizado con éxito", "success");
      if (onAvatarUpdate) onAvatarUpdate(file_url);
    } catch (error) {
      console.error(error);
      notify("Error", "Hubo un problema actualizando el avatar", "error");
    } finally {
      setIsUploading(false);
    }
  };

  return { isUploading, localAvatar, uploadAvatar };
}
