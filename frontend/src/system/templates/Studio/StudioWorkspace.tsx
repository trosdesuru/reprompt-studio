"use client";

import { useParams } from "next/navigation";
import { PageLoader } from "@/src/system/atoms/Loader/PageLoader";
import { PromptGrid } from "@/src/features/studio/components/PromptGrid";

import { useStudioPrompts } from "@/src/features/studio/hooks/useStudioPrompts";
import { useStudioSync } from "@/src/features/studio/hooks/useStudioSync";

export function StudioWorkspace() {
  useStudioSync();

  const params = useParams();
  const lang = (params?.lang as string) || "es";
  const { prompts, isLoading, user, hasMore, loadMore, deletePrompt } = useStudioPrompts();
  const authorUsername = user?.username || "unknown";

  if (isLoading && prompts.length === 0) {
    return (
      <div className="h-full flex flex-col flex-1 items-center justify-center">
        <PageLoader text="Sincronizando Studio..." />
      </div>
    );
  }

  return (
    <PromptGrid
      prompts={prompts}
      lang={lang}
      authorUsername={authorUsername}
      onDelete={deletePrompt}
      isLoading={isLoading}
      hasMore={hasMore}
      onLoadMore={loadMore}
    />
  );
}
