import { useState, useEffect } from "react";
import { useStudioUI } from "@/src/store/useStudioUI";
import { useAuthStore } from "@/src/store/authStore";
import { fetchSeguro } from "@/src/services/api/client";
import toast from "react-hot-toast";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

export function useStudioPrompts() {
  // 🟢 FIX CRÍTICO: Aquí nos aseguramos de extraer 'clearSelection' del store
  const { activeDirectoryId, searchQuery, refreshKey, clearSelection } = useStudioUI();
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
        const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";
        const endpoint = debouncedQuery
          ? `${API_BASE}/search/studio?q=${debouncedQuery}`
          : `${API_BASE}/prompts/studio?directory_id=${activeDirectoryId === null ? "root" : activeDirectoryId}`;

        const res = await fetchSeguro(endpoint, { credentials: "include" });

        if (res.ok) {
          const data = await res.json();
          setPrompts(data.results || data.data || []);
        } else {
          console.error("Fallo del servidor:", res.status);
        }
      } catch (err) {
        console.error("Error en Studio Grid:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPrompts();
  }, [activeDirectoryId, debouncedQuery, refreshKey]);

  const deletePrompt = async (promptId: string) => {
    const toastId = toast.loading("Exterminando rastro digital...");
    try {
      const res = await fetchSeguro(`${API_URL}/prompts/${promptId}`, {
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

  // 🟢 BORRADO MASIVO
  const deleteBulkPrompts = async (promptIds: string[]) => {
    const toastId = toast.loading(`Eliminando ${promptIds.length} prompts...`);
    try {
      const res = await fetchSeguro(`${API_URL}/prompts/bulk`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt_ids: promptIds }),
      });

      if (res.ok) {
        setPrompts((prev) => prev.filter((p) => !promptIds.includes(p.id)));
        clearSelection(); // 🟢 Ahora TS sabe qué es esto
        toast.success(`${promptIds.length} eliminados del Studio`, { id: toastId });
      } else {
        const errorData = await res.json();
        throw new Error(errorData.detail || "Fallo en borrado masivo");
      }
    } catch (error: any) {
      console.error("Fallo al borrar masivamente:", error);
      toast.error(error.message || "Error al eliminar múltiples prompts", { id: toastId });
    }
  };

  // 🟢 MOVIMIENTO MASIVO
  const moveBulkPrompts = async (promptIds: string[], targetDirectoryId: string | null) => {
    const toastId = toast.loading(`Moviendo ${promptIds.length} prompts...`);
    try {
      const res = await fetchSeguro(`${API_URL}/prompts/bulk/move`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt_ids: promptIds, directory_id: targetDirectoryId }),
      });

      if (res.ok) {
        useStudioUI.getState().triggerRefresh();
        clearSelection();
        toast.success(`Movidos con éxito`, { id: toastId });
      } else {
        const errorData = await res.json();
        throw new Error(errorData.detail || "Fallo al mover masivamente");
      }
    } catch (error: any) {
      console.error("Fallo al mover:", error);
      toast.error(error.message || "Error al mover", { id: toastId });
    }
  };

  return {
    prompts,
    isLoading,
    user,
    deletePrompt,
    deleteBulkPrompts,
    moveBulkPrompts,
  };
}
