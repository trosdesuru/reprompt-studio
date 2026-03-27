// frontend/features/search/hooks/useSearch.ts
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

  const [activeCategories, setActiveCategories] = useState<Record<string, boolean>>({
    misc: true,
    doujinshi: true,
    manga: true,
    artistcg: true,
    gamecg: true,
    western: true,
    nonh: true,
    imageset: true,
    cosplay: true,
    asianporn: true,
  });

  const toggleCategory = (id: string) => {
    setActiveCategories((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleSearch = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!query) return;

    setIsLoading(true);
    setError(null);
    setNextCursor(null);
    setHasMore(true);
    try {
      const data = await api.buscar(query, null, activeCategories);
      if (data.status === "success") {
        setResults(data.data);
        setNextCursor(data.next_id || null);
        setHasMore(!!data.next_id);
      } else {
        throw new Error(data.message || "El servidor devolvió un estado no exitoso");
      }
    } catch (err: any) {
      console.error("🚨 DETALLE DEL ERROR FANTASMA:", err);

      setError(`Error interno: ${err.message || "Fallo desconocido. Revisa F12."}`);
    } finally {
      setIsLoading(false);
    }
  };

  const loadMore = async () => {
    if (isLoadingMore || !hasMore || !nextCursor) return;
    setIsLoadingMore(true);

    try {
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
    activeCategories,
    toggleCategory,
  };
}
