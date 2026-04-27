import { useState } from "react";
import { useSensor, useSensors, PointerSensor, DragStartEvent, DragEndEvent } from "@dnd-kit/core";
import { Directory, useStudioUI } from "@/src/store/useStudioUI";
import { useDirectoryActions } from "./useDirectoryActions";
import { fetchSeguro } from "@/src/services/api/client";
import toast from "react-hot-toast";

export function useStudioDnd() {
  const { moveDirectory } = useDirectoryActions();
  const triggerRefresh = useStudioUI((state) => state.triggerRefresh);

  const [activeDragDir, setActiveDragDir] = useState<Directory | null>(null);
  const [activeDragItem, setActiveDragItem] = useState<any | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    setActiveDragItem(active.data.current);
    if (active.data.current?.type === "directory") {
      setActiveDragDir(active.data.current.directory);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    setActiveDragDir(null);
    setActiveDragItem(null);

    const { active, over } = event;
    if (!over) return;

    const isTargetRoot = over.id === "root-zone";
    const targetDirId = isTargetRoot ? null : String(over.id).replace("dir-", "");

    if (active.data.current?.type === "directory") {
      const draggedDirId = String(active.id).replace("dir-", "");
      if (draggedDirId === (targetDirId || "root")) return;
      moveDirectory(draggedDirId, targetDirId);
    }

    if (active.data.current?.type === "prompt") {
      const promptId = String(active.id).replace("prompt-", "");
      const currentDirId = active.data.current.prompt.directory_id;

      if (currentDirId === targetDirId || (!currentDirId && !targetDirId)) return;

      const toastId = toast.loading("Moviendo prompt...");

      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";
        const res = await fetchSeguro(`${API_URL}/prompts/${promptId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ directory_id: targetDirId }),
        });

        if (!res.ok) throw new Error("No se pudo mover el prompt");

        toast.success("Prompt organizado", { id: toastId });
        triggerRefresh();
      } catch (error) {
        toast.error("Error al mover el prompt", { id: toastId });
        console.error("DND Error:", error);
      }
    }
  };

  return { sensors, activeDragItem, activeDragDir, handleDragStart, handleDragEnd };
}
