"use client";

import { use } from "react";
import { usePromptExtractor } from "@/src/features/extractor/hooks/usePromptExtractor";
import { ExtractorDropzone } from "@/src/system/organisms/Extractor/Dropzone";
import { BatchInspector } from "@/src/system/organisms/Extractor/Inspector/BatchInspector";
import { Breadcrumbs } from "@/src/system/organisms/Navigation/Breadcrumbs";
import { UpgradeModal } from "@/src/system/organisms/Modal/UpgradeModal";
import { IconScanTraces } from "@tabler/icons-react";

export default function RepromptPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = use(params);

  const {
    processFiles,
    isExtracting,
    error,
    batch,
    skippedFiles,
    upgradeModal,
    closeUpgradeModal,
    updateItemStatus,
    updateItemData,
    removeItem,
    clearBatch,
    clearSkipped,
  } = usePromptExtractor();

  const breadcrumbItems = [
    { label: "Mi Studio", href: `/${lang}/studio` },
    { label: "Extractor Reprompt" },
  ];

  return (
    <main className="min-h-screen bg-background p-4 md:p-8">
      <UpgradeModal isOpen={upgradeModal} onClose={closeUpgradeModal} />
      <div className="max-w-7xl mx-auto space-y-8">
        <div>
          <Breadcrumbs items={breadcrumbItems} />
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border pb-8 mt-4">
          <div>
            <h1 className="text-3xl font-black tracking-tighter flex items-center gap-3">
              <IconScanTraces className="text-(--accent-color)" size={32} />
              Extractor <span className="font-mono font-regular">reprompt</span>
            </h1>
            <p className="text-muted-foreground mt-1">
              Arrastra múltiples imágenes o archivos ZIP para extraer metadatos en lote.
            </p>
          </div>
        </div>

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
              onUpdateItemData={updateItemData}
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
