import { useState, useEffect } from "react";
import { api } from "@/src/services/api";

export interface FeedItem {
  id: string;
  raw_id: string;
  slug: string;
  type: "prompt" | "collection";
  title: string;
  username: string;
  image_url?: string;
  items_count?: number;
}

export function usePublicFeed(query: string) {
  const [feed, setFeed] = useState<FeedItem[]>([]);
  const [isFeedLoading, setIsFeedLoading] = useState(true);
  const [feedError, setFeedError] = useState<string | null>(null);

  useEffect(() => {
    if (query) return;

    setIsFeedLoading(true);
    setFeedError(null);

    api
      .getPublicFeed()
      .then((res) => setFeed(res.feed || []))
      .catch((err) => {
        console.error("Error cargando feed:", err);
        setFeedError("Hubo un problema al cargar el arte de la comunidad.");
      })
      .finally(() => setIsFeedLoading(false));
  }, [query]);

  return { feed, isFeedLoading, feedError };
}
