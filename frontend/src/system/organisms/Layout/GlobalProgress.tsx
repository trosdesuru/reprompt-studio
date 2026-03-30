"use client";

import { useProgressStore } from "@/src/store/progressStore";

export function GlobalProgress() {
  const { isWorking, progress } = useProgressStore();

  if (!isWorking && progress === 0) return null;

  return (
    <div className="fixed top-0 left-0 w-full z-100 pointer-events-none">
      <div 
        className="h-1 bg-var(--accent-color) transition-all duration-300 ease-out shadow-[0_0_10px_var(--accent-color)]"
        style={{ width: `${progress}%` }}
      >
        {/* Efecto de brillo en la punta de la barra */}
        <div className="absolute right-0 top-0 h-full w-20 bg-linear-to-r from-transparent to-white/50 opacity-50 blur-[2px]" />
      </div>
    </div>
  );
}
