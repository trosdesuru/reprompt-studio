"use client";

import { useState } from "react";
import {
  IconCopy,
  IconCheck,
  IconScanTraces,
  IconWand,
  IconEdit,
  IconDeviceFloppy,
  IconX,
} from "@tabler/icons-react";
import { SavedPrompt } from "@/src/types/models";
import { FadeIn } from "@/src/system/atoms/FadeIn";
import { cn } from "@/lib/utils";

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
    if (!text) return;
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
    try {
      await onSave(formData);
      setIsEditing(false);
    } catch (error) {
      console.error("Error saving metadata", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
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
    setIsEditing(false);
  };

  const techSpecs = [
    { key: "model", label: "Modelo", type: "text" },
    { key: "software", label: "Software", type: "text" },
    { key: "sampler", label: "Sampler", type: "text" },
    { key: "steps", label: "Steps", type: "number" },
    { key: "cfg_scale", label: "CFG Scale", type: "text" },
    { key: "seed", label: "Seed", type: "text" },
    { key: "width", label: "Width (px)", type: "number" },
    { key: "height", label: "Height (px)", type: "number" },
  ];

  return (
    <FadeIn delay={0.2}>
      {isOwner && (
        <div className="flex justify-end mb-4 gap-2">
          {isEditing ? (
            <>
              <button
                onClick={handleCancel}
                disabled={isSaving}
                className="flex items-center gap-2 px-3 py-1.5 text-xs font-mono uppercase tracking-widest text-muted-foreground hover:bg-muted rounded-md transition-colors disabled:opacity-50"
              >
                <IconX size={14} /> Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center gap-2 px-3 py-1.5 text-xs font-mono uppercase tracking-widest bg-(--accent-color) text-white rounded-md hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                <IconDeviceFloppy size={14} /> {isSaving ? "Guardando..." : "Guardar"}
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 px-3 py-1.5 text-xs font-mono uppercase tracking-widest border border-border hover:bg-muted rounded-md transition-colors"
            >
              <IconEdit size={14} /> Editar Datos
            </button>
          )}
        </div>
      )}

      {prompt.auto_tags && prompt.auto_tags.length > 0 && (
        <div className="space-y-3 pt-2 pb-4">
          <h3 className="font-mono text-xs font-black uppercase tracking-widest flex items-center gap-2 mb-2 text-muted-foreground">
            # Tags
          </h3>
          <div className="flex flex-wrap gap-1.5">
            {prompt.auto_tags.map((tag) => (
              <span
                key={tag}
                className="px-2.5 py-1 bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider rounded-md border border-primary/20 hover:bg-primary/20 transition-colors"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-6">
        <div className="group relative bg-(--bg-secondary) neo-border p-4 transition-all hover:neo-shadow">
          <div className="flex justify-between items-center mb-3 border-b border-border/50 pb-2">
            <h3 className="font-mono text-xs font-black uppercase tracking-widest flex items-center gap-2 text-(--accent-color)">
              <IconWand size={16} /> Prompt Principal
            </h3>
            {!isEditing && formData.prompt && (
              <button
                onClick={() => handleCopy(formData.prompt as string, "prompt")}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                {copiedSection === "prompt" ? (
                  <IconCheck size={18} className="text-green-500" />
                ) : (
                  <IconCopy size={18} />
                )}
              </button>
            )}
          </div>

          {isEditing ? (
            <textarea
              value={formData.prompt}
              onChange={(e) => handleChange("prompt", e.target.value)}
              className="w-full min-h-25 bg-background border border-border rounded-md p-3 font-mono text-sm focus:outline-none focus:ring-1 focus:ring-(--accent-color)"
              placeholder="Añade el prompt aquí..."
            />
          ) : (
            <p className="font-mono text-sm leading-relaxed whitespace-pre-wrap text-foreground/90">
              {formData.prompt || (
                <span className="italic opacity-50">No hay prompt registrado.</span>
              )}
            </p>
          )}
        </div>

        {(isEditing || formData.negative_prompt) && (
          <div className="group relative bg-destructive/5 border border-destructive/20 rounded-xl p-4 transition-all">
            <div className="flex justify-between items-center mb-3 border-b border-destructive/10 pb-2">
              <h3 className="font-mono text-xs font-black uppercase tracking-widest flex items-center gap-2 text-destructive">
                Negative Prompt
              </h3>
              {!isEditing && formData.negative_prompt && (
                <button
                  onClick={() => handleCopy(formData.negative_prompt as string, "negative")}
                  className="text-destructive/60 hover:text-destructive transition-colors"
                >
                  {copiedSection === "negative" ? <IconCheck size={18} /> : <IconCopy size={18} />}
                </button>
              )}
            </div>

            {isEditing ? (
              <textarea
                value={formData.negative_prompt as string}
                onChange={(e) => handleChange("negative_prompt", e.target.value)}
                className="w-full min-h-15 bg-background border border-destructive/30 rounded-md p-3 font-mono text-sm focus:outline-none focus:ring-1 focus:ring-destructive"
                placeholder="Añade los prompts negativos..."
              />
            ) : (
              <p className="font-mono text-sm leading-relaxed whitespace-pre-wrap text-destructive/80">
                {formData.negative_prompt}
              </p>
            )}
          </div>
        )}

        <div className="space-y-4">
          <h3 className="font-mono text-xs font-black uppercase tracking-widest flex items-center gap-2 text-muted-foreground">
            <IconScanTraces size={16} /> Datos de Generación
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {techSpecs.map((spec) => {
              const value = formData[spec.key as keyof SavedPrompt];

              if (!isEditing && !value) return null;

              return (
                <div
                  key={spec.key}
                  className={cn(
                    "bg-muted/10 neo-border p-3 flex flex-col gap-1",
                    isEditing && "bg-background",
                  )}
                >
                  <label className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">
                    {spec.label}
                  </label>
                  {isEditing ? (
                    <input
                      type={spec.type}
                      value={(value as string | number) || ""}
                      onChange={(e) => handleChange(spec.key as keyof SavedPrompt, e.target.value)}
                      className="w-full bg-transparent border-b border-border/50 text-sm font-bold focus:outline-none focus:border-(--accent-color) py-1"
                      placeholder={`Ej: ${spec.key === "seed" ? "123456" : "..."}`}
                    />
                  ) : (
                    <span className="text-sm font-bold truncate" title={String(value)}>
                      {value}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </FadeIn>
  );
}
