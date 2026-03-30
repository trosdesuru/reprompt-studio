"use client";
import React, { useCallback } from "react";
import { useSearch } from "@/src/features/search/hooks/useSearch";
import { SearchCategorySelector } from "./SearchCategorySelector";
import { IconSearch } from "@tabler/icons-react";
import { EH_CATEGORIES } from "@/src/constants/filters";

export function NavbarSearch() {
  // Optimizando la extracción del estado (ISP)
  const { query, setQuery, handleSearch, activeCategories, toggleCategory } = useSearch();

  // Abstracción del evento de submit (Clean Code)
  const onSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    handleSearch(e);
  }, [handleSearch]);

  const onInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  }, [setQuery]);

  return (
    <div className="w-full max-w-2xl flex items-center h-10 bg-muted/30 dark:bg-white/0.03 border border-border/50 rounded-lg overflow-hidden focus-within:border-var(--accent-color)/50 focus-within:ring-1 focus-within:ring-var(--accent-color)/20 transition-all">
      <SearchCategorySelector 
        options={EH_CATEGORIES}
        activeCategories={activeCategories} 
        onToggle={toggleCategory} 
      />
      <form onSubmit={onSubmit} className="flex-1 h-full flex items-center relative">
        <input 
          value={query}
          onChange={onInputChange}
          className="w-full h-full bg-transparent px-4 text-sm outline-none placeholder:text-muted-foreground/60"
          placeholder="Buscar prompts, artistas..."
        />
        <button type="submit" className="absolute right-3 text-muted-foreground hover:text-foreground">
          <IconSearch size={18} stroke={2} />
        </button>
      </form>
    </div>
  );
}
