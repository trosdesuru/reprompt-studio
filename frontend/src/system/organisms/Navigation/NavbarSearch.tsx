"use client";

import { UniversalSearchBar } from "../../molecules/Search/UniversalSearchBar";
import { useVectorSearch } from "@/src/features/search/useVectorSearch";
import { useSearchStore } from "@/src/store/searchStore";

export function NavbarSearch() {
  const globalSearchStore = useSearchStore();

  const vector = useVectorSearch({ scope: "global" });

  const onSearchSubmit = async () => {
    await vector.handleExecute();
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
