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
  const [showMyArt, setShowMyArt] = useState(false);

  useEffect(() => {
    if (query) return;

    setIsFeedLoading(true);
    setFeedError(null);

    api
      .getPublicFeed({ include_self: showMyArt })
      .then((res) => setFeed(res.feed || []))
      .catch((err) => {
        console.error("Error cargando feed:", err);
        setFeedError("Hubo un problema al cargar el arte de la comunidad.");
      })
      .finally(() => setIsFeedLoading(false));
  }, [query, showMyArt]);

  return { feed, isFeedLoading, showMyArt, setShowMyArt, feedError };
}
