"use client";

import { useState, useEffect } from "react";

export function useScrollDirection() {
  const [scrollDirection, setScrollDirection] = useState<"up" | "down">("up");

  useEffect(() => {
    let lastScrollY = 0;
    let ticking = false;

    // 1. Escuchamos el evento genérico
    const onScroll = (event: Event) => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          // 2. Identificamos QUIÉN está haciendo scroll (¿La ventana o el div interno?)
          const target = event.target as HTMLElement | Document;

          let currentScrollY = 0;
          let clientHeight = 0;
          let scrollHeight = 0;

          // Si el scroll viene de la ventana general (ej. Home Feed)
          if (
            target === document ||
            target === document.documentElement ||
            target === document.body
          ) {
            currentScrollY = window.scrollY;
            clientHeight = window.innerHeight;
            scrollHeight = document.documentElement.scrollHeight;
          } else {
            // Si el scroll viene de un div interno bloqueado (ej. #metadata-panel)
            const el = target as HTMLElement;
            currentScrollY = el.scrollTop;
            clientHeight = el.clientHeight;
            scrollHeight = el.scrollHeight;
          }

          // 3. Evitamos micro-saltos o rebotes nativos de iOS (Bounce effect)
          if (Math.abs(currentScrollY - lastScrollY) < 10) {
            ticking = false;
            return;
          }

          // 4. Calculamos si tocamos el fondo absoluto (con margen de 20px de seguridad)
          const isAtBottom = clientHeight + currentScrollY >= scrollHeight - 20;

          // 5. Máquina de Estados
          if (isAtBottom) {
            setScrollDirection("up"); // Si tocamos fondo, obligamos a que el footer aparezca
          } else if (currentScrollY > lastScrollY) {
            setScrollDirection("down"); // Bajando = Ocultar
          } else {
            setScrollDirection("up"); // Subiendo = Mostrar
          }

          lastScrollY = currentScrollY > 0 ? currentScrollY : 0;
          ticking = false;
        });
        ticking = true;
      }
    };

    // 🟢 LA MAGIA: El tercer parámetro `true` (useCapture) intercepta el scroll ANTES de que llegue a su objetivo.
    // Esto captura el scroll de la Home y el del #metadata-panel al mismo tiempo.
    window.addEventListener("scroll", onScroll, true);

    return () => window.removeEventListener("scroll", onScroll, true);
  }, []);

  return scrollDirection;
}
