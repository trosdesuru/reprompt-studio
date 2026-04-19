import { useDraggable, useDroppable } from "@dnd-kit/core";
import { Directory } from "@/src/store/useStudioUI";

export function useDirectoryDnd(directory: Directory) {
  const {
    attributes,
    listeners,
    setNodeRef: setDraggableRef,
    isDragging,
  } = useDraggable({
    id: `dir-${directory.id}`,
    data: { type: "directory", directory },
  });

  const { setNodeRef: setDroppableRef, isOver } = useDroppable({
    id: directory.id,
    data: { type: "directory", directory },
  });

  const setBothRefs = (node: HTMLElement | null) => {
    setDraggableRef(node);
    setDroppableRef(node);
  };

  return { attributes, listeners, setBothRefs, isDragging, isOver };
}
