"use client";

import { IconScanTraces } from "@tabler/icons-react";
import { SavedPrompt } from "@/src/types/models";
import { cn } from "@/lib/utils";
import { Tooltip } from "../../atoms/Tooltip/Tooltip";

interface PromptTechSpecsProps {
  formData: Partial<SavedPrompt>;
  isEditing: boolean;
  onChange: (field: keyof SavedPrompt, value: string) => void;
}

export function PromptTechSpecs({ formData, isEditing, onChange }: PromptTechSpecsProps) {
  const specs = [
    { key: "model", label: "Modelo", type: "text" },
    { key: "software", label: "Software", type: "text" },
    { key: "sampler", label: "Sampler", type: "text" },
    { key: "lora", label: "Lora", type: "text" },
    { key: "steps", label: "Steps", type: "number" },
    { key: "cfg_scale", label: "CFG Scale", type: "text" },
    { key: "seed", label: "Seed", type: "text" },
    { key: "width", label: "Width (px)", type: "number" },
    { key: "height", label: "Height (px)", type: "number" },
  ];

  if (!isEditing && specs.every((spec) => !formData[spec.key as keyof SavedPrompt])) {
    return null;
  }

  return (
    <div className="space-y-4">
      <h3 className="font-mono text-xs font-black uppercase tracking-widest flex items-center gap-2 text-muted-foreground">
        <IconScanTraces size={18} /> Datos de Generación
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {specs.map((spec) => {
          const value = formData[spec.key as keyof SavedPrompt];
          if (!isEditing && !value) return null;

          return (
            <Tooltip
              key={spec.key}
              content={
                <div className="flex flex-col gap-0.5">
                  <span className="text-destructive text-xs font-bold capitalize">
                    {spec.label}
                  </span>
                  <span className="text-xs text-muted">{value?.toString()}</span>
                </div>
              }
            >
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
                    onChange={(e) => onChange(spec.key as keyof SavedPrompt, e.target.value)}
                    className="w-full bg-transparent border-b border-border/50 text-sm font-bold focus:outline-none focus:border-(--accent-color) py-1"
                    placeholder={`Ej: ${spec.key === "seed" ? "123456" : "..."}`}
                  />
                ) : (
                  <span className="text-sm font-bold truncate" title={String(value)}>
                    {value as string | number}
                  </span>
                )}
              </div>
            </Tooltip>
          );
        })}
      </div>
    </div>
  );
}
