import { useState, useEffect } from "react";
import { useStudioUI } from "@/src/store/useStudioUI";
import { useAuthStore } from "@/src/store/authStore";
import { fetchSeguro } from "@/src/services/api/client";
import toast from "react-hot-toast";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";
const ITEMS_PER_PAGE = 20;

export function useStudioPrompts() {
  const {
    activeDirectoryId,
    searchQuery,
    refreshKey,
    clearSelection,
    sortBy,
    deletedPromptIds,
    addDeletedPromptIds,
    clearDeletedPromptIds,
  } = useStudioUI();

  const user = useAuthStore((state) => state.user);

  const [debouncedQuery, setDebouncedQuery] = useState(searchQuery);
  const [prompts, setPrompts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedQuery(searchQuery), 1000);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  useEffect(() => {
    setPrompts([]);
    setPage(1);
    setHasMore(true);
    clearDeletedPromptIds();
  }, [activeDirectoryId, debouncedQuery, refreshKey, sortBy]);

  useEffect(() => {
    const fetchPrompts = async () => {
      if (!hasMore && page > 1) return;

      setIsLoading(true);

      try {
        const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";
        const basePath = debouncedQuery
          ? `${API_BASE}/search/studio?q=${debouncedQuery}`
          : `${API_BASE}/prompts/studio?directory_id=${activeDirectoryId === null ? "root" : activeDirectoryId}`;

        const endpoint = `${basePath}${basePath.includes("?") ? "&" : "?"}page=${page}&limit=${ITEMS_PER_PAGE}&sort=${sortBy}`;

        const res = await fetchSeguro(endpoint, { credentials: "include" });

        if (res.ok) {
          const data = await res.json();
          const newPrompts = data.results || data.data || [];

          if (page === 1) {
            setPrompts(newPrompts);
            useStudioUI.getState().setLoadedPromptIds(newPrompts.map((p: any) => String(p.id)));
          } else {
            setPrompts((prev) => [...prev, ...newPrompts]);
            useStudioUI
              .getState()
              .setLoadedPromptIds([
                ...useStudioUI.getState().loadedPromptIds,
                ...newPrompts.map((p: any) => String(p.id)),
              ]);
          }

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
  }, [activeDirectoryId, debouncedQuery, refreshKey, page, sortBy]);

  const loadMore = () => {
    if (!isLoading && hasMore) setPage((prev) => prev + 1);
  };

  const deletePrompt = async (promptId: string) => {
    const toastId = toast.loading("Exterminando rastro digital...");
    try {
      const res = await fetchSeguro(`${API_URL}/prompts/${promptId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (res.ok) {
        useStudioUI.getState().setDeletingIds([promptId]);
        toast.success("Eliminado del Studio", { id: toastId });

        setTimeout(async () => {
          addDeletedPromptIds([String(promptId)]);
          useStudioUI.getState().setDeletingIds([]);

          const authState = useAuthStore.getState();
          if (typeof authState.checkAuth === "function") {
            await authState.checkAuth(true);
          }
        }, 400);
      }
    } catch (error: any) {
      console.error("Fallo al borrar:", error);
      toast.error(error.message || "Error al eliminar", { id: toastId });
    }
  };

  const deleteBulkPrompts = async (promptIds: string[]) => {
    const toastId = toast.loading(`Eliminando ${promptIds.length} prompts...`);
    try {
      const res = await fetchSeguro(`${API_URL}/prompts/bulk/delete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt_ids: promptIds }),
      });

      if (res.ok) {
        useStudioUI.getState().setDeletingIds(promptIds);
        toast.success(`${promptIds.length} eliminados del Studio`, { id: toastId });

        setTimeout(async () => {
          const stringIds = promptIds.map(String);
          addDeletedPromptIds(stringIds);
          useStudioUI.getState().setDeletingIds([]);
          clearSelection();

          const authState = useAuthStore.getState();
          if (typeof authState.checkAuth === "function") {
            await authState.checkAuth(true);
          }
        }, 400);
      } else {
        const errorData = await res.json();
        const errorMsg = Array.isArray(errorData.detail)
          ? errorData.detail[0].msg
          : errorData.detail;
        throw new Error(errorMsg || "Fallo en borrado masivo");
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

  const visiblePrompts = prompts.filter((p) => !deletedPromptIds.includes(String(p.id)));

  return {
    prompts: visiblePrompts,
    isLoading,
    hasMore,
    loadMore,
    user,
    deletePrompt,
    deleteBulkPrompts,
    moveBulkPrompts,
  };
}
