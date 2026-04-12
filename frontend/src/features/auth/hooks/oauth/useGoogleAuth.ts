import { useState } from "react";
import { api } from "@/src/services/api";
import toast from "react-hot-toast";

export function useGoogleAuth() {
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    try {
      const response = await api.getGoogleAuthUrl();
      if (response?.auth_url) window.location.href = response.auth_url;
    } catch (error) {
      toast.error("Error al conectar con Google");
      setIsGoogleLoading(false);
    }
  };

  return { isGoogleLoading, handleGoogleLogin };
}
