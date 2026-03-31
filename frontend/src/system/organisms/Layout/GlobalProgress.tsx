"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { useProgressStore } from "@/src/store/progressStore";
import { ProgressBar } from "@/src/system/atoms/ProgressBar";

export function GlobalProgress() {
  const { isAnimating, progress, start, done } = useProgressStore();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // 1. Detener la barra al terminar la navegación (cuando la ruta ya cambió)
  useEffect(() => {
    done();
  }, [pathname, searchParams, done]);

  // 2. 🚀 EL ESPÍA GLOBAL: Interceptar cualquier click en un Link interno
  useEffect(() => {
    const handleAnchorClick = (e: MouseEvent) => {
      const anchor = (e.target as HTMLElement).closest("a");
      if (!anchor) return;
      
      const href = anchor.getAttribute("href");
      const target = anchor.getAttribute("target");
      
      // Si es un link interno y va a una ruta diferente, disparamos la barra
      if (href && href.startsWith("/") && target !== "_blank" && href !== pathname) {
        start();
      }
    };

    document.addEventListener("click", handleAnchorClick, true);
    return () => document.removeEventListener("click", handleAnchorClick, true);
  }, [pathname, start]);

  if (!isAnimating) return null;

  return (
    <div className="fixed top-0 left-0 w-full z-99999 pointer-events-none">
      <ProgressBar 
        value={progress} 
        className="h-1 bg-var(--accent-color) shadow-[0_0_15px_var(--accent-color)] transition-all duration-300 ease-out" 
      />
    </div>
  );
}
