"use client";

import { use } from "react";
import Link from "next/link";
import { IconArrowLeft } from "@tabler/icons-react";

import { usePublicPrompt } from "@/src/features/studio/hooks/usePublicPrompt";
import { PromptImageViewer } from "@/src/system/organisms/Studio/PromptImageViewer";
import { PromptMetadataPanel } from "@/src/system/organisms/Studio/PromptMetadataPanel";
import { PageLoader } from "@/src/system/atoms/PageLoader";

export default function PromptDetailPage({
  params,
}: {
  params: Promise<{ lang: string; username: string; prompt_id: string }>;
}) {
  const { lang, username, prompt_id } = use(params);

  const { data: prompt, isLoading, error } = usePublicPrompt(prompt_id);

  if (isLoading) {
    return <PageLoader text="Desencriptando datos..." />;
  }

  if (error || !prompt) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center font-mono gap-4">
        <p className="text-red-500">{error || "No se pudo cargar el prompt."}</p>
        <Link
          href={`/${lang}/${username}`}
          className="text-(--accent-color) hover:underline uppercase text-xs tracking-widest"
        >
          ← Volver al perfil
        </Link>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <Link
          href={`/${lang}/${username}`}
          className="inline-flex items-center gap-2 text-sm font-mono text-muted-foreground hover:text-(--accent-color) transition-colors uppercase tracking-widest"
        >
          <IconArrowLeft size={16} /> Volver a @{username}
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 items-start">
          <section className="sticky top-24">
            <PromptImageViewer
              imageUrl={prompt.image_url || null}
              altText={`Generación por @${username}`}
            />
          </section>

          <section className="space-y-6">
            <header>
              <h1 className="text-2xl font-black uppercase tracking-tighter mb-2">
                {prompt.title || "Prompt Sin Título"}
              </h1>
              <p className="text-sm font-mono text-muted-foreground">
                Creado el {new Date(prompt.created_at).toLocaleDateString()}
              </p>
            </header>

            <PromptMetadataPanel prompt={prompt} />
          </section>
        </div>
      </div>
    </main>
  );
}
