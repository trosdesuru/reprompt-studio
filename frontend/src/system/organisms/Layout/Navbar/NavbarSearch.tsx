"use client";

import { useSearch } from "@/src/features/search/hooks/useSearch";
import { SearchTextInput } from "@/src/system/molecules/SearchTextInput";
import { FilterBar } from "@/src/system/molecules/FilterBar";

export function NavbarSearch() {
  const { query, setQuery, handleSearch, isLoading, activeCategories, toggleCategory } =
    useSearch();

  return (
    <div className="w-full flex flex-col items-center">
      {/* Buscador Superior */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSearch(e);
        }}
        className="w-full flex items-center bg-muted/30 focus-within:bg-background focus-within:ring-1 focus-within:ring-border rounded-xl border border-border/50 transition-all h-12 shadow-sm"
      >
        <SearchTextInput query={query} isLoading={isLoading} onChange={setQuery} />
      </form>

      {/* Filtros Inferiores */}
      <FilterBar activeCategories={activeCategories} onToggle={toggleCategory} />
    </div>
  );
}
