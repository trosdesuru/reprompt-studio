// frontend/src/system/organisms/Layout/Navbar/NavbarSearch.tsx
import { SearchCategorySelector } from "@/src/system/molecules/SearchCategorySelector";
import { useSearch } from "@/src/features/search/hooks/useSearch";

export function NavbarSearch() {
  const { query, setQuery, handleSearch, activeCategories, toggleCategory } = useSearch();

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col gap-1.5">
      {/* Input de Búsqueda */}
      <form onSubmit={handleSearch} className="relative">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full h-10 bg-muted/50 rounded-lg px-4 text-sm border border-transparent focus:border-accent outline-none"
          placeholder="Buscar..."
        />
      </form>

      {/* El componente que querías mantener debajo */}
      <div className="px-1">
        <SearchCategorySelector activeCategories={activeCategories} onToggle={toggleCategory} />
      </div>
    </div>
  );
}
