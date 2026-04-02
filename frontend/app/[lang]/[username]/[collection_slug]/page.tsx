"use client";

import { use, useEffect, useState } from "react";
import { api } from "@/src/services/api";
import { PromptCard } from "@/src/system/organisms/Studio/PromptCard";
import { SavedPrompt } from "@/src/features/studio/hooks/useStudio";
import Link from "next/link";
import { IconArrowLeft, IconPhotoOff } from "@tabler/icons-react";

interface CollectionData {
  user: { username: string };
  collection: { name: string; description: string };
  prompts: SavedPrompt[];
}

export default function PublicCollectionPage({
  params,
}: {
  params: Promise<{ lang: string; username: string; collection_slug: string }>;
}) {
  const { lang, username, collection_slug } = use(params);
  const [data, setData] = useState<CollectionData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .getPublicCollection(username, collection_slug)
      .then((res) => setData(res))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [username, collection_slug]);

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center font-mono animate-pulse">
        Cargando colección...
      </div>
    );
  if (!data)
    return (
      <div className="min-h-screen flex items-center justify-center font-mono text-red-500">
        Colección no encontrada o privada.
      </div>
    );

  return (
    <main className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <Link
          href={`/${lang}/${username}`}
          className="inline-flex items-center gap-2 text-xs font-mono text-muted-foreground hover:text-foreground transition-colors uppercase tracking-widest"
        >
          <IconArrowLeft size={16} /> Volver a @{data.user.username}
        </Link>

        <header className="flex flex-col gap-2 border-b border-border pb-8">
          <h1 className="text-4xl font-black tracking-tighter text-(--accent-color)">
            {data.collection.name}
          </h1>
          <p className="text-muted-foreground text-sm max-w-2xl">
            {data.collection.description || "Colección sin descripción."}
          </p>
        </header>

        {data.prompts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground/50 bg-muted/5 rounded-xl border border-dashed border-border/50">
            <IconPhotoOff size={48} stroke={1} className="mb-4" />
            <p className="font-mono text-xs uppercase tracking-widest">Esta colección está vacía</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {data.prompts.map((prompt) => (
              <PromptCard key={prompt.id} item={prompt} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
