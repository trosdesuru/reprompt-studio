"use client";

import { PromptCard } from "@/src/system/molecules/Studio/PromptCard";
import { FadeIn } from "@/src/system/atoms/Animations/FadeIn";
import { IconPhotoOff } from "@tabler/icons-react";
import { SavedPrompt } from "@/src/types/models";
import { useAuthStore } from "@/src/store/authStore";

interface PromptGridProps {
  prompts: SavedPrompt[];
  lang: string;
  authorUsername: string;
  onDelete: (id: string) => void;
}

export function PromptGrid({ prompts, lang, authorUsername, onDelete }: PromptGridProps) {
  const { user } = useAuthStore();
  const isOwner = user?.username === authorUsername;

  if (!prompts || prompts.length === 0) {
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
    <div className="grid grid-cols-2 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6 w-full pb-24 items-start">
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
            />
          </FadeIn>
        </div>
      ))}
    </div>
  );
}
