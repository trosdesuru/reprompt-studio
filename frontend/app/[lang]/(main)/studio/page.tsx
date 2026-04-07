"use client";

import { use, useState } from "react";
import { useStudio } from "@/src/features/studio/hooks/useStudio";
import { PromptCard } from "@/src/system/organisms/Studio/PromptCard";
import { CreateCollectionModal } from "@/src/system/molecules/Cards/CreateCollectionModal";
import { IconPlus, IconLock, IconAlbum, IconCpu } from "@tabler/icons-react";
import { useAuthStore } from "@/src/store/authStore";
import Link from "next/link";
import { PageLoader } from "@/src/system/atoms/PageLoader";
import { Breadcrumbs } from "@/src/system/organisms/Navigation/Breadcrumbs";

export default function StudioPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = use(params);
  const user = useAuthStore((state: any) => state.user);
  const { prompts, collections, isLoading, error, deletePrompt, assignToCollection, refetch } =
    useStudio();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const breadcrumbItems = [{ label: "Mi Studio" }];

  if (isLoading) return <PageLoader text="Cargando Metadata ..." />;

  if (error) {
    throw new Error(error);
  }

  return (
    <main className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {" "}
        <div>
          <Breadcrumbs items={breadcrumbItems} />
        </div>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border pb-8 mt-4">
          <div>
            <h1 className="text-3xl font-black tracking-tighter flex items-center gap-3">
              <IconAlbum className="text-(--accent-color)" size={32} /> Mi Studio
            </h1>
            <p className="text-muted-foreground mt-1">Gestiona tus prompts y galerías.</p>
          </div>

          <div className="flex gap-3">
            <Link
              href={`/${lang}/reprompt`}
              className="bg-background border border-border hover:bg-muted/30 text-foreground px-4 py-2 rounded-md font-mono text-sm font-bold uppercase tracking-widest transition-colors flex items-center gap-2"
            >
              <IconCpu size={18} /> Extraer Más
            </Link>
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-(--accent-color) text-white px-4 py-2 rounded-md font-mono text-sm font-bold uppercase tracking-widest hover:bg-opacity-90 transition-colors flex items-center gap-2"
            >
              <IconPlus size={18} /> Nueva Colección
            </button>
          </div>
        </div>
        {collections.length > 0 && (
          <section className="space-y-4">
            <h2 className="text-sm font-mono font-bold uppercase tracking-widest text-muted-foreground">
              Tus Colecciones
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {collections.map((col) => (
                <div
                  key={col.id}
                  className="p-4 bg-background border border-border rounded-xl hover:shadow-md transition-shadow relative"
                >
                  {col.is_private && (
                    <IconLock
                      size={14}
                      className="absolute top-4 right-4 text-muted-foreground/50"
                    />
                  )}
                  <h3 className="font-bold text-lg">{col.name}</h3>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                    {col.description || "Sin descripción"}
                  </p>
                  <div className="mt-4 pt-4 border-t border-border/50 flex justify-between items-center text-xs font-mono">
                    <span className="text-muted-foreground">
                      {prompts.filter((p) => p.collection_id === col.id).length} items
                    </span>
                    <Link
                      href={`/${lang}/${user?.username}/${col.slug}`}
                      className="text-(--accent-color) hover:underline"
                    >
                      Ver Pública &rarr;
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
        <section className="space-y-4">
          <h2 className="text-sm font-mono font-bold uppercase tracking-widest text-muted-foreground">
            Todos tus Prompts
          </h2>
          {prompts.length === 0 ? (
            <div className="text-center py-20 bg-muted/10 border border-dashed border-border rounded-xl">
              <p className="text-muted-foreground font-mono">Aún no hay prompts guardados.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {prompts.map((prompt, index) => (
                <PromptCard
                  key={prompt.id}
                  item={prompt}
                  collections={collections}
                  index={index}
                  isPriority={index < 6}
                  onDelete={deletePrompt}
                  onAssign={assignToCollection}
                  lang={lang}
                  isStudio={true}
                  authorUsername={user?.username}
                />
              ))}
            </div>
          )}
        </section>
      </div>

      <CreateCollectionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={refetch}
      />
    </main>
  );
}
