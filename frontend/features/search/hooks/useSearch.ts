import { useState } from "react";
import { api } from "@/src/services/api";
import { GalleryItem } from "@/src/types/gallery";

export function useSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<GalleryItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Configuramos la profundidad de búsqueda "oculta"
  const PAGINAS_A_BUSCAR = 3;

  const handleSearch = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!query) return;

    setIsLoading(true);
    setError(null);

    try {
      const data = await api.buscar(query, PAGINAS_A_BUSCAR);
      if (data.status === "success") {
        // 🟢 ESCUDO: Deduplicación instantánea de objetos basándonos en la 'url'
        const uniqueResults = Array.from(
          new Map(data.data.map((item: GalleryItem) => [item.url, item])).values(),
        ) as GalleryItem[];

        setResults(uniqueResults);
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

  return { query, setQuery, results, isLoading, error, handleSearch };
}
