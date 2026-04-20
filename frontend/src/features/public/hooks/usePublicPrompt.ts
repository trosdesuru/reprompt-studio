import { useState, useEffect } from "react";
import { api } from "@/src/services/api";

export function usePublicPrompt(promptId: string) {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);

    api.public
      .getPromptDetail(promptId)
      .then(async (res: Response) => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        const jsonData = await res.json();
        
        setData(jsonData);
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