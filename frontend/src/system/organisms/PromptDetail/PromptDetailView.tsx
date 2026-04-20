import { PromptImageViewer } from "@/src/system/molecules/Cards/PromptImageViewer";
import { PromptMetadataPanel } from "@/src/system/molecules/Cards/PromptMetadataPanel";
import { Breadcrumbs } from "@/src/system/organisms/Navigation/Breadcrumbs";
import { SavedPrompt } from "@/src/types/models";

interface PromptDetailViewProps {
  prompt: SavedPrompt;
  breadcrumbItems: { label: string; href?: string }[];
}

const handleSaveMetadata = async (updatedData: Partial<SavedPrompt>) => {
  // Aquí llamas a tu API: ej. await fetch(`/api/prompts/${prompt.id}`, { method: 'PATCH', ... })
  console.log("Guardando en base de datos:", updatedData);
};

export function PromptDetailView({ prompt, breadcrumbItems }: PromptDetailViewProps) {
  const isLandscape = prompt.width && prompt.height ? prompt.width / prompt.height > 1.2 : false;

  return (
    <main className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="mb-4">
          <Breadcrumbs items={breadcrumbItems} />
        </div>

        <div
          className={`grid gap-8 items-start ${isLandscape ? "grid-cols-1" : "grid-cols-1 lg:grid-cols-2 lg:gap-12"}`}
        >
          <section className="sticky top-24 bg-muted/10 rounded-2xl overflow-hidden border border-border flex items-center justify-center">
            <div
              className={`relative w-full ${isLandscape ? "aspect-video" : "min-h-[50vh] lg:h-[80vh]"}`}
            >
              <PromptImageViewer
                imageUrl={prompt.image_url || null}
                altText={prompt.title || "Imagen generada"}
              />
            </div>
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

            <PromptMetadataPanel prompt={prompt} isOwner={true} onSave={handleSaveMetadata} />
          </section>
        </div>
      </div>
    </main>
  );
}
