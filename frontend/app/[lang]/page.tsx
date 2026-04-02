"use client";

import { useEffect } from "react";
import dynamic from "next/dynamic";
import { useSearchStore } from "@/src/store/searchStore";
import { useSearch } from "@/src/features/search/hooks/useSearch";
import { useHomeInteraction } from "@/src/features/home/hooks/useHomeInteraction";

// 🧱 Componentes Síncronos (Vitales para el primer renderizado y SEO)
import { HeroSearch } from "@/src/system/organisms/Search/HeroSearch";
import { TrendingSection } from "@/src/system/organisms/Search/TrendingSection/TrendingSection";
import { SearchResults } from "@/src/system/organisms/Search/SearchResults/SearchResults";
import { FeedState } from "@/src/system/molecules/Feedback/FeedState";

const ImageViewerModal = dynamic(
  () =>
    import("@/src/system/organisms/Viewer/ImageViewerModal/ImageViewerModal").then(
      (mod) => mod.ImageViewerModal,
    ),
  { ssr: false },
);

export default function Home() {
  const { query, results, isLoading, isLoadingMore, hasMore, error, loadMore } = useSearch();
  const { trending, fetchTrending } = useSearchStore();

  const interactions = useHomeInteraction();

  useEffect(() => {
    fetchTrending();
  }, [fetchTrending]);

  if (process.env.NODE_ENV === "development") {
    console.log("🚨 TELEMETRÍA [HOME]:", { isLoading, count: results?.length, hasMore, query });
  }

  return (
    <main className="min-h-screen bg-background text-foreground font-sans">
      <HeroSearch />

      {error && <FeedState type="error" message={error} />}

      <div className="max-w-90rem mx-auto px-4 pb-12">
        {!query ? (
          <TrendingSection
            trending={trending}
            onOpenVisor={interactions.handleOpenVisor}
            onDownloadTotal={interactions.handleDownloadTotal}
          />
        ) : isLoading && results.length === 0 ? (
          <FeedState type="loading" />
        ) : !isLoading && results.length === 0 ? (
          <FeedState type="empty" highlight={query} />
        ) : (
          <SearchResults
            results={results}
            onOpenVisor={interactions.handleOpenVisor}
            onDownloadTotal={interactions.handleDownloadTotal}
            hasMore={hasMore}
            isLoadingMore={isLoadingMore}
            onLoadMore={loadMore}
          />
        )}

        {interactions.viewerSync.isViewerOpen && (
          <ImageViewerModal
            title={interactions.activeTitle}
            pages={interactions.viewerSync.viewerPages}
            isLoading={interactions.viewerSync.isViewerLoading}
            isLoadingMore={interactions.viewerSync.isLoadingMore}
            hasMorePages={interactions.viewerSync.hasMorePages}
            onLoadMore={interactions.viewerSync.loadNextPage}
            onClose={interactions.viewerSync.closeViewer}
          />
        )}
      </div>
    </main>
  );
}
