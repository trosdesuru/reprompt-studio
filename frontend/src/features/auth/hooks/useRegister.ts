import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/src/services/api";

interface RegisterFormData {
  username: string;
  password: string;
  invite_code: string;
}

export const useRegister = (lang: string) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleRegister = async (formData: RegisterFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      await api.registrar(formData);

      router.push(`/${lang}/login?registered=true`);
    } catch (err: any) {
      const errorMsg = err.response?.data?.detail || err.message || "Error crítico al registrarse";
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return { handleRegister, isLoading, error };
};
