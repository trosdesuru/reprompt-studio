import { useState } from "react";
import { api } from "@/src/services/api";
import { GalleryItem } from "@/src/types/gallery";

export function useSearch() {
  const [query, setQuery] = useState("");
  const [pagesToSearch, setPagesToSearch] = useState(1);
  const [results, setResults] = useState<GalleryItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!query) return;

    setIsLoading(true);
    try {
      const data = await api.buscar(query, pagesToSearch);
      if (data.status === "success") {
        setResults(data.data);
      }
    } catch (err) {
      console.error("🔍 Search Error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    query,
    setQuery,
    pagesToSearch,
    setPagesToSearch,
    results,
    isLoading,
    handleSearch,
  };
}
