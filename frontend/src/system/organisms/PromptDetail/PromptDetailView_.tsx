"use client";

import { useAuthStore } from "@/src/store/authStore";
import { PromptImageViewer } from "@/src/system/molecules/Cards/PromptImageViewer";
import { PromptMetadataPanel } from "@/src/system/molecules/Cards/PromptMetadataPanel";
import { Breadcrumbs } from "@/src/system/molecules/Navigation/Breadcrumbs";
import { SavedPrompt } from "@/src/types/models";
import { useUpdatePromptMetadata } from "@/src/features/studio/hooks/useUpdatePromptMetadata";
import { Button } from "@/src/system/atoms/Button/Button";

import { PromptProfileHeader } from "@/src/features/prompts/components/PromptProfileHeader";
import { PromptNavigation } from "@/src/features/prompts/components/PromptNavigation";
import { Tooltip } from "../../atoms/Tooltip/Tooltip";

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

  const isLandscape = prompt.width && prompt.height ? prompt.width / prompt.height > 1.2 : false;

  const { handleSaveMetadata } = useUpdatePromptMetadata(String(prompt.id));

  return (
    <main className="h-[calc(100dvh-64px)] bg-background p-4 md:p-8 overflow-hidden flex flex-col">
      <div className="max-w-7xl w-full mx-auto flex flex-col h-full">
        <div className="shrink-0 mb-6">
          <Breadcrumbs items={breadcrumbItems} />
        </div>

        <div
          className={`flex-1 min-h-0 grid gap-6 lg:gap-12 ${
            isLandscape
              ? "grid-cols-1 overflow-y-auto pb-10 custom-scrollbar"
              : "grid-cols-1 lg:grid-cols-2"
          }`}
        >
          <section
            className={`group relative rounded-2xl overflow-hidden border border-border bg-muted/10 flex items-center justify-center ${
              isLandscape ? "w-full aspect-video" : "h-full min-h-0"
            }`}
          >
            <PromptNavigation currentId={String(prompt.id)} lang={lang} />

            <div className="w-full h-full relative">
              <PromptImageViewer
                imageUrl={prompt.image_url || null}
                altText={prompt.title || "Imagen generada"}
                width={prompt.width}
                height={prompt.height}
              />
            </div>
          </section>

          <section className="flex flex-col h-full min-h-0">
            {!isOwner && (
              <div className="shrink-0 mb-6">
                <PromptProfileHeader
                  author={{ username: authorUsername, avatar_url: authorAvatar }}
                  lang={lang}
                />
              </div>
            )}

            <header className="shrink-0 mb-6">
              <h1 className="text-2xl lg:text-3xl font-black uppercase tracking-tighter mb-2">
                {prompt.title || "Prompt Sin Título"}
              </h1>
              <p className="text-sm font-mono text-muted-foreground">
                Creado el {new Date(prompt.created_at).toLocaleDateString()}
              </p>
            </header>

            <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 pb-12 flex flex-col">
              <PromptMetadataPanel prompt={prompt} isOwner={isOwner} onSave={handleSaveMetadata} />

              {!isOwner && (
                <div className="pt-6 mt-6 border-t border-border/30">
                  <Tooltip variant="default" content="Servicio en desarrrollo">
                    <Button variant="disabled" className="w-full">
                      GUARDAR EN MI COLECCIÓN
                    </Button>
                  </Tooltip>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
