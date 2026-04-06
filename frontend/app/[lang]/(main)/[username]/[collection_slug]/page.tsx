"use client";

import { use } from "react";
import Link from "next/link";
import { IconArrowLeft, IconFolder, IconPhotoOff } from "@tabler/icons-react";

import { PromptCard } from "@/src/system/molecules/Cards/PromptCard";
import { usePublicCollection } from "@/src/features/studio/hooks/usePublicCollection";
import { FadeIn } from "@/src/system/atoms/FadeIn";

export default function PublicCollectionPage({
  params,
}: {
  params: Promise<{ lang: string; username: string; collection_slug: string }>;
}) {
  const { lang, username, collection_slug } = use(params);

  const { data, isLoading, error } = usePublicCollection(username, collection_slug);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center font-mono animate-pulse">
        Descifrando la colección...
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center font-mono gap-4">
        <p className="text-red-500">{error || "Colección no encontrada."}</p>
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
    <FadeIn duration={0.8}>
      <main className="min-h-screen bg-background p-4 md:p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          <Link
            href={`/${lang}/${username}`}
            className="inline-flex items-center gap-2 text-sm font-mono text-muted-foreground hover:text-(--accent-color) transition-colors uppercase tracking-widest"
          >
            <IconArrowLeft size={16} /> Perfil de @{username}
          </Link>

          <header className="flex flex-col gap-2 border-b border-border pb-8">
            <div className="flex items-center gap-3">
              <IconFolder size={32} className="text-(--accent-color)" />
              <h1 className="text-3xl md:text-4xl font-black tracking-tighter uppercase">
                {data.collection.name}
              </h1>
            </div>
            {data.collection.description && (
              <p className="text-muted-foreground font-mono mt-2">{data.collection.description}</p>
            )}
          </header>
          <section>
            {data.prompts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-muted-foreground/50 bg-muted/5 rounded-xl border border-dashed border-border/50">
                <IconPhotoOff size={48} stroke={1} className="mb-4" />
                <p className="font-mono text-xs uppercase tracking-widest">
                  Esta colección está vacía
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {data.prompts.map((prompt, index) => (
                  <FadeIn key={prompt.id} delay={0.3 + index * 0.05} y={15}>
                    <PromptCard
                      key={prompt.id}
                      item={prompt}
                      index={index}
                      isPriority={index < 6}
                    />
                  </FadeIn>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
    </FadeIn>
  );
}
