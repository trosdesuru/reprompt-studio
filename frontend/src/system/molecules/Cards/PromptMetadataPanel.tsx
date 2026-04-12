"use client";

import { useState } from "react";
import { IconCopy, IconCheck, IconScanTraces, IconWand } from "@tabler/icons-react";
import { SavedPrompt } from "@/src/types/models";
import { FadeIn } from "@/src/system/atoms/FadeIn";

interface PromptMetadataPanelProps {
  prompt: SavedPrompt;
}

export function PromptMetadataPanel({ prompt }: PromptMetadataPanelProps) {
  const [copiedSection, setCopiedSection] = useState<"prompt" | "negative" | null>(null);

  const handleCopy = (text: string, section: "prompt" | "negative") => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedSection(section);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  // 🛡️ PRAGMATISMO: Mapeamos solo los datos técnicos que existen realmente
  const techSpecs = [
    { label: "Modelo", value: prompt.model },
    { label: "Sampler", value: prompt.sampler },
    { label: "Software", value: prompt.software },
    { label: "Resolución", value: prompt.resolution },
  ].filter((spec) => spec.value); // Filtramos los nulos dinámicamente

  return (
    <FadeIn delay={0.2}>
      {/* 📝 SECCIÓN 1: El Prompt (La joya de la corona) */}
      <div className="space-y-4">
        <div className="group relative bg-(--bg-secondary) neo-border p-4 transition-all hover:neo-shadow">
          <div className="flex justify-between items-center mb-3 border-b border-border/50 pb-2">
            <h3 className="font-mono text-xs font-black uppercase tracking-widest flex items-center gap-2 text-(--accent-color)">
              <IconWand size={16} /> Prompt Principal
            </h3>
            {prompt.prompt && (
              <button
                onClick={() => handleCopy(prompt.prompt, "prompt")}
                className="text-muted-foreground hover:text-foreground transition-colors"
                title="Copiar prompt"
              >
                {copiedSection === "prompt" ? (
                  <IconCheck size={18} className="text-green-500" />
                ) : (
                  <IconCopy size={18} />
                )}
              </button>
            )}
          </div>
          <p className="font-mono text-sm leading-relaxed whitespace-pre-wrap text-foreground/90">
            {prompt.prompt || <span className="italic opacity-50">No hay prompt registrado.</span>}
          </p>
        </div>

        {/* Negative Prompt (Opcional, asumiendo que tu modelo lo tenga, si no, se puede omitir) */}
        {/* Si tu modelo actual de SavedPrompt no tiene negative_prompt, puedes ignorar esta caja, pero en la industria suele existir */}
      </div>

      {/* ⚙️ SECCIÓN 2: Especificaciones Técnicas */}
      {techSpecs.length > 0 && (
        <div className="space-y-4">
          <h3 className="font-mono text-xs font-black uppercase tracking-widest flex items-center gap-2 text-muted-foreground">
            <IconScanTraces size={16} /> Datos de Generación
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {techSpecs.map((spec, idx) => (
              <div key={idx} className="bg-muted/10 neo-border p-3 flex flex-col gap-1">
                <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">
                  {spec.label}
                </span>
                <span className="text-sm font-bold truncate" title={spec.value}>
                  {spec.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </FadeIn>
  );
}
