"use client";

import { useStudio } from "@/features/studio/hooks/useStudio";
import { PromptCard } from "@/src/system/organisms/PromptCard";
import { IconWand, IconDatabase } from "@tabler/icons-react";
import Link from "next/link";

export default function StudioPage() {
  const { prompts, isLoading, error, deletePrompt } = useStudio();

  return (
    <main className="min-h-screen bg-background p-4 sm:p-8 animate-fade-in">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b-4 border-(--border-color) pb-6 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <IconDatabase className="text-(--accent-color)" size={24} />
              <span className="font-mono text-xs font-bold uppercase tracking-widest text-(--text-secondary)">
                Base de Datos Local
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter leading-none">
              MI <span className="text-(--accent-color)">ESTUDIO</span>
            </h1>
          </div>

          <Link
            href="/reprompt"
            className="flex items-center gap-2 bg-(--accent-color) text-white px-6 py-3 neo-border neo-shadow text-sm font-bold uppercase hover:-translate-y-1 transition-all active:translate-y-0"
          >
            <IconWand size={18} /> Extraer Nuevo
          </Link>
        </div>

        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="h-64 bg-(--bg-secondary) neo-border animate-pulse opacity-50"
              />
            ))}
          </div>
        )}

        {error && (
          <div className="bg-red-50 border-2 border-red-500 p-6 neo-border text-red-700 font-mono text-sm">
            <p className="font-black uppercase mb-2">🚨 Error de Sincronización</p>
            {error}
          </div>
        )}

        {!isLoading && !error && prompts.length === 0 && (
          <div className="text-center p-20 bg-(--bg-secondary) border-4 border-dashed border-(--border-color)">
            <p className="font-mono text-xl text-(--text-secondary) font-bold">
              Tu búnker está vacío.
            </p>
            <p className="text-sm text-(--text-secondary) mt-2 mb-8">
              Sube imágenes en Reprompt Studio para empezar a guardar conocimiento.
            </p>
            <Link
              href="/reprompt"
              className="text-(--accent-color) font-black underline underline-offset-8 decoration-4 hover:text-foreground transition-colors uppercase"
            >
              Ir al Extractor ahora →
            </Link>
          </div>
        )}

        {!isLoading && prompts.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-20">
            {prompts.map((prompt) => (
              <PromptCard key={prompt.id} item={prompt} onDelete={deletePrompt} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
