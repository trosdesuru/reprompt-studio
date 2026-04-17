import { useState } from "react";
import { api } from "@/src/services/api";
import toast from "react-hot-toast";

export function useDiscordAuth() {
  const [isDiscordLoading, setIsDiscordLoading] = useState(false);

  const handleDiscordLogin = async () => {
    setIsDiscordLoading(true);
    try {
      const response = await api.auth.getDiscordAuthUrl();
      if (response?.auth_url) {
        window.location.href = response.auth_url;
      } else {
        throw new Error("El servidor no devolvió una URL válida");
      }
    } catch (error: any) {
      console.error("❌ Error al iniciar Discord:", error);
      toast.error(error.message || "Servicio de Discord no disponible en este momento.");
    } finally {
      setIsDiscordLoading(false);
    }
  };

  return { isDiscordLoading, handleDiscordLogin };
}
