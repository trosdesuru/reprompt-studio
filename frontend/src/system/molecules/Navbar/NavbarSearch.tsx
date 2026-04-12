"use client";

import React, { useCallback, useEffect, useRef } from "react";
import { useSearch } from "@/src/features/search/hooks/useSearch";
import { SearchCategorySelector } from "./SearchCategorySelector";
import { IconSearch, IconLoader2 } from "@tabler/icons-react";
import { EH_CATEGORIES } from "@/src/constants/filters";

export function NavbarSearch() {
  const { query, setQuery, handleSearch, activeCategories, toggleCategory, isLoading } = useSearch();
  const inputRef = useRef<HTMLInputElement>(null);

  const onSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    handleSearch(e);
  }, [handleSearch]);

  const onInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  }, [setQuery]);

  // 🛡️ FIX UX: Atajo de teclado '/' para hacer focus rápido
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Solo actuar si pulsa '/' y no está escribiendo ya en un input
      if (e.key === '/' && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
        e.preventDefault(); // Evita que se escriba la barra en el input
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="w-full max-w-2xl flex items-center h-10 bg-muted/30 dark:bg-white/0.03 border border-border/50 rounded-lg overflow-hidden focus-within:border-var(--accent-color)/50 focus-within:ring-1 focus-within:ring-var(--accent-color)/20 transition-all">
      <SearchCategorySelector 
        options={EH_CATEGORIES}
        activeCategories={activeCategories} 
        onToggle={toggleCategory} 
      />
      <form onSubmit={onSubmit} className="flex-1 h-full flex items-center relative">
        <input 
          ref={inputRef}
          value={query}
          onChange={onInputChange}
          className="w-full h-full bg-transparent px-4 text-sm outline-none placeholder:text-muted-foreground/60"
          placeholder="Buscar prompts, artistas... (Pulsa '/')"
        />
        <button 
          type="submit" 
          disabled={isLoading}
          className="absolute right-3 text-muted-foreground hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? <IconLoader2 size={18} className="animate-spin" /> : <IconSearch size={18} stroke={2} />}
        </button>
      </form>
    </div>
  );
}
