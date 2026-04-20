import { useState } from "react";
import { useSensor, useSensors, PointerSensor, DragStartEvent, DragEndEvent } from "@dnd-kit/core";
import { Directory } from "@/src/store/useStudioUI";
import { useDirectoryActions } from "./useDirectoryActions";

export function useStudioDnd() {
  const { moveDirectory } = useDirectoryActions();
  const [activeDragDir, setActiveDragDir] = useState<Directory | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    if (active.data.current?.type === "directory") {
      setActiveDragDir(active.data.current.directory);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveDragDir(null);
    const { active, over } = event;

    if (!over || active.id === `dir-${over.id}`) return;

    const draggedDirId = String(active.id).replace("dir-", "");
    const targetDirId = String(over.id);

    if (draggedDirId !== targetDirId) {
      moveDirectory(draggedDirId, targetDirId);
    }
  };

  return { sensors, activeDragDir, handleDragStart, handleDragEnd };
}
