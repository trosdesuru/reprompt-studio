import { useState, useEffect, useCallback } from "react";
import { api } from "@/src/services/api";
import { handleError } from "@/src/utils/errors/ErrorHandler";
import { toast } from "react-hot-toast/headless";

export interface SavedPrompt {
  id: number;
  title: string;
  prompt: string;
  negative_prompt?: string;
  software?: string;
  model?: string;
  sampler?: string;
  created_at: string;
  image_url?: string;
  extra_data: { loras?: any[]; triggerWords?: string[] };
  resolution?: string;
  collection_id: number | null;
}

export interface Collection {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  is_private: boolean;
  created_at: string;
}

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
