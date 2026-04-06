import { useState, useEffect, useCallback } from "react";
import { api } from "@/src/services/api";
import { SavedPrompt, Collection } from "@/src/types/models";
import { handleError } from "@/src/utils/errors/ErrorHandler";
import { toast } from "react-hot-toast/headless";

export function useStudio() {
  const [prompts, setPrompts] = useState<SavedPrompt[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPrompts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [promptsRes, collectionsRes] = await Promise.all([
        api.getMyPrompt(),
        api.getMyCollections(),
      ]);
      setPrompts(promptsRes);
      setCollections(collectionsRes.collections || []);

    } catch (err: unknown) {
      const msg = handleError(err, "useStudio");
      setError(msg);
      
    } finally {
      setIsLoading(false);
    }
  }, []);

  const assignToCollection = async (promptId: number, collectionId: number | null) => {
    try {
      await api.assignPromptToCollection(promptId, collectionId);
      setPrompts((prev) =>
        prev.map((p) => (p.id === promptId ? { ...p, collection_id: collectionId } : p)),
      );
      toast.success("Imagen movida correctamente");
    } catch (error) {
      toast.error("Error al mover la imagen");
    }
  };

  const deletePrompt = async (id: number) => {
    try {
      await api.deletePrompt(id);
      setPrompts((prev) => prev.filter((p) => p.id !== id));
    } catch (err: unknown) {
      handleError(err, "BorrarPrompt");
      alert("No se pudo eliminar el prompt.");
    }
  };

  useEffect(() => {
    fetchPrompts();
  }, [fetchPrompts]);

  return {
    prompts,
    collections,
    isLoading,
    error,
    refetch: fetchPrompts,
    assignToCollection,
    deletePrompt,
  };
}
