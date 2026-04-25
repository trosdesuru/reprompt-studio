"use client";

import { use } from "react";
import { usePromptExtractor } from "@/src/features/extractor/hooks/usePromptExtractor";
import { ExtractorDropzone } from "@/src/system/organisms/Extractor/Dropzone";
import { BatchInspector } from "@/src/system/organisms/Extractor/Inspector/BatchInspector";
import { UpgradeModal } from "@/src/system/organisms/Modal/UpgradeModal"; // Importado correctamente
import { IconScanTraces } from "@tabler/icons-react";
import { PageHeader } from "@/src/system/organisms/Navigation/PageHeader";

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

  return (
    <main className="max-h-screen bg-background p-4 md:p-8">
      <UpgradeModal isOpen={upgradeModal} onClose={closeUpgradeModal} />

      <div className="max-w-7xl mx-auto space-y-8">
        <PageHeader
          title="Extractor"
          subtitle="reprompt"
          description="Arrastra múltiples imágenes o archivos ZIP para extraer metadatos en lote."
          icon={<IconScanTraces size={28} stroke={1.5} className="text-foreground" />}
          breadcrumbItems={[
            { label: "Mi Studio", href: `/${lang}/studio` },
            { label: "Extractor Reprompt" },
          ]}
        />

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
