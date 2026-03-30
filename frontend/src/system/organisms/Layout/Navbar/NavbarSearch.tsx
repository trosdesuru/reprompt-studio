"use client";

import { useSearch } from "@/src/features/search/hooks/useSearch";
import { SearchCategorySelector } from "@/src/system/molecules/SearchCategorySelector";
import { IconSearch } from "@tabler/icons-react";

export function NavbarSearch() {
  const { query, setQuery, handleSearch, activeCategories, toggleCategory } = useSearch();

  return (
    <div className="w-full max-w-2xl flex items-center h-10 bg-muted/30 dark:bg-white/0.03 border border-border/50 rounded-lg overflow-hidden focus-within:border-(--accent-color)/50 focus-within:ring-1 focus-within:ring-(--accent-color)/20 transition-all">
      {/* 1. Filtro acoplado a la izquierda */}
      <SearchCategorySelector activeCategories={activeCategories} onToggle={toggleCategory} />

      {/* 2. Buscador */}
      <form onSubmit={handleSearch} className="flex-1 h-full flex items-center relative">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full h-full bg-transparent px-4 text-sm outline-none placeholder:text-muted-foreground/60"
          placeholder="Buscar prompts, artistas..."
        />
        <button
          type="submit"
          className="absolute right-3 text-muted-foreground hover:text-foreground"
        >
          <IconSearch size={18} stroke={2} />
        </button>
      </form>
    </div>
  );
}
