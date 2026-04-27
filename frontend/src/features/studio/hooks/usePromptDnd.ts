import { useDraggable } from "@dnd-kit/core";
import { SavedPrompt } from "@/src/types/models";

export function usePromptDnd(prompt: SavedPrompt) {
  const {
    attributes,
    listeners,
    setNodeRef: setDraggableRef,
    isDragging,
  } = useDraggable({
    id: `prompt-${prompt.id}`,
    data: { type: "prompt", prompt },
  });

  return { attributes, listeners, setDraggableRef, isDragging };
}
