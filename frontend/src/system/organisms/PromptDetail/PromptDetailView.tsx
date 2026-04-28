"use client";

import { useAuthStore } from "@/src/store/authStore";
import { PromptImageViewer } from "@/src/system/molecules/Cards/PromptImageViewer";
import { PromptMetadataPanel } from "@/src/system/molecules/Cards/PromptMetadataPanel";
import { Breadcrumbs } from "@/src/system/molecules/Navigation/Breadcrumbs";
import { SavedPrompt } from "@/src/types/models";
import { useUpdatePromptMetadata } from "@/src/features/studio/hooks/useUpdatePromptMetadata";
import { Button } from "@/src/system/atoms/Button/Button";
import { Tooltip } from "../../atoms/Tooltip/Tooltip";
import { IconChevronUp } from "@tabler/icons-react";

import { PromptProfileHeader } from "@/src/features/prompts/components/PromptProfileHeader";
import { PromptNavigation } from "@/src/features/prompts/components/PromptNavigation";

// 🟢 1. Importamos la molécula del título
import { PromptTitleHeader } from "@/src/features/prompts/components/PromptTitleHeader";

interface PromptDetailViewProps {
  prompt: SavedPrompt;
  breadcrumbItems: { label: string; href?: string }[];
  lang: string;
  authorUsername: string;
  authorAvatar?: string;
}

export function PromptDetailView({
  prompt,
  breadcrumbItems,
  lang,
  authorUsername,
  authorAvatar,
}: PromptDetailViewProps) {
  const { user } = useAuthStore();
  const isOwner = user?.username === authorUsername;

  const { handleSaveMetadata } = useUpdatePromptMetadata(String(prompt.id));

  return (
    <main className="min-h-screen bg-background p-0 md:p-6 lg:p-8">
      <div className="max-w-400 w-full mx-auto flex flex-col">
        <div className="shrink-0 mb-4 lg:mb-6 px-4 md:px-0 pt-4 md:pt-0">
          <Breadcrumbs items={breadcrumbItems} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_380px] xl:grid-cols-[minmax(0,1fr)_420px] gap-6 lg:gap-10 items-start">
          <section className="group relative bg-muted/5 flex items-center justify-center w-full min-h-[60vh] lg:h-[calc(100vh-8rem)] lg:sticky lg:top-8 lg:rounded-3xl lg:border border-border/50 overflow-hidden shadow-inner">
            <PromptNavigation currentId={String(prompt.id)} lang={lang} />

            <div className="absolute inset-0 p-0 lg:p-4">
              <PromptImageViewer
                imageUrl={prompt.image_url || null}
                altText={prompt.title || "Imagen generada"}
                width={prompt.width}
                height={prompt.height}
              />
            </div>

            <a
              href="#metadata-panel"
              className="lg:hidden absolute bottom-6 left-1/2 -translate-x-1/2 z-40 flex flex-col items-center gap-1 text-muted-foreground hover:text-foreground transition-colors bg-background/80 backdrop-blur-md px-5 py-2 rounded-full border border-border/50 shadow-lg"
            >
              <IconChevronUp size={18} className="animate-bounce" />
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest">
                Metadata
              </span>
            </a>
          </section>

          <section id="metadata-panel" className="flex flex-col gap-6 px-4 md:px-0 pb-24 lg:pb-12">
            {!isOwner && (
              <div className="shrink-0">
                <PromptProfileHeader
                  author={{ username: authorUsername, avatar_url: authorAvatar }}
                  lang={lang}
                />
              </div>
            )}

            <div className="shrink-0">
              <PromptTitleHeader title={prompt.title} createdAt={prompt.created_at} />
            </div>

            <PromptMetadataPanel prompt={prompt} isOwner={isOwner} onSave={handleSaveMetadata} />

            {!isOwner && (
              <div className="pt-6 mt-4 border-t border-border/30">
                <Tooltip variant="default" content="Servicio en desarrollo">
                  <Button
                    variant="disabled"
                    className="w-full font-bold tracking-widest text-xs h-12"
                  >
                    GUARDAR EN MI COLECCIÓN
                  </Button>
                </Tooltip>
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
