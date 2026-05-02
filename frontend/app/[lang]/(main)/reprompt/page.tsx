"use client";

import { use, useState } from "react";
import { usePromptExtractor } from "@/src/features/extractor/hooks/usePromptExtractor";
import { ExtractorDropzone } from "@/src/system/organisms/Extractor/Dropzone"; // 🟢 Importación limpia
import { BatchInspector } from "@/src/system/organisms/Extractor/Inspector/BatchInspector";
import { UpgradeModal } from "@/src/system/organisms/Modal/UpgradeModal";
import { ExtractorInfoModal } from "@/src/system/organisms/Extractor/ExtractorInfoModal";
import { IconScanTraces } from "@tabler/icons-react";
import { PageHeader } from "@/src/system/organisms/Navigation/PageHeader";

export default function RepromptPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = use(params);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);

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
    <main className="min-h-screen bg-background p-4 md:p-8">
      <UpgradeModal isOpen={upgradeModal} onClose={closeUpgradeModal} />
      <ExtractorInfoModal isOpen={isInfoModalOpen} onClose={() => setIsInfoModalOpen(false)} />

      <div className="max-w-7xl mx-auto space-y-8">
        <PageHeader
          title="Extractor"
          subtitle="reprompt"
          description="Extrae metadatos de tus imágenes generadas por IA."
          icon={<IconScanTraces size={28} stroke={1.5} />}
          breadcrumbItems={[
            { label: "Mi Studio", href: `/${lang}/studio` },
            { label: "Extractor" },
          ]}
        />

        <section className="w-full">
          {batch.length === 0 ? (
            <ExtractorDropzone
              onFileDrop={processFiles} // 🟢 Pasamos la función del hook
              isExtracting={isExtracting}
              error={error}
              onOpenInfo={() => setIsInfoModalOpen(true)}
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
