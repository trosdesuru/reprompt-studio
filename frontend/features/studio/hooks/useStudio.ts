import { useState, useEffect, useCallback } from "react";
import { api } from "@/src/services/api";
import { handleError } from "@/src/utils/errors/ErrorHandler";

export interface SavedPrompt {
  id: number;
  title: string;
  prompt: string;
  negative_prompt?: string;
  software?: string;
  model?: string;
  sampler?: string;
  created_at: string;
  extra_data: { loras?: any[]; triggerWords?: string[] };
}

export function useStudio() {
  const [prompts, setPrompts] = useState<SavedPrompt[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPrompts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.obtenerMisPrompts();
      setPrompts(data);
    } catch (err: unknown) {
      const msg = handleError(err, "useStudio");
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPrompts();
  }, [fetchPrompts]);

  return { prompts, isLoading, error, refetch: fetchPrompts };
}
