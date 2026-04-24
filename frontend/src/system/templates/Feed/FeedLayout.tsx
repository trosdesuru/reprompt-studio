"use client";

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
  const sentinelRef = useInfiniteScroll({ hasMore, isLoading, onLoadMore });

  return (
    <div className="pt-8 w-full">
      <FeedHeader title={title} count={feed.length} onFilterClick={onFilterClick} />

      <PublicFeedGrid feed={feed} lang={lang} />

      <FeedSentinel
        ref={sentinelRef}
        isLoading={isLoading}
        hasMore={hasMore}
        isEmpty={feed.length === 0}
      />
    </div>
  );
}
