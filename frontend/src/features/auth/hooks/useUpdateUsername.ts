import { useRouter } from "next/navigation";
import { api } from "@/src/services/api";
import toast from "react-hot-toast";

export function useUpdateUsername(lang: string) {
  const router = useRouter();

  const handleUpdate = async (newName: string) => {
    try {
      await api.user.updateUsername(newName);

      toast.success("Nombre actualizado. Redirigiendo...");

      setTimeout(() => {
        router.push(`/${lang}/login?updated=true`);
      }, 1500);
    } catch (error: any) {
      toast.error(error.message || "Error al actualizar");
    }
  };

  return { handleUpdate };
}
