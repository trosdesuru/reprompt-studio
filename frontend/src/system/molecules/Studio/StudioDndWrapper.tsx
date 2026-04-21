"use client";

import { DndContext, closestCenter, DragOverlay } from "@dnd-kit/core";
import { IconFolder } from "@tabler/icons-react";
import { useStudioDnd } from "@/src/features/studio/hooks/useStudioDnd";

interface StudioDndWrapperProps {
  children: React.ReactNode;
}

export function StudioDndWrapper({ children }: StudioDndWrapperProps) {
  const { sensors, activeDragDir, handleDragStart, handleDragEnd } = useStudioDnd();

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      {children}

      <DragOverlay dropAnimation={null}>
        {activeDragDir && (
          <div className="flex items-center py-2 px-3 bg-card border border-primary/40 border-dashed rounded-lg shadow-2xl opacity-90 cursor-grabbing">
            <IconFolder size={18} className="text-primary mr-2" />
            <span className="text-sm font-bold text-foreground">{activeDragDir.name}</span>
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}
