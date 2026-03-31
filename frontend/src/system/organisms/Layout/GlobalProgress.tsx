"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { useProgressStore } from "@/src/store/progressStore";

export function GlobalProgress() {
  const { isAnimating, progress, start, done } = useProgressStore();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    console.log(`🚨 [ROUTER EFECTO] Cambio detectado. Path: ${pathname}. Llamando a done()`);
    done();
  }, [pathname, searchParams, done]);

  useEffect(() => {
    const handleAnchorClick = (e: MouseEvent) => {
      const anchor = (e.target as HTMLElement).closest("a");
      if (!anchor) return;
      
      const href = anchor.getAttribute("href");
      const target = anchor.getAttribute("target");
      
      if (href && href.startsWith("/") && target !== "_blank" && href !== pathname) {
        console.log(`🚨 [CLICK INTERCEPTADO] Link a ${href}. Llamando a start()`);
        start();
      }
    };

    document.addEventListener("click", handleAnchorClick, true);
    return () => document.removeEventListener("click", handleAnchorClick, true);
  }, [pathname, start]);

  // CHIVATO PRINCIPAL DE RENDERIZADO
  console.log(`🚨 [RENDER] Evaluando DOM -> isAnimating: ${isAnimating} | progress: ${progress}`);

  if (!isAnimating && progress === 0) {
    console.log("🚨 [RENDER] 🛑 Componente devuelve NULL (Invisible en el DOM)");
    return null;
  }

  console.log("🚨 [RENDER] ✅ Componente devuelve JSX (¡Debería estar en el DOM!)");

  return (
    <div className="fixed top-0 left-0 w-full z-99999 pointer-events-none">
      <div 
        className="relative h-3px transition-all duration-300 ease-out"
        style={{ 
          width: `${progress}%`,
          opacity: isAnimating ? 1 : 0,
          background: "var(--accent-color)",
          boxShadow: "0 0 10px var(--accent-color), 0 0 5px var(--accent-color)"
        }}
      >
        <div className="absolute top-0 right-0 h-full w-100px bg-white/70 blur-[3px] shadow-[0_0_15px_white] -translate-y-px rounded-full" />
      </div>
    </div>
  );
}
