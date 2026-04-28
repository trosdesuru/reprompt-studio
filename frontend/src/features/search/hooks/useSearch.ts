"use client";

import { useEffect, useCallback } from "react";
import { useProgressStore } from "@/src/store/progressStore";
import { useSearchStore } from "@/src/store/searchStore";
import { api } from "@/src/services/api";

export function useSearch() {
  const store = useSearchStore();

  const executeSearch = useCallback(
    async (isLoadMore = false) => {
      if (!store.query.trim()) {
        store.clearSearch();
        return;
      }

      useProgressStore.getState().start();
      store.setError(null);

      if (isLoadMore) {
        store.setIsLoadingMore(true);
      } else {
        store.setIsLoading(true);
      }

      try {
        const currentCursor = isLoadMore ? store.nextCursor : null;
        const res = await api.search.buscar(store.query, currentCursor, store.activeCategories);
        const data = await res.json();

        if (data.status === "success" || data.results) {
          if (isLoadMore) {
            store.appendResults(data.results || [], data.next_id || data.next_cursor);
          } else {
            store.setResults(data.results || [], data.next_id || data.next_cursor);
          }
        }
      } catch (err) {
        console.error("🚨 [SEARCH_ERROR] Fallo en la red:", err);
        store.setError("Falló la conexión con el motor de búsqueda.");
      } finally {
        store.setIsLoading(false);
        store.setIsLoadingMore(false);
        useProgressStore.getState().done();
      }
    },
    [store],
  );

  useEffect(() => {
    const timerId = setTimeout(() => {
      if (store.query.trim().length > 0) {
        executeSearch(false);
      } else {
        store.clearSearch();
      }
    }, 300);

    return () => clearTimeout(timerId);
  }, [store.query]);

  const handleSearch = async (input?: string | React.FormEvent) => {
    if (input && typeof input === "object" && "preventDefault" in input) {
      input.preventDefault();
    } else if (typeof input === "string") {
      store.setQuery(input);
    }
  };

  const loadMore = () => {
    if (store.hasMore && !store.isLoading && !store.isLoadingMore) {
      executeSearch(true);
    }
  };

  return {
    query: store.query,
    setQuery: store.setQuery,
    results: store.results,
    isLoading: store.isLoading,
    isLoadingMore: store.isLoadingMore,
    hasMore: store.hasMore,
    error: store.error,
    activeCategories: store.activeCategories,
    toggleCategory: store.toggleCategory,
    handleSearch,
    loadMore,
  };
}
