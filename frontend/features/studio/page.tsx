"use client";

import { useStudio } from "@/features/studio/hooks/useStudio";
import { PromptCard } from "@/features/studio/components/PromptCard";
import { IconWand } from "@tabler/icons-react";
import Link from "next/link";

export default function StudioPage() {
  const { prompts, isLoading, error, deletePrompt } = useStudio();

  return (
    <main className="min-h-screen bg-background p-4 sm:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex justify-between items-end border-b-4 border-(--border-color) pb-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tighter">
              Mi <span className="text-(--accent-color)">Estudio</span>
            </h1>
            <p className="font-mono text-sm text-(--text-secondary) mt-2">
              Tu base de datos personal de conocimiento IA.
            </p>
          </div>
          <Link
            href="/reprompt"
            className="hidden sm:flex items-center gap-2 bg-(--accent-color) text-white px-4 py-2 neo-border neo-shadow text-sm font-bold uppercase hover:-translate-y-1 transition-transform"
          >
            <IconWand size={18} /> Extraer Nuevo
          </Link>
        </div>

        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 bg-(--bg-secondary) neo-border"></div>
            ))}
          </div>
        )}

        {error && (
          <div className="bg-red-100 border-2 border-red-500 text-red-700 p-4 font-mono text-sm font-bold shadow-[4px_4px_0px_0px_rgba(239,68,68,1)]">
            {error}
          </div>
        )}

        {!isLoading && !error && prompts.length === 0 && (
          <div className="text-center p-12 bg-(--bg-secondary) neo-border border-dashed border-4">
            <p className="font-mono text-(--text-secondary) mb-4">
              Aún no has guardado ningún prompt en tu búnker.
            </p>
            <Link
              href="/reprompt"
              className="text-(--accent-color) font-bold underline underline-offset-4 uppercase"
            >
              Ir al Extractor
            </Link>
          </div>
        )}

        {!isLoading && prompts.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {prompts.map((prompt) => (
              <PromptCard key={prompt.id} item={prompt} onDelete={deletePrompt} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
