"use client";

import { PromptCard } from "@/src/system/molecules/Studio/PromptCard";
import { FadeIn } from "@/src/system/atoms/Animations/FadeIn";
import { IconPhotoOff } from "@tabler/icons-react";
import { SavedPrompt } from "@/src/types/models";
import { useAuthStore } from "@/src/store/authStore";
import { FeedSentinel } from "@/src/system/molecules/Feed/FeedSentinel"; // 🟢 Importamos el vigilante
import { useInfiniteScroll } from "@/src/utils/hooks/useInfiniteScroll"; // 🟢 Importamos tu hook de scroll

interface PromptGridProps {
  prompts: SavedPrompt[];
  lang: string;
  authorUsername: string;
  onDelete: (id: string) => void;
  // 🟢 Recibimos las nuevas funciones del Hook
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
}: PromptGridProps) {
  const { user } = useAuthStore();
  const isOwner = user?.username === authorUsername;

  // 🟢 Armamos el radar de scroll infinito
  const sentinelRef = useInfiniteScroll({
    hasMore,
    isLoading,
    onLoadMore,
    threshold: 0.1, // Dispara un poco antes de llegar al fondo para que sea fluido
  });

  const queueItems =
    prompts?.map((prompt) => ({
      id: String(prompt.id),
      username: authorUsername,
    })) || [];

  // Solo mostramos vacío si no está cargando (para evitar parpadeos iniciales)
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

      {/* 🟢 Colocamos el centinela al fondo. Él se encarga de mostrar "Cargando..." o "Fin" */}
      <FeedSentinel
        ref={sentinelRef as React.RefObject<HTMLDivElement>}
        isLoading={isLoading}
        hasMore={hasMore}
        isEmpty={prompts.length === 0}
      />
    </>
  );
}
