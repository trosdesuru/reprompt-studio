"use client";

import { useMemo } from "react";
import { useAuthStore } from "@/src/store/authStore";
import { FeedItem } from "@/src/types/models";
import { FeedHeader } from "@/src/system/molecules/Feed/FeedHeader";
import { FeedSentinel } from "@/src/system/molecules/Feed/FeedSentinel";
import { PublicFeedGrid } from "./PublicFeedGrid";
import { useInfiniteScroll } from "@/src/utils/hooks/useInfiniteScroll";

interface FeedLayoutProps {
  title?: string;
  feed: FeedItem[];
  isLoading: boolean;
  lang: string;
  hasMore: boolean;
  onLoadMore: () => void;
  onFilterClick?: () => void;
}

export function FeedLayout({
  title = "Explora la Comunidad",
  feed,
  isLoading,
  lang,
  hasMore,
  onLoadMore,
  onFilterClick,
}: FeedLayoutProps) {
  const { user } = useAuthStore();

  const filteredFeed = useMemo(() => {
    if (!user || !feed) return feed || [];

    return feed.filter((item) => {
      const itemAuthor = item.username;

      return itemAuthor !== user.username;
    });
  }, [feed, user]);

  const sentinelRef = useInfiniteScroll({ hasMore, isLoading, onLoadMore });

  return (
    <div className="pt-8 w-full">
      <FeedHeader title={title} count={filteredFeed.length} onFilterClick={onFilterClick} />

      <PublicFeedGrid feed={filteredFeed} lang={lang} />

      <FeedSentinel
        ref={sentinelRef}
        isLoading={isLoading}
        hasMore={hasMore}
        isEmpty={filteredFeed.length === 0}
      />
    </div>
  );
}
