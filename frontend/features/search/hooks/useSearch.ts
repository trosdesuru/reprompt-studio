import { useState } from "react";
import { api } from "@/src/services/api";
import { GalleryItem } from "@/src/types/gallery";

export function useSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<GalleryItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);

  // 🟢 Estado de categorías
  const [activeCategories, setActiveCategories] = useState<Record<string, boolean>>({
    misc: true, doujinshi: true, manga: true, artistcg: true,
    gamecg: true, western: true, nonh: true, imageset: true,
    cosplay: true, asianporn: true,
  });

  const toggleCategory = (id: string) => {
    setActiveCategories(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleSearch = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!query) return;

    setIsLoading(true);
    setError(null);
    setNextCursor(null);
    setHasMore(true);

    try {
      // 🟢 Ahora TypeScript no protestará: pasamos los 3 argumentos
      const data = await api.buscar(query, null, activeCategories);

      if (data.status === "success") {
        setResults(data.data);
        setNextCursor(data.next_id || null);
        setHasMore(!!data.next_id);
      }
    } catch (err) {
      setError("🚨 Error al conectar con el servidor.");
    } finally {
      setIsLoading(false);
    }
  };

  const loadMore = async () => {
    if (isLoadingMore || !hasMore || !nextCursor) return;

    setIsLoadingMore(true);

    try {
      // 🟢 IMPORTANTE: También pasamos activeCategories aquí para mantener el filtro
      const data = await api.buscar(query, nextCursor, activeCategories);

      if (data.status === "success" && data.data.length > 0) {
        setResults((prev) => {
          const combined = [...prev, ...data.data];
          const uniqueMap = new Map();
          combined.forEach((item) => uniqueMap.set(item.url, item));
          return Array.from(uniqueMap.values()) as GalleryItem[];
        });

        setNextCursor(data.next_id || null);
        setHasMore(!!data.next_id);
      } else {
        setHasMore(false);
      }
    } catch (err) {
      console.error("Error al cargar más:", err);
    } finally {
      setIsLoadingMore(false);
    }
  };

  return {
    query,
    setQuery,
    results,
    isLoading,
    isLoadingMore,
    hasMore,
    error,
    handleSearch,
    loadMore,
    // 🟢 DEVOLVEMOS esto para que el componente de la UI pueda usarlos
    activeCategories,
    toggleCategory,
  };
}