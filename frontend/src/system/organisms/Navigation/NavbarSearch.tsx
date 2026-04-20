// src/system/organisms/Navigation/NavbarSearch.tsx
"use client";

import { UniversalSearchBar } from "../../molecules/Search/UniversalSearchBar";
import { useVectorSearch } from "@/src/features/search/useVectorSearch";
import { useSearchStore } from "@/src/store/searchStore"; // Para sincronizar con el feed

export function NavbarSearch() {
  const globalSearchStore = useSearchStore(); // Conectamos con el estado global de la página

  const vector = useVectorSearch({ scope: "global" });

  const onSearchSubmit = async () => {
    await vector.handleExecute();
    // Actualizamos el store global para que el feed principal cambie
    globalSearchStore.setResults(vector.results);
    globalSearchStore.setQuery(vector.query);
  };

  return (
    <div className="w-full max-w-xl">
      <UniversalSearchBar
        query={vector.query}
        isLoading={vector.isLoading}
        placeholder="Búsqueda semántica de prompts..."
        enableKeyboardShortcut={true}
        onQueryChange={vector.setQuery}
        onSubmit={onSearchSubmit}
        onClear={vector.clear}
      />
    </div>
  );
}
