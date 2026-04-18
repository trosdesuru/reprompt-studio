"use client";

import { DndContext, closestCenter, DragOverlay } from "@dnd-kit/core";
import { IconFolder, IconAlbum } from "@tabler/icons-react";
import { StudioSidebar } from "@/src/system/organisms/Studio/StudioSidebar";
import PromptGrid from "@/src/system/organisms/Studio/PromptGrid";
import { useStudioSync } from "@/src/features/studio/hooks/useStudioSync";
import { useStudioDnd } from "@/src/features/studio/hooks/useStudioDnd";
import { PageHeader } from "@/src/system/organisms/Navigation/PageHeader";

export default function StudioPage() {
  useStudioSync();
  const { sensors, activeDragDir, handleDragStart, handleDragEnd } = useStudioDnd();

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] w-full bg-background p-4 md:p-6 lg:p-8 gap-4">
      <PageHeader
        title="Mi Studio"
        description="Gestiona y organiza tus extracciones desde el directorio raíz."
        icon={<IconAlbum size={28} stroke={1.5} />}
        breadcrumbItems={[{ label: "Mi Studio" }]}
      />

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex flex-1 overflow-hidden border border-border/30 rounded-xl bg-card/20 backdrop-blur-sm">
          <StudioSidebar />
          <main className="flex-1 overflow-y-auto custom-scrollbar bg-background/30 p-4 md:p-6">
            <PromptGrid />
          </main>
        </div>

        <DragOverlay dropAnimation={null}>
          {activeDragDir && (
            <div className="flex items-center py-2 px-3 bg-card border border-primary/40 border-dashed rounded-lg shadow-2xl opacity-90 cursor-grabbing">
              <IconFolder size={18} className="text-primary mr-2" />
              <span className="text-sm font-bold text-foreground">{activeDragDir.name}</span>
            </div>
          )}
        </DragOverlay>
      </DndContext>
    </div>
  );
}