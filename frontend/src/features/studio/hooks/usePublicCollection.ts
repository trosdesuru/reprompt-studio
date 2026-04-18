import { useState, useEffect } from "react";
import { api } from "@/src/services/api";
import { SavedPrompt } from "@/src/types/models";

interface DirectoryDetail {
  directory: {
    id: number;
    name: string;
    description: string;
    slug: string;
    created_at: string;
  };
  prompts: SavedPrompt[];
}

export function usePublicDirectory(username: string, directory_slug: string) {
  const [data, setData] = useState<DirectoryDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);
    api.public
      .getDirectory(username, directory_slug)
      .then((res) => setData(res))
      .catch((err) => {
        console.error("Error fetching directory:", err);
        setError("Colección no encontrada, eliminada o privada.");
        setData(null);
      })
      .finally(() => setIsLoading(false));
  }, [username, directory_slug]);

  return { data, isLoading, error };
}
