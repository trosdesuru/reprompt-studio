"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { useProgressStore } from "@/src/store/progressStore";

export function GlobalProgress() {
  const { isAnimating, progress, start, done } = useProgressStore();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Cerrar barra al terminar la navegación
  useEffect(() => {
    done();
  }, [pathname, searchParams, done]);

  // Interceptar clicks en links internos
  useEffect(() => {
    const handleAnchorClick = (e: MouseEvent) => {
      const anchor = (e.target as HTMLElement).closest("a");
      if (!anchor) return;

      const href = anchor.getAttribute("href");
      const target = anchor.getAttribute("target");

      if (href && href.startsWith("/") && target !== "_blank" && href !== pathname) {
        start();
      }
    };

    document.addEventListener("click", handleAnchorClick, true);
    return () => document.removeEventListener("click", handleAnchorClick, true);
  }, [pathname, start]);

  // 🛡️ PRAGMATISMO: Si no hay progreso ni animación, desmontamos el nodo
  // del DOM para no consumir memoria de renderizado.
  if (!isAnimating && progress === 0) return null;

  return (
    <div className="fixed top-0 left-0 w-full z-99999 pointer-events-none">
      <div
        className="relative h-3px transition-all duration-300 ease-out"
        style={{
          width: `${progress}%`,
          opacity: isAnimating ? 1 : 0,
          background: "var(--accent-color)",
          // Efecto de neón: Una sombra suave alrededor del tubo
          boxShadow: "0 0 10px var(--accent-color), 0 0 5px var(--accent-color)",
        }}
      >
        {/* 🧱 EL NÚCLEO DE LUZ (Peg): 
          Un div difuminado en la punta derecha que genera el efecto "cometa" 
          o "luz encendiéndose". Es puro CSS acelerado por GPU.
        */}
        <div className="absolute top-0 right-0 h-full w-100px bg-white/70 blur-[3px] shadow-[0_0_15px_white] -translate-y-px rounded-full" />
      </div>
    </div>
  );
}
