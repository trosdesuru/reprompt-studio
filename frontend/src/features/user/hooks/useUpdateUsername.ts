import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/src/services/api";
import { useAuthStore } from "@/src/store/authStore";
import { slugifyUsername } from "@/src/utils/lib/string";
import toast from "react-hot-toast";

export function useUpdateUsername(lang: string) {
  const router = useRouter();
  const updateLocalUsername = useAuthStore((state) => state.updateLocalUsername);
  const [isLoading, setIsLoading] = useState(false);

  const handleUpdate = async (newNameRaw: string) => {
    const safeName = slugifyUsername(newNameRaw);

    setIsLoading(true);
    try {
      await api.user.updateUsername(safeName);

      updateLocalUsername(safeName);

      toast.success("¡Identidad actualizada!");

      router.push(`/${lang}/${safeName}/settings/profile`);
    } catch (error: any) {
      toast.error(error.message || "Error al actualizar el nombre");
    } finally {
      setIsLoading(false);
    }
  };

  return { handleUpdate, isLoading };
}