"use client";

import { usePromptExtractor } from "@/src/features/extractor/hooks/usePromptExtractor";
import { ExtractorDropzone } from "@/src/system/organisms/Extractor/Dropzone";
import { BatchInspector } from "@/src/system/organisms/Extractor/Inspector/BatchInspector";

export default function RepromptPage() {
  const {
    processFiles,
    isExtracting,
    error,
    batch,
    skippedFiles,
    updateItemStatus,
    removeItem,
    clearBatch,
    clearSkipped,
  } = usePromptExtractor();

  return (
    <main className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-12">
        <section className="text-center space-y-6 pt-10 pb-6">
          <h1 className="text-5xl md:text-7xl font-black uppercase font-mono tracking-tighter text-foreground">
            Estudio <span className="text-(--accent-color)">REPROMPT</span>
          </h1>
          <p className="text-xl md:text-2xl text-(--text-secondary) font-mono max-w-3xl mx-auto leading-relaxed">
            Arrastra múltiples imágenes o archivos ZIP para extraer metadatos en lote.
          </p>
        </section>

        <section className="w-full max-w-7xl mx-auto">
          {batch.length === 0 ? (
            <ExtractorDropzone
              onFileDrop={processFiles}
              isExtracting={isExtracting}
              error={error}
            />
          ) : (
            <BatchInspector
              batch={batch}
              skippedFiles={skippedFiles}
              onUpdateStatus={updateItemStatus}
              onRemoveItem={removeItem}
              onClearAll={clearBatch}
              onClearSkipped={clearSkipped}
            />
          )}
        </section>
      </div>
    </main>
  );
}
