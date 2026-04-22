"use client";

import { useMemo } from "react";
import { useParams } from "next/navigation";
import { PageLoader } from "@/src/system/atoms/PageLoader";
import { DirectoryHeader } from "@/src/system/molecules/Studio/DirectoryHeader";
import { PromptGrid } from "@/src/system/organisms/Studio/PromptGrid";

import { useStudioPrompts } from "@/src/features/studio/hooks/useStudioPrompts";
import { useStudioUI } from "@/src/store/useStudioUI";
import { useStudioSync } from "@/src/features/studio/hooks/useStudioSync";

export function StudioWorkspace() {
  useStudioSync();

  const params = useParams();
  const lang = (params?.lang as string) || "es";

  const { prompts, isLoading, user, deletePrompt } = useStudioPrompts();
  const { activeDirectoryId, directories } = useStudioUI();

  const activeDir = useMemo(
    () => directories.find((d) => String(d.id) === String(activeDirectoryId)),
    [activeDirectoryId, directories],
  );

  const directoryName = activeDirectoryId && activeDir ? activeDir.name : "reprompt root";
  const authorUsername = user?.username || "unknown";

  if (isLoading) {
    return (
      <div className="h-full flex flex-col flex-1 items-center justify-center">
        <PageLoader text="Sincronizando Studio..." />
      </div>
    );
  }

  return (
    <>
      <DirectoryHeader name={directoryName} />
      <PromptGrid
        prompts={prompts}
        lang={lang}
        authorUsername={authorUsername}
        onDelete={deletePrompt}
      />
    </>
  );
}
