"use client";

import { useState, useRef, useEffect } from "react";
import { useSearch } from "@/src/features/search/hooks/useSearch";
import { EH_CATEGORIES } from "@/src/constants/filters";
import { IconSearch, IconChevronDown, IconLoader2 } from "@tabler/icons-react";
import { cn } from "@/src/utils/lib/cn";
import { useClickOutside } from "@/src/utils/hooks/useClickOutside";

export function NavbarSearch() {
  const { query, setQuery, handleSearch, isLoading, activeCategories, toggleCategory } =
    useSearch();
  const [isCatOpen, setIsCatOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useClickOutside(dropdownRef, () => setIsCatOpen(false));

  // 🎹 Atajo de teclado: Al pulsar '/' hace focus en el buscador
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === "/" &&
        document.activeElement?.tagName !== "INPUT" &&
        document.activeElement?.tagName !== "TEXTAREA"
      ) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Calculamos la etiqueta del selector basándonos en las categorías activas
  const activeCount = Object.values(activeCategories).filter(Boolean).length;
  const label =
    activeCount === EH_CATEGORIES.length
      ? "Todo"
      : activeCount === 1
        ? EH_CATEGORIES.find((c) => activeCategories[c.id])?.label
        : `${activeCount} Filtros`;

  return (
    <form
      onSubmit={handleSearch}
      className="w-full flex items-center bg-muted/40 hover:bg-muted/60 focus-within:bg-background focus-within:ring-1 focus-within:ring-border rounded-lg border border-transparent focus-within:border-border transition-all h-10 overflow-hidden"
    >
      {/* 1. SELECTOR DE CATEGORÍAS (Estilo Civitai) */}
      <div className="relative h-full border-r border-border/50" ref={dropdownRef}>
        <button
          type="button"
          onClick={() => setIsCatOpen(!isCatOpen)}
          className="h-full px-3 flex items-center gap-1.5 text-xs font-bold text-foreground/70 hover:text-foreground hover:bg-muted transition-colors whitespace-nowrap"
        >
          {label}
          <IconChevronDown
            size={14}
            className={cn("transition-transform", isCatOpen && "rotate-180")}
          />
        </button>

        {isCatOpen && (
          <div className="absolute top-11 left-0 w-56 bg-background border border-border rounded-lg shadow-xl py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
            <div className="px-3 py-1.5 text-[10px] font-black uppercase text-muted-foreground tracking-widest border-b border-border/50 mb-1">
              Categorías
            </div>
            <div className="max-h-64 overflow-y-auto custom-scrollbar">
              {EH_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => toggleCategory(cat.id)}
                  className="w-full px-4 py-2 flex items-center justify-between text-xs hover:bg-muted transition-colors"
                >
                  <span
                    className={cn(
                      activeCategories[cat.id]
                        ? "font-bold text-foreground"
                        : "text-muted-foreground",
                    )}
                  >
                    {cat.label}
                  </span>
                  {activeCategories[cat.id] && (
                    <div className="w-1.5 h-1.5 bg-(--accent-color) rounded-full shadow-[0_0_8px_var(--accent-color)]" />
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 2. INPUT DE BÚSQUEDA */}
      <div className="flex-1 flex items-center relative group">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar..."
          className="w-full h-full bg-transparent pl-3 pr-10 outline-none text-sm text-foreground placeholder:text-muted-foreground"
          disabled={isLoading}
        />

        {/* Atajo visual '/' */}
        <div className="absolute right-10 pointer-events-none hidden lg:flex items-center">
          <kbd className="h-5 px-1.5 flex items-center justify-center bg-muted border border-border rounded text-[10px] font-mono text-muted-foreground">
            /
          </kbd>
        </div>

        {/* Icono de Lupa / Loader */}
        <button
          type="submit"
          className="absolute right-0 h-full w-10 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
        >
          {isLoading ? (
            <IconLoader2 size={18} className="animate-spin" />
          ) : (
            <IconSearch size={18} stroke={1.5} />
          )}
        </button>
      </div>
    </form>
  );
}
