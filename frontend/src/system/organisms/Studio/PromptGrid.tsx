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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        {prompts.map((p: any, index: number) => (
          <PromptCard
            key={p.id}
            item={p}
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
