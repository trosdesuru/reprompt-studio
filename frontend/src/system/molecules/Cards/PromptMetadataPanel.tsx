"use client";

import { useState } from "react";
import {
  IconEdit,
  IconDeviceFloppy,
  IconX,
  IconPrompt,
  IconCircleMinus,
  IconPuzzle,
} from "@tabler/icons-react";
import { SavedPrompt } from "@/src/types/models";
import { FadeIn } from "@/src/system/atoms/Animations/FadeIn";

import { PromptTagsList } from "./PromptTagsList";
import { PromptTextSection } from "./PromptTextSection";
import { PromptTechSpecs } from "./PromptTechSpecs";
import { Tooltip } from "../../atoms/Tooltip/Tooltip";

interface PromptMetadataPanelProps {
  prompt: SavedPrompt;
  isOwner?: boolean;
  onSave?: (updatedData: Partial<SavedPrompt>) => Promise<void>;
}

export function PromptMetadataPanel({ prompt, isOwner = true, onSave }: PromptMetadataPanelProps) {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState<Partial<SavedPrompt>>({
    prompt: prompt.prompt || "",
    negative_prompt: (prompt as any).negative_prompt || "",
    model: prompt.model || "",
    sampler: prompt.sampler || "",
    lora: prompt.lora || "",
    software: prompt.software || "",
    width: prompt.width || undefined,
    height: prompt.height || undefined,
    steps: (prompt as any).steps || "",
    cfg_scale: (prompt as any).cfg_scale || "",
    seed: (prompt as any).seed || "",
    extra_data: (prompt as any).extra_data || "",
  });

  // =================================================================
  // 🟢 LÓGICA DE RESCATE (Explicación)
  // Aquí decidimos qué lista de LoRAs vamos a dibujar.
  // 1. Miramos si existen en extra_data.loras (La nueva forma estructurada).
  // 2. Si no, miramos si prompt.lora es un array (Forma antigua).
  // 3. Si no hay nada, devolvemos un array vacío [].
  // =================================================================
  const lorasToRender = Array.isArray((prompt.extra_data as any)?.loras)
    ? (prompt.extra_data as any).loras
    : Array.isArray(prompt.lora)
      ? prompt.lora
      : [];

  const handleCopy = (text: string, section: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(section);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const handleChange = (field: keyof SavedPrompt, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!onSave) return;
    setIsSaving(true);
    await onSave(formData);
    setIsEditing(false);
    setIsSaving(false);
  };

  return (
    <FadeIn delay={0.2}>
      {isOwner && (
        <div className="flex justify-end mb-4 gap-2">
          {/* ... (Botones de Editar/Guardar se mantienen igual) ... */}
          {isEditing ? (
            <>
              <Tooltip content="Cancelar Edición">
                <button
                  onClick={() => setIsEditing(false)}
                  disabled={isSaving}
                  className="flex items-center gap-2 px-3 py-1.5 text-xs font-mono uppercase text-muted-foreground hover:bg-muted rounded-md transition-colors"
                >
                  <IconX size={14} /> Cancelar
                </button>
              </Tooltip>
              <Tooltip content="Guardar Cambios">
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex items-center gap-2 px-3 py-1.5 text-xs font-mono uppercase bg-(--accent-color) text-white rounded-md hover:opacity-90"
                >
                  <IconDeviceFloppy size={14} /> {isSaving ? "Guardando..." : "Guardar"}
                </button>
              </Tooltip>
            </>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 px-3 py-1.5 text-xs font-mono uppercase border border-border hover:bg-muted rounded-md"
            >
              <IconEdit size={14} /> Editar
            </button>
          )}
        </div>
      )}

      <PromptTagsList tags={prompt.auto_tags} />

      <div className="space-y-6">
        <PromptTextSection
          title="Prompt"
          icon={<IconPrompt size={18} />}
          fieldId="prompt"
          value={formData.prompt as string}
          isEditing={isEditing}
          copiedSection={copiedSection}
          onCopy={handleCopy}
          onChange={(v) => handleChange("prompt", v)}
        />

        <PromptTextSection
          title="Negative Prompt"
          icon={<IconCircleMinus size={18} />}
          fieldId="negative"
          isNegative
          value={formData.negative_prompt as string}
          isEditing={isEditing}
          copiedSection={copiedSection}
          onCopy={handleCopy}
          onChange={(v) => handleChange("negative_prompt", v)}
        />

        <PromptTechSpecs formData={formData} isEditing={isEditing} onChange={handleChange} />

        {!isEditing && lorasToRender.length > 0 && (
          <div className="flex flex-col gap-3 mt-4 pt-4 border-t border-border/50">
            <h3 className="font-mono text-xs font-black uppercase tracking-widest flex items-center gap-2 text-muted-foreground">
              <IconPuzzle size={18} /> Recursos Inyectados (LoRAs)
            </h3>
            <div className="flex flex-wrap gap-2">
              {lorasToRender.map((lora: any, idx: number) => (
                <Tooltip content="Servicio en desarrollo">
                  <div
                    key={idx}
                    className="flex items-center gap-2 bg-purple-500/10 border border-purple-500/20 px-3 py-1.5 rounded-md hover:bg-purple-500/20 transition-colors"
                  >
                    <span
                      className="text-xs font-mono font-bold text-purple-600 dark:text-purple-400 max-w-45 truncate"
                      title={lora.name}
                    >
                      {lora.name}
                    </span>
                    <div className="h-3 w-px bg-purple-500/30" />
                    <span className="text-[10px] font-black font-mono bg-purple-500/20 text-purple-700 dark:text-purple-400 px-1.5 py-0.5 rounded">
                      {typeof lora.strength === "number" ? lora.strength.toFixed(2) : lora.strength}
                    </span>
                  </div>
                </Tooltip>
              ))}
            </div>
          </div>
        )}
      </div>
    </FadeIn>
  );
}
