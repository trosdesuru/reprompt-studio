import { useState } from "react";
import { IconSearch } from "@tabler/icons-react";

interface Props {
  onSearch: (query: string) => void;
  isLoading: boolean;
}

export function HeroSearch({ onSearch, isLoading }: Props) {
  const [query, setQuery] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) onSearch(query);
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
          onChange={(e) => setQuery(e.target.value)}
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
    </section>
  );
}
