"use client";

import { useState, useEffect } from "react";
import { api } from "@/src/services/api";

import { useSearchStore } from "@/src/store/searchStore";

import { GalleryItem } from "@/src/types/gallery";
import { useSearch } from "@/src/features/search/hooks/useSearch";
import { useViewerSync } from "@/src/features/image-viewer/hooks/useViewerSync";
import { TrendingSection } from "@/src/system/organisms/Search/TrendingSection/TrendingSection";
import { ImageViewerModal } from "@/src/system/organisms/Viewer/ImageViewerModal/ImageViewerModal";
import { HeroSearch } from "@/src/system/organisms/Search/HeroSearch";
import { SearchResults } from "@/src/system/organisms/Search/SearchResults";

export default function Home() {
  const {
    query,
    results,
    isLoading,
    isLoadingMore: isLoadingMoreResults,
    hasMore,
    error,
    loadMore,
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
  }, []) // 🛡️ FIX: Array vacío para evitar cascada de re-renders;

  return (
    <main className="min-h-screen bg-background text-foreground font-sans">
      <HeroSearch />

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

        {!isLoading && results.length > 0 && (
          <SearchResults
            results={results}
            onOpenVisor={handleOpenVisor}
            onDownloadTotal={handleDownloadTotal}
            hasMore={hasMore}
            isLoadingMore={isLoadingMoreResults}
            onLoadMore={loadMore}
          />
        )}

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
