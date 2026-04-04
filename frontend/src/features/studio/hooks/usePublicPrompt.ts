import { useState, useEffect } from "react";
import { api } from "@/src/services/api";
import { SavedPrompt } from "@/src/features/studio/hooks/useStudio";

export function usePublicPrompt(username: string, promptId: string) {
  const [data, setData] = useState<SavedPrompt | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);

    api
      .getPublicPromptDetail(promptId)
      .then((res: SavedPrompt) => setData(res))
      .catch((err: any) => {
        console.error("Error fetching prompt:", err);
        setError("El prompt no existe o es privado.");
        setData(null);
      })
      .finally(() => setIsLoading(false));
  }, [promptId]);

  return { data, isLoading, error };
}
