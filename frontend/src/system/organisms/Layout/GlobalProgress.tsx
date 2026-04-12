"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { useProgressStore } from "@/src/store/progressStore";

export function GlobalProgress() {
  const { isAnimating, progress, start, done } = useProgressStore();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // 1. Cerrar barra al terminar la navegación de Next.js
  useEffect(() => {
    done();
  }, [pathname, searchParams, done]);

  // 2. Interceptor de enlaces nativos
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

  // 🛡️ FIX ARQUITECTÓNICO: NUNCA DEVOLVEMOS NULL.
  // Dejamos el elemento en el DOM para que el motor CSS pueda calcular las transiciones de salida (Fade out).

  return (
    <div className="fixed top-0 left-0 w-full z-99999 pointer-events-none">
      <div
        className="relative transition-all ease-out"
        style={{
          height: "3px", // El grosor elegante de la industria
          width: `${progress}%`,
          opacity: isAnimating ? 1 : 0,
          // 🛡️ FALLBACK: Si var(--accent-color) no existe, usará un Azul Neón brillante (#0ea5e9)
          background: "var(--accent-color, #0ea5e9)",
          boxShadow: "0 0 10px var(--accent-color, #0ea5e9), 0 0 5px var(--accent-color, #0ea5e9)",
          // Si está desapareciendo, que tarde 500ms en desvanecerse (más suave)
          transitionDuration: isAnimating ? "300ms" : "500ms",
        }}
      >
        {/* LA PUNTA DE LUZ (Puro CSS, sin imágenes ni SVGs) */}
        <div
          className="absolute top-0 right-0 h-full w-70px bg-white shadow-[0_0_15px_white] rounded-full"
          style={{
            filter: "blur(2px)",
            opacity: isAnimating ? 0.8 : 0,
          }}
        />
      </div>
    </div>
  );
}
