"use client";

import { useAuthStore } from "@/src/store/authStore";
import { PromptImageViewer } from "@/src/system/molecules/Cards/PromptImageViewer";
import { PromptMetadataPanel } from "@/src/system/molecules/Cards/PromptMetadataPanel";
import { Breadcrumbs } from "@/src/system/molecules/Navigation/Breadcrumbs";
import { SavedPrompt } from "@/src/types/models";
import { useUpdatePromptMetadata } from "@/src/features/studio/hooks/useUpdatePromptMetadata";
import { Button } from "@/src/system/atoms/Button/Button";
import { Tooltip } from "../../atoms/Tooltip/Tooltip";

import { PromptProfileHeader } from "@/src/features/prompts/components/PromptProfileHeader";
import { PromptNavigation } from "@/src/features/prompts/components/PromptNavigation";
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
    <main className="bg-background p-0 md:p-6 lg:p-8 flex flex-col min-h-screen lg:min-h-0 lg:h-[calc(100dvh-64px)] lg:overflow-hidden">
      <div className="max-w-400 w-full mx-auto flex flex-col h-full min-h-0">
        <div className="shrink-0 mb-4 lg:mb-6 px-4 md:px-0 pt-4 md:pt-0">
          <Breadcrumbs items={breadcrumbItems} />
        </div>

        <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_380px] xl:grid-cols-[minmax(0,1fr)_420px] gap-6 lg:gap-10">
          <section className="group relative bg-muted/5 flex items-center justify-center w-full min-h-[60vh] overflow-hidden">
            <div className="absolute inset-0 z-20 pointer-events-none">
              <div className="w-full h-full relative pointer-events-auto">
                <PromptNavigation currentId={String(prompt.id)} lang={lang} />
              </div>
            </div>

            <div className="absolute inset-0 p-2 lg:p-6 flex items-center justify-center z-10">
              <PromptImageViewer
                imageUrl={prompt.image_url || null}
                altText={prompt.title || "Imagen generada"}
                width={prompt.width}
                height={prompt.height}
              />
            </div>
          </section>

          <section
            id="metadata-panel"
            className="flex flex-col gap-6 px-4 md:px-0 pb-24 lg:pb-12 lg:h-full lg:overflow-y-auto custom-scrollbar lg:pr-4"
          >
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
              <div className="pt-6 lg:mt-auto border-t border-border/30 shrink-0">
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
