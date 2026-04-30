import { useState, useEffect } from "react";
import { useStudioUI } from "@/src/store/useStudioUI";
import { useAuthStore } from "@/src/store/authStore";
import { fetchSeguro } from "@/src/services/api/client";
import toast from "react-hot-toast";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";
const ITEMS_PER_PAGE = 20; // 🟢 Estándar óptimo para Grids

export function useStudioPrompts() {
  const { activeDirectoryId, searchQuery, refreshKey, clearSelection } = useStudioUI();
  const user = useAuthStore((state) => state.user);

  const [debouncedQuery, setDebouncedQuery] = useState(searchQuery);
  const [prompts, setPrompts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // 🟢 NUEVOS ESTADOS DE PAGINACIÓN
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Debounce del buscador
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedQuery(searchQuery), 1000);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // 🟢 FIX: Resetear la página y los prompts cuando cambiamos de carpeta o buscamos
  useEffect(() => {
    setPrompts([]);
    setPage(1);
    setHasMore(true);
  }, [activeDirectoryId, debouncedQuery, refreshKey]);

  // 🟢 Efecto principal: Se dispara cuando cambia la página
  useEffect(() => {
    const fetchPrompts = async () => {
      // Si no hay más y no es la primera página, abortamos
      if (!hasMore && page > 1) return;

      setIsLoading(true);

      try {
        const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";
        // 🟢 Añadimos parámetros de paginación a la URL
        const basePath = debouncedQuery
          ? `${API_BASE}/search/studio?q=${debouncedQuery}`
          : `${API_BASE}/prompts/studio?directory_id=${activeDirectoryId === null ? "root" : activeDirectoryId}`;

        const endpoint = `${basePath}${basePath.includes("?") ? "&" : "?"}page=${page}&limit=${ITEMS_PER_PAGE}`;

        const res = await fetchSeguro(endpoint, { credentials: "include" });

        if (res.ok) {
          const data = await res.json();
          const newPrompts = data.results || data.data || [];

          if (page === 1) {
            setPrompts(newPrompts); // Si es página 1, reemplazamos
          } else {
            setPrompts((prev) => [...prev, ...newPrompts]); // Si es > 1, añadimos al final
          }

          // Si el servidor nos devuelve menos elementos que el límite, hemos llegado al final
          setHasMore(newPrompts.length === ITEMS_PER_PAGE);
        } else {
          console.error("Fallo del servidor:", res.status);
          setHasMore(false);
        }
      } catch (err) {
        console.error("Error en Studio Grid:", err);
        setHasMore(false);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPrompts();
  }, [activeDirectoryId, debouncedQuery, refreshKey, page]);

  // 🟢 NUEVA FUNCIÓN: Gatillo para el scroll
  const loadMore = () => {
    if (!isLoading && hasMore) {
      setPage((prev) => prev + 1);
    }
  };

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
        clearSelection();
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
    hasMore, // 🟢 Exportamos
    loadMore, // 🟢 Exportamos
    user,
    deletePrompt,
    deleteBulkPrompts,
    moveBulkPrompts,
  };
}
