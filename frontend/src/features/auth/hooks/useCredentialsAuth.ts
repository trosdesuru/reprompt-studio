// src/features/auth/hooks/useCredentialsAuth.ts
import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/src/services/api";
import toast from "react-hot-toast";

export function useCredentialsAuth() {
  const router = useRouter();
  const [isCredsLoading, setIsCredsLoading] = useState(false);

  const handleCredentialsSubmit = async (
    isLogin: boolean,
    emailOrUser: string,
    password: string,
    inviteCode: string,
  ) => {
    setIsCredsLoading(true);
    try {
      if (isLogin) {
        await api.login({ username: emailOrUser, password });
        toast.success("¡Bienvenido de nuevo!");
        router.push("/es/studio");
      } else {
        await api.register({ email: emailOrUser, password, invite_code: inviteCode });
        toast.success("Cuenta creada con éxito");
        await api.login({ username: emailOrUser, password });
        router.push("/es/studio");
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.detail || "Error en la autenticación");
    } finally {
      setIsCredsLoading(false);
    }
  };

  return { handleCredentialsSubmit, isCredsLoading };
}
