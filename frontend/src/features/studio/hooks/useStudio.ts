import { useState, useEffect, useCallback } from "react";
import { api } from "@/src/services/api";
import { SavedPrompt, Collection } from "@/src/types/models";
import { handleError } from "@/src/utils/errors/ErrorHandler";
import { toast } from "react-hot-toast"; // o react-hot-toast/headless según tu setup

export function useStudio() {
  const [prompts, setPrompts] = useState<SavedPrompt[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isDeletingBatch, setIsDeletingBatch] = useState(false);

  const fetchPrompts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [promptsRes, collectionsRes] = await Promise.all([
        api.getMyPrompt(),
        api.collections.getMyCollections(),
      ]);

      console.log("📦 [DEBUG] Respuesta cruda de Colecciones:", collectionsRes);

      setPrompts(promptsRes);

      const collection = Array.isArray(collectionsRes)
        ? collectionsRes
        : collectionsRes?.collections || [];

      setCollections(collection);
    } catch (err: unknown) {
      const msg = handleError(err, "useStudio");
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const assignToCollection = async (promptId: number, collectionId: number | null) => {
    try {
      await api.collections.assignPrompt(promptId, collectionId);
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
      toast.success("Prompt eliminado");
    } catch (err: unknown) {
      handleError(err, "BorrarPrompt");
      toast.error("No se pudo eliminar el prompt.");
    }
  };

  const deletePromptsBatch = async (ids: number[]) => {
    setIsDeletingBatch(true);
    try {
      await api.prompts.deleteBatch(ids);

      setPrompts((prev) => prev.filter((p) => !ids.includes(p.id)));
      toast.success(`${ids.length} imágenes eliminadas`);
      return true;
    } catch (err) {
      handleError(err, "BorrarLote");
      toast.error("Error al borrar las imágenes");
      return false;
    } finally {
      setIsDeletingBatch(false);
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
    isDeletingBatch,
    deletePromptsBatch,
  };
}
