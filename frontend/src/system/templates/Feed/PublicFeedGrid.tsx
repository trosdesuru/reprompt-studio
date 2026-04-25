"use client";

import { FeedItemCard } from "@/src/system/molecules/Cards/FeedItemCard";
import { FadeIn } from "../../atoms/Animations/FadeIn";
import { FeedItem } from "@/src/types/models";
import { useResponsiveColumns } from "@/src/utils/hooks/useResponsiveColumns";

interface PublicFeedGridProps {
  feed: FeedItem[];
  lang: string;
}

export function PublicFeedGrid({ feed, lang }: PublicFeedGridProps) {
  const { columns, columnCount } = useResponsiveColumns(feed);

  if (!feed || feed.length === 0) return null;

  return (
    <div className="flex gap-4 sm:gap-2 w-full items-start">
      {columns.map((colItems, colIndex) => (
        <div key={colIndex} className="flex flex-col gap-4 sm:gap-2 flex-1 min-w-0">
          {colItems.map((item, itemIndex) => {
            const globalIndex = colIndex + itemIndex * columnCount;

            return (
              <div key={item.id} className="w-full">
                <FadeIn delay={0.05} y={15}>
                  <FeedItemCard
                    item={item}
                    lang={lang}
                    index={globalIndex}
                    isPriority={globalIndex < 10}
                  />
                </FadeIn>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
