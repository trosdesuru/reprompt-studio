// app/[lang]/[username]/p/[prompt_id]/page.tsx
"use client";

import { use } from "react";
import { usePublicPrompt } from "@/src/features/public/hooks/usePublicPrompt";
import { PageLoader } from "@/src/system/atoms/PageLoader";
import { PromptErrorState } from "@/src/system/molecules/Feedback/PromptErrorState";
import { PromptDetailView } from "@/src/system/organisms/PromptDetail/PromptDetailView";

interface PromptDetailPageProps {
  params: Promise<{ lang: string; username: string; prompt_id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default function PromptDetailPage({ params, searchParams }: PromptDetailPageProps) {
  const { lang, username, prompt_id } = use(params);
  const resolvedSearchParams = use(searchParams);

  const from = resolvedSearchParams?.from;
  const isFromStudio = from === "studio";

  const { data, isLoading, error } = usePublicPrompt(prompt_id);

  const backUrl = isFromStudio ? `/${lang}/studio` : `/${lang}/${username}`;
  const backText = isFromStudio ? "Volver a Mi Studio" : `Volver a @${username}`;

  if (isLoading) return <PageLoader text="Desencriptando datos..." />;

  if (error || !data || !data.prompt) {
    return <PromptErrorState error={error} backUrl={backUrl} backText={backText} />;
  }

  const prompt = data.prompt;
  const breadcrumbItems = isFromStudio
    ? [{ label: "Mi Studio", href: `/${lang}/studio` }, { label: prompt.title || "Detalle" }]
    : [
        { label: `@${username}`, href: `/${lang}/${username}` },
        { label: prompt.title || "Detalle" },
      ];

  return <PromptDetailView prompt={prompt} breadcrumbItems={breadcrumbItems} />;
}
