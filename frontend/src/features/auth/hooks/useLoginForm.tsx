import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/src/services/api";
import { useAuthStore } from "@/src/store/authStore";
import { useNotificationStore } from "@/src/store/notificationStore";
import { handleError } from "@/src/utils/errors/ErrorHandler";

export function useLoginForm() {
  const { checkAuth } = useAuthStore();
  const router = useRouter();
  const notify = useNotificationStore((state) => state.notify);

  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await api.login(formData);
      await checkAuth();
      notify("Sistemas en línea", `Bienvenido de nuevo, ${formData.username}`, "success");
      router.push("/");
    } catch (err: unknown) {
      const msg = handleError(err, "LoginForm");
      notify("Error de Acceso", msg, "error");
    } finally {
      setIsLoading(false);
    }
  };

  return {
    formData,
    isLoading,
    handleChange,
    handleSubmit,
  };
}
