import { useState, useCallback } from "react";
import { fetchSeguro } from "@/src/services/api/client";

interface SearchOptions {
  scope: "global" | "studio";
  directoryId?: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export function useVectorSearch({ scope, directoryId }: SearchOptions) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleExecute = useCallback(async () => {
    if (!query.trim()) return;

    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        q: query,
        scope,
        ...(directoryId && { directory_id: directoryId }),
      });

      const res = await fetchSeguro(`${API_URL}/search/vector?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setResults(data.results || []);
      }
    } catch (err) {
      console.error(`[VectorSearch:${scope}] Error:`, err);
    } finally {
      setIsLoading(false);
    }
  }, [query, scope, directoryId]);

  return {
    query,
    setQuery,
    results,
    isLoading,
    handleExecute,
    clear: () => {
      setQuery("");
      setResults([]);
    },
  };
}
