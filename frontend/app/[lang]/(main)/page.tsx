"use client";

import { use } from "react";

import { useSearch } from "@/src/features/search/hooks/useSearch";
import { usePublicFeed } from "@/src/features/home/hooks/usePublicFeed";
import { useHomeInteraction } from "@/src/features/home/hooks/useHomeInteraction";

import { Hero } from "@/src/system/organisms/Layout/Hero";
import { FeedState } from "@/src/system/molecules/Feedback/FeedState";
import { SearchResults } from "@/src/system/organisms/Search/SearchResults/SearchResults";
import { FeedLayout } from "@/src/system/templates/Feed/FeedLayout";

export default function Home({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = use(params);

  const search = useSearch();
  const publicFeed = usePublicFeed(search.query);
  const interactions = useHomeInteraction();

  const globalError = search.error || publicFeed.feedError;

  return (
    <main className="max-h-screen bg-background text-foreground font-sans">
      <Hero />

      {globalError && <FeedState type="error" message={globalError} />}

      <div className="max-w-90rem mx-auto px-4 md:px-8 pb-12">
        {!search.query ? (
          <FeedLayout
            title="Explora la comunidad"
            feed={publicFeed.feed}
            isLoading={publicFeed.isFeedLoading}
            lang={lang}
            hasMore={publicFeed.hasMore}
            onLoadMore={publicFeed.loadMore}
          />
        ) : search.isLoading && search.results.length === 0 ? (
          <FeedState type="loading" />
        ) : !search.isLoading && search.results.length === 0 ? (
          <FeedState type="empty" highlight={search.query} />
        ) : (
          <div className="pt-8">
            <SearchResults
              results={search.results}
              onOpenVisor={interactions.handleOpenVisor}
              onDownloadTotal={interactions.handleDownloadTotal}
              hasMore={search.hasMore}
              isLoadingMore={search.isLoadingMore}
              onLoadMore={search.loadMore}
            />
          </div>
        )}
      </div>
    </main>
  );
}
