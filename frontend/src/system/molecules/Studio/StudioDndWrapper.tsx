"use client";

import { DndContext, closestCenter, DragOverlay } from "@dnd-kit/core";
import { IconFolder, IconPhoto } from "@tabler/icons-react";
import { useStudioDnd } from "@/src/features/studio/hooks/useStudioDnd";

interface StudioDndWrapperProps {
  children: React.ReactNode;
}

export function StudioDndWrapper({ children }: Readonly<StudioDndWrapperProps>) {
  const { sensors, activeDragItem, handleDragStart, handleDragEnd } = useStudioDnd();

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      {children}

      <DragOverlay dropAnimation={null}>
        {activeDragItem?.type === "directory" && (
          <div className="flex items-center py-2 px-3 bg-card border-2 border-primary/50 border-dashed rounded-lg shadow-2xl opacity-90 cursor-grabbing backdrop-blur-md">
            <IconFolder size={18} className="text-primary mr-2" />
            <span className="text-sm font-bold text-foreground">
              {activeDragItem.directory.name}
            </span>
          </div>
        )}

        {activeDragItem?.type === "prompt" && (
          <div className="w-24 h-32 rounded-lg overflow-hidden border-2 border-accent border-dashed opacity-60 shadow-2xl cursor-grabbing pointer-events-none bg-background">
            {activeDragItem.prompt.image_url ? (
              <img
                src={activeDragItem.prompt.image_url}
                alt="Arrastrando"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground/40">
                <IconPhoto size={24} />
              </div>
            )}
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}
