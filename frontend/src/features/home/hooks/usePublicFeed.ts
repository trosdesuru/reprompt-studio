import { FeedItem } from "@/src/types/models";
import { useState, useEffect, useCallback } from "react";
import { api } from "@/src/services/api";

export function usePublicFeed(query: string) {
  const [feed, setFeed] = useState<FeedItem[]>([]);
  const [isFeedLoading, setIsFeedLoading] = useState(false);
  const [feedError, setFeedError] = useState<string | null>(null);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);

  const loadFeed = useCallback(
    async (isInitial: boolean = false) => {
      if (isFeedLoading || (!isInitial && !hasMore)) return;

      setIsFeedLoading(true);
      setFeedError(null);

      try {
        const currentCursor = isInitial ? null : nextCursor;
        const res = await api.public.getFeed({
          include_self: false,
          cursor: currentCursor,
        });

        const data = await res.json();

        if (data.status === "success") {
          setFeed((prev) => (isInitial ? data.feed : [...prev, ...data.feed]));
          setNextCursor(data.next_cursor);
          setHasMore(!!data.next_cursor);
        }
      } catch (err) {
        console.error("Error cargando feed:", err);
        setFeedError("Hubo un problema al cargar el arte.");
      } finally {
        setIsFeedLoading(false);
      }
    },
    [nextCursor, hasMore, isFeedLoading],
  );

  useEffect(() => {
    if (query) return;
    loadFeed(true);
  }, [query]);

  return {
    feed,
    isFeedLoading,
    feedError,
    hasMore,
    loadMore: () => loadFeed(false),
  };
}
