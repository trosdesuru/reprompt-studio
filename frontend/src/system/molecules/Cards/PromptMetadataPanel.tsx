"use client";

import { useState } from "react";
import { IconEdit, IconDeviceFloppy, IconX, IconPrompt, IconCircleMinus } from "@tabler/icons-react";
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
    software: prompt.software || "",
    width: prompt.width || undefined,
    height: prompt.height || undefined,
    steps: (prompt as any).steps || "",
    cfg_scale: (prompt as any).cfg_scale || "",
    seed: (prompt as any).seed || "",
  });

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
          {isEditing ? (
            <>
              <Tooltip content="Copiar Prompt">
                <button
                  onClick={() => setIsEditing(false)}
                  disabled={isSaving}
                  className="flex items-center gap-2 px-3 py-1.5 text-xs font-mono uppercase text-muted-foreground hover:bg-muted rounded-md transition-colors"
                >
                  <IconX size={14} /> Cancelar
                </button>
              </Tooltip>

              <Tooltip content="Copiar Negative Prompt">
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
      </div>
    </FadeIn>
  );
}
