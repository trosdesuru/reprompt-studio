"use client";

import { useEffect, useRef } from "react";
import { FeedItemCard } from "@/src/system/molecules/Cards/FeedItemCard";
import { FeedState } from "@/src/system/molecules/Feedback/FeedState";
import { FeedItem } from "@/src/types/models";
import { FadeIn } from "../../atoms/Animations/FadeIn";

interface PublicFeedGridProps {
  feed: FeedItem[];
  isLoading: boolean;
  lang: string;
  hasMore: boolean;
  onLoadMore: () => void;
}

export function PublicFeedGrid({
  feed,
  isLoading,
  lang,
  hasMore,
  onLoadMore,
}: PublicFeedGridProps) {
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoading) {
          onLoadMore();
        }
      },
      { threshold: 0.5 },
    );

    if (sentinelRef.current) observer.observe(sentinelRef.current);

    return () => observer.disconnect();
  }, [hasMore, isLoading, onLoadMore]);

  return (
    <div className="pt-8">
      <h2 className="text-xl font-black font-mono uppercase tracking-widest text-(--accent-color) mb-6">
        Explora la Comunidad
      </h2>

      <div className="mx-auto columns-1 sm:columns-2 md:columns-3 lg:columns-4 xl:columns-5 gap-6">
        {feed.map((item, index) => (
          <div key={item.id} className="break-inside-avoid mb-6 inline-block w-full">
            <FadeIn delay={0.1} y={20} className="h-full">
              <FeedItemCard item={item} lang={lang} index={index} />
            </FadeIn>
          </div>
        ))}
      </div>

      <div ref={sentinelRef} className="h-20 flex items-center justify-center mt-10">
        {isLoading && <FeedState type="loading" />}
        {!hasMore && feed.length > 0 && (
          <p className="text-muted-foreground font-mono text-xs uppercase text-center">
            — Fin de la transmisión —
          </p>
        )}
      </div>
    </div>
  );
}
