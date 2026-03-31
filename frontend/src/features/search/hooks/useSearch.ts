"use client";

import { useProgressStore } from "@/src/store/progressStore";
import { useSearchStore } from "@/src/store/searchStore";

export function useSearch() {
  const store = useSearchStore();

  const handleSearch = async (input?: string | React.FormEvent) => {
    console.trace("🚨 DETECTIVE: Alguien disparó la búsqueda");
    if (input && typeof input === "object" && "preventDefault" in input) {
      input.preventDefault();
    } else if (typeof input === "string") {
      store.setQuery(input);
    }

    useProgressStore.getState().startWork();
    try {
      await store.executeSearch();
    } finally {
      useProgressStore.getState().stopWork();
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
    loadMore: store.loadMore,
  };
}
