"use client";

import { useState, useEffect } from "react";
import { api } from "@/src/services/api";

import { useSearch } from "@/features/search/hooks/useSearch";
import { useSearchStore } from "@/src/store/searchStore";
import { useViewerSync } from "@/features/image-viewer/hooks/useViewerSync";

import { GalleryItem } from "@/src/types/gallery";
import { TrendingSection } from "@/features/search/TrendingSection";
import { ImageViewerModal } from "@/features/image-viewer/ImageViewerModal";
import { HeroSearch } from "@/features/search/components/HeroSearch";
import { SearchResults } from "@/features/search/components/SearchResults";

export default function Home() {
  const {
    query,
    setQuery,
    results,
    isLoading,
    isLoadingMore: isLoadingMoreResults,
    hasMore,
    error,
    handleSearch,
    loadMore,
    activeCategories,
    toggleCategory,
  } = useSearch();

  const { trending, fetchTrending } = useSearchStore();

  const [activeUrl, setActiveUrl] = useState("");
  const [activeTitle, setActiveTitle] = useState("");

  const {
    viewerPages,
    isViewerLoading,
    isLoadingMore: isLoadingMorePages,
    isViewerOpen,
    openViewer,
    closeViewer,
    hasMorePages,
    loadNextPage,
  } = useViewerSync(activeUrl);

  const handleOpenVisor = (item: GalleryItem) => {
    setActiveUrl(item.url);
    setActiveTitle(item.title);
    openViewer(item.url);
    api.registrarInteraccion(item, "view").catch(console.error);
  };

  const handleDownloadTotal = async (item: GalleryItem) => {
    try {
      await api.descargarTotal(item.url, item.title);
      api.registrarInteraccion(item, "download").catch(console.error);
      alert(`⬇️ Descarga iniciada: ${item.title}`);
    } catch (err) {
      alert("❌ Error al encolar la descarga.");
    }
  };

  useEffect(() => {
    fetchTrending();
  }, [fetchTrending]);

  return (
    <main className="min-h-screen bg-background text-foreground font-sans">
      <HeroSearch
        query={query}
        setQuery={setQuery}
        onSearch={handleSearch}
        isLoading={isLoading}
        activeCategories={activeCategories}
        toggleCategory={toggleCategory}
      />

      {error && (
        <div className="text-center text-red-500 mb-8 font-mono p-4 bg-red-500/10 neo-border neo-shadow max-w-md mx-auto">
          {error}
        </div>
      )}

      <div className="max-w-90rem mx-auto px-4">
        {query === "" && (
          <TrendingSection
            trending={trending}
            onOpenVisor={handleOpenVisor}
            onDownloadTotal={handleDownloadTotal}
          />
        )}

        <SearchResults
          results={results}
          hasMore={hasMore}
          isLoadingMore={isLoadingMoreResults}
          onLoadMore={loadMore}
          onOpenVisor={handleOpenVisor}
          onDownloadTotal={handleDownloadTotal}
        />

        {isViewerOpen && (
          <ImageViewerModal
            title={activeTitle}
            pages={viewerPages}
            isLoading={isViewerLoading}
            isLoadingMore={isLoadingMorePages}
            hasMorePages={hasMorePages}
            onLoadMore={loadNextPage}
            onClose={closeViewer}
          />
        )}
      </div>
    </main>
  );
}
