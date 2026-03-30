"use client";

import React from "react";
import { useSearch } from "@/src/features/search/hooks/useSearch";
import { SearchCategorySelector } from "@/src/system/molecules/SearchCategorySelector";
import { SearchTextInput } from "@/src/system/molecules/SearchTextInput";

export function NavbarSearch() {
  const { query, setQuery, handleSearch, isLoading, activeCategories, toggleCategory } =
    useSearch();

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch(e);
  };

  return (
    <form
      onSubmit={onSubmit}
      className="w-full flex items-center bg-muted/30 focus-within:bg-background focus-within:ring-1 focus-within:ring-border rounded-lg border border-border/50 transition-all h-10 shadow-sm"
    >
      <SearchCategorySelector
        activeCategories={activeCategories}
        onToggleCategory={toggleCategory}
      />

      <SearchTextInput query={query} isLoading={isLoading} onChange={setQuery} />
    </form>
  );
}
