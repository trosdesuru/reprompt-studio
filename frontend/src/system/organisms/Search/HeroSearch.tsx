import React from "react";
import { IconSearch } from "@tabler/icons-react";

interface Props {
  query: string;
  setQuery: (query: string) => void;
  onSearch: (input?: string | React.FormEvent) => void;
  isLoading: boolean;
  activeCategories?: Record<string, boolean>;
  toggleCategory?: (id: string) => void;
}

export function HeroSearch({
  query,
  setQuery,
  onSearch,
  isLoading,
  activeCategories,
  toggleCategory,
}: Props) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(e);
    }
  };

  return (
    <section className="py-16 md:py-24 flex flex-col items-center justify-center text-center space-y-8 bg-black/10 neo-border mb-12 px-4">
      <h1 className="text-4xl md:text-7xl font-black uppercase font-mono tracking-tighter leading-none">
        Explora el <span className="text-(--accent-color)">Búnker</span>
      </h1>
      <p className="text-sm md:text-xl font-mono text-(--text-secondary) max-w-2xl uppercase font-bold">
        Acceso directo a la base de datos de conocimiento y arte generado por IA.
      </p>
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-3xl flex flex-col sm:flex-row gap-0 neo-shadow-accent"
      >
        <input
          type="text"
          value={query}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQuery(e.target.value)}
          placeholder="Buscar galerías, tags, artistas..."
          className="grow neo-border p-4 md:p-6 bg-background font-mono text-lg focus:outline-none focus:ring-2 focus:ring-(--accent-color) border-r-0"
        />
        <button
          type="submit"
          disabled={isLoading}
          className="p-4 md:p-6 bg-(--accent-color) text-white neo-border font-black uppercase font-mono hover:bg-white hover:text-black transition-all disabled:opacity-50 flex items-center justify-center gap-2 min-w-150px"
        >
          {isLoading ? (
            "Buscando..."
          ) : (
            <>
              <IconSearch size={24} /> Buscar
            </>
          )}
        </button>
      </form>

      {activeCategories && toggleCategory && Object.keys(activeCategories).length > 0 && (
        <div className="flex flex-wrap justify-center gap-2 mt-4">
          {Object.entries(activeCategories).map(([cat, isActive]) => (
            <button
              key={cat}
              onClick={() => toggleCategory(cat)}
              className={`text-xs font-mono px-3 py-1 neo-border transition-colors ${isActive ? "bg-(--accent-color) text-white" : "bg-background text-(--text-secondary)"}`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
