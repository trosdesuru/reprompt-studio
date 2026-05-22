"use client";

import { PromptCard } from "@/src/system/molecules/Studio/PromptCard";
import { PromptListCard } from "@/src/features/studio/components/PromptCard/PromptListCard";
import { FadeIn } from "@/src/system/atoms/Animations/FadeIn";
import { IconPhotoOff } from "@tabler/icons-react";
import { SavedPrompt } from "@/src/types/models";
import { useAuthStore } from "@/src/store/authStore";
import { useStudioUI } from "@/src/store/useStudioUI";
import { FeedSentinel } from "@/src/system/molecules/Feed/FeedSentinel";
import { useInfiniteScroll } from "@/src/utils/hooks/useInfiniteScroll";

interface PromptGridProps {
  prompts: SavedPrompt[];
  lang: string;
  authorUsername: string;
  onDelete: (id: string) => void;
  isLoading?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
}

export function PromptGrid({
  prompts,
  lang,
  authorUsername,
  onDelete,
  isLoading = false,
  hasMore = false,
  onLoadMore = () => {},
}: Readonly<PromptGridProps>) {
  const { user } = useAuthStore();
  const isOwner = user?.username === authorUsername;

  const viewMode = useStudioUI((state) => state.viewMode);

  const sentinelRef = useInfiniteScroll({
    hasMore,
    isLoading,
    onLoadMore,
    threshold: 0.1,
  });

  const queueItems =
    prompts?.map((prompt) => ({
      id: String(prompt.id),
      username: authorUsername,
    })) || [];

  if ((!prompts || prompts.length === 0) && !isLoading) {
    return (
      <div className="flex-1 min-h-[50vh] flex flex-col items-center justify-center text-muted-foreground/40 bg-muted/5">
        <IconPhotoOff size={48} stroke={1.5} className="mb-4" />
        <p className="text-sm font-mono uppercase tracking-widest text-center px-4">
          Este directorio está vacío.
        </p>
      </div>
    );
  }

  return (
    <>
      {viewMode === "grid" ? (
        <div className="grid grid-cols-2 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6 w-full items-start">
          {prompts.map((prompt, index) => (
            <div key={prompt.id} className="w-full">
              <FadeIn delay={0.05} y={15}>
                <PromptCard
                  item={prompt}
                  index={index}
                  lang={lang}
                  isStudio={true}
                  authorUsername={authorUsername}
                  isPriority={index < 8}
                  onDelete={isOwner ? onDelete : undefined}
                  queueItems={queueItems}
                />
              </FadeIn>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-3 w-full items-stretch animate-fade-in">
          {prompts.map((prompt, index) => (
            <div key={prompt.id} className="w-full">
              <FadeIn delay={0.02 * index} y={8}>
                <PromptListCard
                  item={prompt}
                  index={index}
                  lang={lang}
                  isStudio={true}
                  authorUsername={authorUsername}
                  isPriority={index < 12}
                  onDelete={isOwner ? onDelete : undefined}
                  queueItems={queueItems}
                />
              </FadeIn>
            </div>
          ))}
        </div>
      )}

      <FeedSentinel
        ref={sentinelRef}
        isLoading={isLoading}
        hasMore={hasMore}
        isEmpty={prompts.length === 0}
      />
    </>
  );
}
