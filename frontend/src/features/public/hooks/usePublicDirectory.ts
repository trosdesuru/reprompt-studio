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
    if (!username || !directory_slug || directory_slug === "undefined" || username === "undefined") {
      return;
    } 
    setIsLoading(true);

    api.public.getDirectory(username, directory_slug).then(async (res) => {
        if (!res.ok) throw new Error("Error en la petición");
        const jsonData = await res.json();
        setData(jsonData);
      })
      .catch((err) => {
        setError(err.message);
      })
      .finally(() => setIsLoading(false));
      
  }, [username, directory_slug]);

  return { data, isLoading, error };
}
