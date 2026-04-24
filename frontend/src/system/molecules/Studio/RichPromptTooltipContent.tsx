import React from "react";
import {
  IconAlertTriangle,
  IconBoxMargin,
  IconCpu,
  IconFocus2,
  IconNumbers,
  IconPalette,
  IconTag,
  IconTerminal2,
} from "@tabler/icons-react";
import { SavedPrompt } from "@/src/types/models";

export function RichPromptTooltipContent({ prompt }: { prompt: SavedPrompt }) {
  const MetadataRow = ({
    icon,
    label,
    value,
  }: {
    icon: React.ReactNode;
    label: string;
    value: React.ReactNode | null | undefined;
  }) => {
    const isMissing = value === null || value === undefined || value === "";

    return (
      <div className="flex items-start gap-2.5 py-1">
        <div className="text-foreground/80 mt-0.5">{icon}</div>
        <div className="flex flex-col flex-1 min-w-0">
          <span className="text-[10px] text-muted-foreground uppercase font-mono font-bold tracking-widest leading-none mb-1">
            {label}
          </span>
          <span
            className={`text-xs font-semibold truncate ${
              isMissing ? "text-destructive font-bold" : "text-foreground"
            }`}
          >
            {isMissing ? "N/A" : value}
          </span>
        </div>
      </div>
    );
  };

  const highConfidenceTags = prompt.auto_tags
    ? prompt.auto_tags.filter((t) => t.confidence >= 90).map((t) => t.name)
    : [];

  const displayResolution =
    prompt.width && prompt.height ? `${prompt.width} x ${prompt.height}` : prompt.resolution;

  return (
    <div className="flex flex-col gap-2 pt-1 min-w-60 max-w-70">
      {/* CABECERA */}
      <div className="flex flex-col gap-1.5 border-b border-border pb-3 mb-1">
        <h3 className="font-black text-sm text-foreground truncate">
          {prompt.title || "Sin título"}
        </h3>
        <div className="flex items-center gap-1.5">
          <IconTerminal2 size={14} className="text-accent" />
          <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-accent truncate">
            {prompt.software || "Software N/A"}
          </span>
        </div>
      </div>

      {/* GRID DE PARÁMETROS */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-2">
        <MetadataRow icon={<IconPalette size={16} />} label="Modelo" value={prompt.model} />
        <MetadataRow
          icon={<IconBoxMargin size={16} />}
          label="Resolución"
          value={displayResolution}
        />
        <MetadataRow icon={<IconNumbers size={16} />} label="Steps" value={prompt.steps} />
        <MetadataRow icon={<IconFocus2 size={16} />} label="CFG Scale" value={prompt.cfg_scale} />
        <MetadataRow icon={<IconCpu size={16} />} label="Seed" value={prompt.seed} />
      </div>

      {/* TAGS */}
      {highConfidenceTags.length > 0 && (
        <div className="mt-2 pt-3 border-t border-border">
          <MetadataRow
            icon={<IconTag size={16} />}
            label="Tags (>90%)"
            value={
              <span className="text-[11px] text-foreground font-medium whitespace-normal leading-relaxed block">
                {highConfidenceTags.join(", ")}
              </span>
            }
          />
        </div>
      )}

      {/* ALERTA DE SEGURIDAD */}
      {!prompt.image_url && (
        <div className="flex items-start gap-2 mt-2 pt-3 border-t border-destructive/30 text-destructive bg-destructive/10 p-2 rounded-md">
          <IconAlertTriangle size={16} className="shrink-0" />
          <span className="text-[10px] font-mono uppercase font-black tracking-wider leading-tight">
            Archivo físico no encontrado.
          </span>
        </div>
      )}
    </div>
  );
}
