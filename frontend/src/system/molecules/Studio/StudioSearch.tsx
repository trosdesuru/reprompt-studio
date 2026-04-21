"use client";

import { useEffect } from "react";
import { UniversalSearchBar } from "../../molecules/Search/UniversalSearchBar";
import { useVectorSearch } from "@/src/features/search/useVectorSearch";
import { useStudioUI } from "@/src/store/useStudioUI";

export function StudioSearch() {
  const { activeDirectoryId } = useStudioUI();

  const vector = useVectorSearch({
    scope: "studio",
    directoryId: activeDirectoryId ?? undefined,
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      if (vector.query) vector.handleExecute();
    }, 500);
    return () => clearTimeout(timer);
  }, [vector.query]);

  return (
    <div className="mb-4">
      <UniversalSearchBar
        query={vector.query}
        isLoading={vector.isLoading}
        placeholder="Busca en tus extracciones..."
        onQueryChange={vector.setQuery}
        onSubmit={vector.handleExecute}
        onClear={vector.clear}
      />
    </div>
  );
}
