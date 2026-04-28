"use client";

import { IconCopy, IconCheck } from "@tabler/icons-react";
import { ExpandableText } from "@/src/features/prompts/components/ExpandableText";
import { ReactNode } from "react";
import { Tooltip } from "../../atoms/Tooltip/Tooltip";

interface PromptTextSectionProps {
  title: string;
  icon?: ReactNode;
  value: string;
  isEditing: boolean;
  fieldId: string;
  isNegative?: boolean;
  copiedSection: string | null;
  onCopy: (text: string, section: string) => void;
  onChange: (value: string) => void;
}

export function PromptTextSection({
  title,
  icon,
  value,
  isEditing,
  fieldId,
  isNegative,
  copiedSection,
  onCopy,
  onChange,
}: PromptTextSectionProps) {
  if (!isEditing && !value) return null;

  return (
    <div
      className={`group relative rounded-xl p-4 transition-all ${
        isNegative
          ? "bg-destructive/5 border border-destructive/20"
          : "bg-(--bg-secondary) neo-border hover:neo-shadow"
      }`}
    >
      <div
        className={`flex justify-between items-center mb-3 border-b pb-2 ${
          isNegative
            ? "border-destructive/10 text-destructive"
            : "border-border/50 text-(--accent-color)"
        }`}
      >
        <h3 className="font-mono text-xs font-bold uppercase tracking-widest flex items-center gap-2">
          {icon} {title}
        </h3>
        {!isEditing && value && (
          <Tooltip content={isNegative ? "Copiar Negative Prompt" : "Copiar Prompt"}>
            <button
              onClick={() => onCopy(value, fieldId)}
              className={
                isNegative
                  ? "text-destructive/60 hover:text-destructive"
                  : "text-muted-foreground hover:text-foreground transition-colors"
              }
            >
              {copiedSection === fieldId ? (
                <IconCheck size={18} className={isNegative ? "" : "text-green-500"} />
              ) : (
                <IconCopy size={18} />
              )}
            </button>
          </Tooltip>
        )}
      </div>

      {isEditing ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full bg-background rounded-md p-3 font-mono text-sm focus:outline-none focus:ring-1 ${
            isNegative
              ? "min-h-15 border border-destructive/30 focus:ring-destructive"
              : "min-h-25 border border-border focus:ring-(--accent-color)"
          }`}
          placeholder={`Añade el ${title.toLowerCase()} aquí...`}
        />
      ) : (
        <ExpandableText
          text={value}
          className={isNegative ? "text-destructive/80" : "text-foreground/90"}
          gradientFrom={isNegative ? "from-background" : "from-(--bg-secondary)"}
        />
      )}
    </div>
  );
}
