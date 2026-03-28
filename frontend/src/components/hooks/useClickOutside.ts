import { useEffect, RefObject } from "react";

export function useClickOutside(ref: RefObject<HTMLElement | null>, handler: () => void) {
  useEffect(() => {
    const listener = (event: MouseEvent | TouchEvent) => {
      // Si el clic fue dentro del elemento referenciado, no hacemos nada
      if (!ref.current || ref.current.contains(event.target as Node)) {
        return;
      }
      // Si fue fuera, ejecutamos la función (ej: cerrar menú)
      handler();
    };

    document.addEventListener("mousedown", listener);
    document.addEventListener("touchstart", listener);

    return () => {
      document.removeEventListener("mousedown", listener);
      document.removeEventListener("touchstart", listener);
    };
  }, [ref, handler]);
}
