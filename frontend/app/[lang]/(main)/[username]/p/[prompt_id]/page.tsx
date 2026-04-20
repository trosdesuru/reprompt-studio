"use client";

import { use } from "react";
import Link from "next/link";
import { usePublicPrompt } from "@/src/features/public/hooks/usePublicPrompt";
import { PromptImageViewer } from "@/src/system/molecules/Cards/PromptImageViewer";
import { PromptMetadataPanel } from "@/src/system/molecules/Cards/PromptMetadataPanel";
import { Breadcrumbs } from "@/src/system/organisms/Navigation/Breadcrumbs";
import { PageLoader } from "@/src/system/atoms/PageLoader";

interface PromptDetailPageProps {
  params: Promise<{ lang: string; username: string; prompt_id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default function PromptDetailPage({ params, searchParams }: PromptDetailPageProps) {
  const { lang, username, prompt_id } = use(params);
  const resolvedSearchParams = use(searchParams);

  const from = resolvedSearchParams?.from;

  const { data, isLoading, error } = usePublicPrompt(prompt_id);

  const isFromStudio = from === "studio";
  const backUrl = isFromStudio ? `/${lang}/studio` : `/${lang}/${username}`;
  const backText = isFromStudio ? "Volver a Mi Studio" : `Volver a @${username}`;

  if (isLoading) {
    return <PageLoader text="Desencriptando datos..." />;
  }

  if (error || !data || !data.prompt) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center font-mono gap-4">
        <p className="text-red-500">{error || "No se pudo cargar el prompt."}</p>
        <Link
          href={backUrl}
          className="text-(--accent-color) hover:underline uppercase text-xs tracking-widest"
        >
          ← {backText}
        </Link>
      </div>
    );
  }

  const prompt = data.prompt;

  const breadcrumbItems = isFromStudio
    ? [{ label: "Mi Studio", href: `/${lang}/studio` }, { label: prompt.title || "Detalle" }]
    : [
        { label: `@${username}`, href: `/${lang}/${username}` },
        { label: prompt.title || "Detalle" },
      ];

  return (
    <main className="max-h-screen bg-background p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="mb-4">
          <Breadcrumbs items={breadcrumbItems} />
        </div>

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
