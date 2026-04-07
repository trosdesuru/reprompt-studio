import { useState, useEffect } from "react";
import { api } from "@/src/services/api";
import { SavedPrompt } from "@/src/types/models";

export function usePublicPrompt(promptId: string) {
  const [data, setData] = useState<SavedPrompt | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);

    api
      .getPublicPromptDetail(promptId)
      .then((res: any) => {
        const promptReal = res.prompt && typeof res.prompt === "object" ? res.prompt : res;
        setData(promptReal);
      })
      .catch((err: any) => {
        console.error("Error fetching prompt:", err);
        setError("El prompt no existe o es privado.");
        setData(null);
      })
      .finally(() => setIsLoading(false));
  }, [promptId]);

  return { data, isLoading, error };
}
