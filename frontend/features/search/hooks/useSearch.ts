import { useState } from "react";
import { api } from "@/src/services/api";
import { GalleryItem } from "@/src/types/gallery";

export function useSearch() {
  const [query, setQuery] = useState("");
  const [pagesToSearch, setPagesToSearch] = useState(1);
  const [results, setResults] = useState<GalleryItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null); // Nuevo estado

  const handleSearch = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!query) return;

    setIsLoading(true);
    setError(null); // Limpiamos errores previos

    try {
      const data = await api.buscar(query, pagesToSearch);
      if (data.status === "success") {
        setResults(data.data);
      }
    } catch (err) {
      if (err instanceof TypeError && err.message === "Failed to fetch") {
        setError("🚨 El servidor Backend no responde. Verifica que Docker esté corriendo.");
      } else {
        setError("🔍 Ocurrió un error inesperado al buscar.");
      }
      console.error(err);
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
    error,
    handleSearch,
  };
}
