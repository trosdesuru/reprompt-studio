import { useState, useEffect } from "react";
import { useStudioUI } from "@/src/store/useStudioUI";
import { useAuthStore } from "@/src/store/authStore";
import { fetchSeguro } from "@/src/services/api/client";
import toast from "react-hot-toast";

export function useStudioPrompts() {
  const { activeDirectoryId, searchQuery } = useStudioUI();
  const user = useAuthStore((state) => state.user);

  const [debouncedQuery, setDebouncedQuery] = useState(searchQuery);
  const [prompts, setPrompts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedQuery(searchQuery), 1000);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  useEffect(() => {
    const fetchPrompts = async () => {
      setIsLoading(true);
      try {
        const endpoint = debouncedQuery
          ? `/search/studio?q=${debouncedQuery}`
          : `/prompts/studio?directory_id=${activeDirectoryId || ""}`;

        const res = await fetchSeguro(endpoint, { credentials: "include" });
        if (res.ok) {
          const data = await res.json();
          setPrompts(data.results || data.data || []);
        }
      } catch (err) {
        console.error("Error en Studio Grid:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPrompts();
  }, [activeDirectoryId, debouncedQuery]);

  const deletePrompt = async (promptId: string) => {
    const toastId = toast.loading("Exterminando rastro digital...");
    try {
      const res = await fetchSeguro(`/prompts/${promptId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (res.ok) {
        setPrompts((prev) => prev.filter((p) => p.id !== promptId));
        toast.success("Eliminado del Studio", { id: toastId });
      } else {
        const errorData = await res.json();
        throw new Error(errorData.detail || "Fallo de autorización");
      }
    } catch (error: any) {
      console.error("Fallo al borrar:", error);
      toast.error(error.message || "Error al eliminar", { id: toastId });
    }
  };

  return {
    prompts,
    isLoading,
    user,
    deletePrompt,
  };
}
