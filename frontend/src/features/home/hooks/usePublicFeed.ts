import { FeedItem } from "@/src/types/models";
import { useState, useEffect } from "react";
import { api } from "@/src/services/api";

export function usePublicFeed(query: string) {
  const [feed, setFeed] = useState<FeedItem[]>([]);
  const [isFeedLoading, setIsFeedLoading] = useState(true);
  const [feedError, setFeedError] = useState<string | null>(null);
  const [showMyArt, setShowMyArt] = useState(false);

  useEffect(() => {
    if (query) return;

    setIsFeedLoading(true);
    setFeedError(null);

    api.public
      .getFeed({ include_self: false })
      .then((res) => setFeed(res.feed || []))
      .catch((err) => {
        console.error("Error cargando feed:", err);
        setFeedError("Hubo un problema al cargar el arte de la comunidad.");
      })
      .finally(() => setIsFeedLoading(false));
  }, [query, showMyArt]);

  return { feed, isFeedLoading, showMyArt, setShowMyArt, feedError };
}
