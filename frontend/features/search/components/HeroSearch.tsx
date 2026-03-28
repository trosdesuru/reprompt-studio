// frontend/features/search/components/HeroSearch.tsx
import { Button } from "@/src/components/ui/Button";
import FilterBar from "./FilterBar";

interface HeroSearchProps {
  query: string;
  setQuery: (q: string) => void;
  onSearch: (e: React.FormEvent) => void;
  isLoading: boolean;
  activeCategories: Record<string, boolean>;
  toggleCategory: (id: string) => void;
}

export function HeroSearch({
  query,
  setQuery,
  onSearch,
  isLoading,
  activeCategories,
  toggleCategory,
}: HeroSearchProps) {
  return (
    <div className="max-w-6xl mx-auto text-center mb-12 mt-8">
      <h1 className="text-5xl md:text-7xl font-black mb-4 font-mono tracking-tighter text-foreground uppercase">
        EH<span className="text-(--accent-color)">-</span>Explorer
      </h1>
      <p className="text-(--text-secondary) mb-10 font-medium text-lg border-b-2 border-(--border-color) pb-6 inline-block">
        Plataforma de extracción y visor de alto rendimiento
      </p>

      <form
        onSubmit={onSearch}
        className="flex flex-col md:flex-row gap-4 max-w-3xl mx-auto mb-8 relative z-10"
      >
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ej: Naruto, Artbook, Cosplay..."
          className="flex-1 bg-(--bg-secondary) text-foreground neo-border neo-shadow px-5 py-4 focus:outline-none focus:neo-shadow-accent transition-all text-lg font-mono placeholder:text-gray-500"
        />
        <Button type="submit" isLoading={isLoading} size="lg" variant="primary">
          {isLoading ? "Buscando" : "Buscar"}
        </Button>
      </form>

      <FilterBar activeCategories={activeCategories} toggleCategory={toggleCategory} />
    </div>
  );
}
