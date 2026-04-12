"use client";

import { use, useState } from "react";
import { useStudio } from "@/src/features/studio/hooks/useStudio";
import { PromptCard } from "@/src/system/organisms/Studio/PromptCard";
import { CreateCollectionModal } from "@/src/system/molecules/Cards/CreateCollectionModal";
import { IconPlus, IconAlbum, IconScanTraces, IconLock, IconWorld } from "@tabler/icons-react";
import { useAuthStore } from "@/src/store/authStore";
import Link from "next/link";
import { PageLoader } from "@/src/system/atoms/PageLoader";
import { Breadcrumbs } from "@/src/system/organisms/Navigation/Breadcrumbs";
import { BulkActionBar } from "@/src/system/organisms/Studio/BulkActionBar";

export default function StudioPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = use(params);
  const user = useAuthStore((state: any) => state.user);
  const {
    prompts,
    collections,
    isLoading,
    error,
    deletePrompt,
    assignToCollection,
    refetch,
    deletePromptsBatch,
    isDeletingBatch,
  } = useStudio();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const breadcrumbItems = [{ label: "Mi Studio" }];

  if (isLoading) return <PageLoader text="Cargando Metadata ..." />;
  if (error) throw new Error(error);

  const handleToggleSelect = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((pId) => pId !== id) : [...prev, id],
    );
  };

  const handleBatchDelete = async () => {
    if (
      window.confirm(
        `¿Seguro que deseas eliminar estas ${selectedIds.length} imágenes para siempre?`,
      )
    ) {
      const success = await deletePromptsBatch(selectedIds);
      if (success) {
        setSelectedIds([]); // Vaciamos la selección para que desaparezca la barra
      }
    }
  };

  const handleClearSelection = () => setSelectedIds([]);

  return (
    <main className="max-h-screen bg-background p-4 md:p-8 relative pb-24">
      <BulkActionBar
        selectedCount={selectedIds.length}
        onClearSelection={handleClearSelection}
        onDeleteSelected={handleBatchDelete}
        onDownloadSelected={() => console.log("Descargando IDs:", selectedIds)}
        isDeleting={isDeletingBatch}
      />

      <div className="max-w-7xl mx-auto space-y-8">
        <div>
          <Breadcrumbs items={breadcrumbItems} />
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border pb-8 mt-4">
          <div>
            <h1 className="text-3xl font-black tracking-tighter flex items-center gap-3">
              <IconAlbum className="text-(--accent-color)" size={32} /> Mi Studio
            </h1>
            <p className="text-muted-foreground mt-1">
              Gestiona tus <span className="font-mono font-medium text-accent">reprompt</span>.
            </p>
          </div>

          <div className="flex gap-3">
            <Link
              href={`/${lang}/reprompt`}
              className="bg-background border border-accent hover:bg-accent/20 text-accent px-4 py-2 rounded-md font-mono text-sm font-bold uppercase tracking-widest transition-colors flex items-center gap-2"
            >
              <IconScanTraces className="text-accent" size={18} /> reprompt
            </Link>
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-(--accent-color) text-foreground px-4 py-2 rounded-md font-mono text-sm font-bold uppercase tracking-widest hover:bg-opacity-90 hover:text-popover transition-colors flex items-center gap-2 cursor-pointer"
            >
              <IconPlus size={18} /> Crear Colección
            </button>
          </div>
        </div>

        {collections.length > 0 && (
          <section className="space-y-4 mb-12">
            <h2 className="text-sm font-mono font-bold uppercase tracking-widest text-muted-foreground">
              Tus Colecciones
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {collections.map((col) => (
                <Link
                  key={col.id}
                  href={`/${lang}/${user?.username}/${col.slug}`}
                  className="group relative p-5 bg-(--bg-secondary) neo-border hover:border-accent! hover:bg-accent/15 transition-all neo-shadow flex flex-col justify-between min-h-120px"
                >
                  <div className="flex justify-between items-start">
                    <IconAlbum
                      size={24}
                      className="text-muted-foreground group-hover:text-accent transition-colors"
                    />
                    <div className="text-muted-foreground hover:text-accent">
                      {col.is_private ? (
                        <IconLock size={16} title="Colección Privada" />
                      ) : (
                        <IconWorld size={16} title="Colección Pública" />
                      )}
                    </div>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg font-mono uppercase tracking-tight truncate mt-4">
                      {col.name}
                    </h3>
                  </div>
                </Link>
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
                  isSelected={selectedIds.includes(prompt.id)}
                  onToggleSelect={() => handleToggleSelect(prompt.id)}
                  selectionModeActive={selectedIds.length > 0}
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
