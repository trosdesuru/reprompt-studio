"use client";

import { use, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useSearch } from "@/src/features/search/hooks/useSearch";
import { api } from "@/src/services/api";
import { useHomeInteraction } from "@/src/features/home/hooks/useHomeInteraction";
import Link from "next/link";
import { IconStack2, IconUser } from "@tabler/icons-react";

import { HeroSearch } from "@/src/system/organisms/Search/HeroSearch";
import { SearchResults } from "@/src/system/organisms/Search/SearchResults/SearchResults";
import { FeedState } from "@/src/system/molecules/Feedback/FeedState";

const ImageViewerModal = dynamic(
  () =>
    import("@/src/system/organisms/Viewer/ImageViewerModal/ImageViewerModal").then(
      (mod) => mod.ImageViewerModal,
    ),
  { ssr: false },
);

export default function Home({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = use(params);

  const {
    query,
    results,
    isLoading: isSearchLoading,
    isLoadingMore,
    hasMore,
    error,
    loadMore,
  } = useSearch();
  const interactions = useHomeInteraction();

  const [feed, setFeed] = useState<any[]>([]);
  const [isFeedLoading, setIsFeedLoading] = useState(true);

  useEffect(() => {
    if (!query) {
      setIsFeedLoading(true);
      api
        .getPublicFeed()
        .then((res) => setFeed(res.feed || []))
        .catch((err) => console.error("Error cargando feed:", err))
        .finally(() => setIsFeedLoading(false));
    }
  }, [query]);

  return (
    <main className="min-h-screen bg-background text-foreground font-sans">
      <HeroSearch />

      {error && <FeedState type="error" message={error} />}

      <div className="max-w-90rem mx-auto px-4 pb-12">
        {!query ? (
          <div className="pt-8">
            <h2 className="text-xl font-black font-mono uppercase tracking-widest mb-6 text-(--accent-color)">
              Explora la Comunidad
            </h2>
            {isFeedLoading ? (
              <FeedState type="loading" />
            ) : feed.length === 0 ? (
              <div className="text-center py-20 text-muted-foreground font-mono neo-border bg-muted/5">
                Aún no hay arte público en la plataforma.
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {feed.map((item) => (
                  <Link
                    key={item.id}
                    href={
                      item.type === "prompt"
                        ? `/${lang}/${item.username}/p/${item.raw_id}`
                        : `/${lang}/${item.username}/${item.slug}`
                    }
                    className="group relative cursor-pointer bg-muted/10 neo-border overflow-hidden aspect-4/5 hover:neo-shadow-accent transition-all block"
                  >
                    {item.image_url ? (
                      <img
                        src={item.image_url}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        alt={item.title}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-muted text-muted-foreground text-xs font-mono">
                        Sin portada
                      </div>
                    )}

                    <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                      <div className="absolute top-3 left-3 flex gap-2">
                        {item.type === "collection" && (
                          <span className="bg-background/90 text-foreground text-[10px] font-bold px-2 py-1 flex items-center gap-1 neo-border rounded-md shadow-sm">
                            <IconStack2 size={12} stroke={2} /> {item.items_count}
                          </span>
                        )}
                      </div>
                      <h3 className="text-white font-bold text-sm truncate shadow-black">
                        {item.title}
                      </h3>
                      <div className="flex items-center gap-1.5 mt-1 text-white/80 text-xs font-mono">
                        <IconUser size={12} /> @{item.username}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        ) : isSearchLoading && results.length === 0 ? (
          <FeedState type="loading" />
        ) : !isSearchLoading && results.length === 0 ? (
          <FeedState type="empty" highlight={query} />
        ) : (
          <div className="pt-8">
            <SearchResults
              results={results}
              onOpenVisor={interactions.handleOpenVisor}
              onDownloadTotal={interactions.handleDownloadTotal}
              hasMore={hasMore}
              isLoadingMore={isLoadingMore}
              onLoadMore={loadMore}
            />
          </div>
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
