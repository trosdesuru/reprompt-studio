// frontend/features/image-viewer/hooks/useViewerNavigation.ts
import { useState, useCallback, useEffect } from "react";
import { ViewerPageItem } from "@/src/types/gallery";

export function useViewerNavigation(pages: ViewerPageItem[]) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const showNext = useCallback(
    (e?: React.MouseEvent | KeyboardEvent) => {
      e?.stopPropagation();
      if (selectedIndex !== null && selectedIndex < pages.length - 1) {
        setSelectedIndex(selectedIndex + 1);
      }
    },
    [selectedIndex, pages.length],
  );

  const showPrev = useCallback(
    (e?: React.MouseEvent | KeyboardEvent) => {
      e?.stopPropagation();
      if (selectedIndex !== null && selectedIndex > 0) {
        setSelectedIndex(selectedIndex - 1);
      }
    },
    [selectedIndex],
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedIndex === null) return;
      if (e.key === "ArrowRight") showNext(e);
      if (e.key === "ArrowLeft") showPrev(e);
      if (e.key === "Escape") setSelectedIndex(null);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedIndex, showNext, showPrev]);

  // 🟢 FIX CRÍTICO: Hemos eliminado el useEffect que manipulaba el 'document.body.style.overflow'.
  // Ahora el modal principal (ImageViewerModal) es el único dueño del bloqueo del scroll.

  return { selectedIndex, setSelectedIndex, showNext, showPrev };
}
