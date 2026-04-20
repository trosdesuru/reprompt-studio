"use client";

import { useParams } from "next/navigation";
import { IconPhotoOff } from "@tabler/icons-react";
import { PageLoader } from "../../atoms/PageLoader";
import { PromptCard } from "./PromptCard";
import { useStudioPrompts } from "@/src/features/studio/hooks/useStudioPrompts";

export default function PromptGrid() {
  const params = useParams();
  const lang = (params?.lang as string) || "es";

  const { prompts, isLoading, user, deletePrompt } = useStudioPrompts();

  if (isLoading) {
    return (
      <div className="h-full flex flex-col flex-1 items-center justify-center">
        <PageLoader text="Sincronizando Studio..." />
      </div>
    );
  }

  if (prompts.length === 0) {
    return (
      <div className="h-full flex flex-col flex-1 items-center justify-center text-muted-foreground/40">
        <IconPhotoOff size={48} stroke={1.5} className="mb-4" />
        <p className="text-sm font-mono uppercase tracking-widest text-center px-4">
          No se encontraron prompts en este rincón
        </p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4 mx-auto w-full max-w-7xl">
        {prompts.map((prompt, index) => (
          <PromptCard
            key={prompt.id}
            item={prompt}
            index={index}
            lang={lang}
            isStudio={true}
            authorUsername={user?.username || "unknown"}
            isPriority={index < 8}
            onDelete={deletePrompt}
          />
        ))}
      </div>
    </div>
  );
}
