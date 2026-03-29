// frontend/features/search/hooks/useSearch.ts
"use client";

import { useSearchStore } from "@/src/store/searchStore";

export function useSearch() {
  const store = useSearchStore();

  const handleSearch = async (e?: React.FormEvent) => {
    e?.preventDefault();
    await store.executeSearch();
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
