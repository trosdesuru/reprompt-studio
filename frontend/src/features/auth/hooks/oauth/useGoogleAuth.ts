import { useState } from "react";
import { api } from "@/src/services/api";
import toast from "react-hot-toast";

export function useGoogleAuth() {
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    try {
      const response = await api.auth.getGoogleAuthUrl();
      if (response?.auth_url) window.location.href = response.auth_url;
    } catch (error: any) {
      toast.error(error.message || "Error al conectar con Google");
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return { isGoogleLoading, handleGoogleLogin };
}
