import { IconPhotoOff } from "@tabler/icons-react";
import { PromptCard } from "../../molecules/Studio/PromptCard";
import { SavedPrompt } from "@/src/types/models";

interface PromptGridProps {
  prompts: SavedPrompt[];
  lang: string;
  authorUsername: string;
  onDelete: (id: string) => void;
}

export function PromptGrid({ prompts, lang, authorUsername, onDelete }: PromptGridProps) {
  if (prompts.length === 0) {
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
    <div className="grid gap-3 sm:gap-4 w-full pb-24 grid-cols-[repeat(auto-fill,minmax(150px,1fr))] sm:grid-cols-[repeat(auto-fill,minmax(200px,1fr))] lg:grid-cols-[repeat(auto-fill,minmax(220px,1fr))]">
      {prompts.map((prompt, index) => (
        <PromptCard
          key={prompt.id}
          item={prompt}
          index={index}
          lang={lang}
          isStudio={true}
          authorUsername={authorUsername}
          isPriority={index < 8}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
