"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { useProgressStore } from "@/src/store/progressStore";
import { ProgressBar } from "@/src/system/atoms/ProgressBar"; // Asumiendo que esta es la ruta de tu atom

export function GlobalProgress() {
  const { isAnimating, progress, done } = useProgressStore();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // 🛡️ EFECTO 1: Cambios de Ruta en Next.js App Router
  // Cada vez que cambia la URL (pathname o params), cerramos la barra de progreso
  useEffect(() => {
    done();
  }, [pathname, searchParams, done]);

  if (!isAnimating) return null;

  return (
    <div className="fixed top-0 left-0 w-full z-9999 pointer-events-none">
      {/* Pasamos los props que necesite tu atom. Asumo value={progress} */}
      <ProgressBar value={progress} className="h-1 rounded-none bg-[var(--accent-color)] shadow-[0_0_10px_var(--accent-color)] transition-all duration-300 ease-out" />
    </div>
  );
}
