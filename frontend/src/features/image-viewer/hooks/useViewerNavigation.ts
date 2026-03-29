import { useState, useCallback, useEffect } from "react";

export function useViewerNavigation(pages: any[]) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  // 🟢 Programación Defensiva: Si prev es null, asume 0. 
  const showNext = useCallback((e?: React.MouseEvent | KeyboardEvent) => {
    e?.stopPropagation();
    setSelectedIndex((prev) => {
      const current = prev ?? 0;
      return current < pages.length - 1 ? current + 1 : current;
    });
  }, [pages.length]);

  const showPrev = useCallback((e?: React.MouseEvent | KeyboardEvent) => {
    e?.stopPropagation();
    setSelectedIndex((prev) => {
      const current = prev ?? 0;
      return current > 0 ? current - 1 : 0;
    });
  }, []);

  // 🟢 Eventos de teclado blindados
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Evitar que las flechas cambien imágenes si el usuario está escribiendo en el buscador
      if (document.activeElement?.tagName === "INPUT" || document.activeElement?.tagName === "TEXTAREA") return;
      
      if (e.key === "ArrowRight") showNext();
      if (e.key === "ArrowLeft") showPrev();
    };
    
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showNext, showPrev]);

  return { selectedIndex, setSelectedIndex, showNext, showPrev };
}
