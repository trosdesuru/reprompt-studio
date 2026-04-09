import { useState, useEffect } from "react";
import { api } from "@/src/services/api";
import { SavedPrompt } from "@/src/types/models";

interface CollectionDetail {
  collection: {
    id: number;
    name: string;
    description: string;
    slug: string;
    created_at: string;
  };
  prompts: SavedPrompt[];
}

export function usePublicCollection(username: string, collection_slug: string) {
  const [data, setData] = useState<CollectionDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);
    api.public
      .getCollection(username, collection_slug)
      .then((res) => setData(res))
      .catch((err) => {
        console.error("Error fetching collection:", err);
        setError("Colección no encontrada, eliminada o privada.");
        setData(null);
      })
      .finally(() => setIsLoading(false));
  }, [username, collection_slug]);

  return { data, isLoading, error };
}
