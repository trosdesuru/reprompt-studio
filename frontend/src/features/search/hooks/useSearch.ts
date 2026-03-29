// frontend/src/features/search/hooks/useSearch.ts
"use client";

import { useSearchStore } from "@/src/store/searchStore";

export function useSearch() {
  const store = useSearchStore();

  const handleSearch = async (input?: string | React.FormEvent) => {
    // 1. Si es un evento de formulario (onSubmit directo), lo frenamos
    if (input && typeof input === "object" && "preventDefault" in input) {
      input.preventDefault();
    } 
    // 2. Si es un texto (viene de HeroSearch), actualizamos el store primero
    else if (typeof input === "string") {
      store.setQuery(input);
    }

    // Ejecutamos la búsqueda en el backend
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