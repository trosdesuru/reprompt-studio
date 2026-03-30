"use client";

import { useState, useRef } from "react";
import { useSearch } from "@/src/features/search/hooks/useSearch";
import { EH_CATEGORIES } from "@/src/constants/filters";
import { IconSearch, IconChevronDown, IconLoader2 } from "@tabler/icons-react";
import { cn } from "@/src/utils/lib/cn";
import { useClickOutside } from "@/src/utils/hooks/useClickOutside";

export function NavbarSearch() {
  const { query, setQuery, handleSearch, isLoading, activeCategories, toggleCategory } =
    useSearch();
  const [isCatOpen, setIsCatOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useClickOutside(dropdownRef, () => setIsCatOpen(false));

  const activeCount = Object.values(activeCategories).filter(Boolean).length;
  const label = activeCount === EH_CATEGORIES.length ? "Todo" : "Filtros";

  return (
    <form
      onSubmit={handleSearch}
      className="w-full flex items-center bg-muted/30 hover:bg-muted/50 focus-within:bg-background focus-within:ring-1 focus-within:ring-border rounded-lg border border-border/50 transition-all h-10 overflow-hidden"
    >
      {/* Selector de Categorías (Opciones del Scraper) */}
      <div className="relative h-full border-r border-border/50" ref={dropdownRef}>
        <button
          type="button"
          onClick={() => setIsCatOpen(!isCatOpen)}
          className="h-full px-3 flex items-center gap-1.5 text-xs font-bold text-foreground/70 hover:bg-muted transition-colors"
        >
          {label}
          <IconChevronDown
            size={14}
            className={cn("transition-transform", isCatOpen && "rotate-180")}
          />
        </button>

        {isCatOpen && (
          <div className="absolute top-11 left-0 w-56 bg-background border border-border rounded-lg shadow-xl py-2 z-50 animate-in fade-in zoom-in-95">
            <div className="px-3 py-1 text-[10px] font-black uppercase text-muted-foreground tracking-widest border-b border-border/50 mb-1">
              Categorías E-Hentai
            </div>
            {EH_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => toggleCategory(cat.id)}
                className="w-full px-4 py-2 flex items-center justify-between text-xs hover:bg-muted"
              >
                <span
                  className={cn(activeCategories[cat.id] ? "font-bold" : "text-muted-foreground")}
                >
                  {cat.label}
                </span>
                {activeCategories[cat.id] && (
                  <div className="w-1.5 h-1.5 bg-(--accent-color) rounded-full" />
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex-1 relative flex items-center">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar prompts..."
          className="w-full h-full bg-transparent pl-3 pr-10 outline-none text-sm"
        />
        <button type="submit" className="absolute right-3 text-muted-foreground">
          {isLoading ? (
            <IconLoader2 size={18} className="animate-spin" />
          ) : (
            <IconSearch size={18} />
          )}
        </button>
      </div>
    </form>
  );
}
