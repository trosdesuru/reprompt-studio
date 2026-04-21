import { fetchSeguro } from "@/src/services/api/client";
import { SavedPrompt } from "@/src/types/models";
import toast from "react-hot-toast";

export function useUpdatePromptMetadata(promptId: string) {
  const handleSaveMetadata = async (updatedData: Partial<SavedPrompt>) => {
    const toastId = toast.loading("Actualizando metadatos en la base de datos...");

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

      const res = await fetchSeguro(`${API_URL}/prompts/${promptId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedData),
      });

      if (!res.ok) throw new Error("Fallo al guardar en el servidor");

      toast.success("¡Metadatos actualizados!", { id: toastId });
    } catch (error) {
      console.error("[useUpdatePromptMetadata] Error:", error);
      toast.error("Error al actualizar. Revisa la conexión.", { id: toastId });
      throw error;
    }
  };

  return { handleSaveMetadata };
}
