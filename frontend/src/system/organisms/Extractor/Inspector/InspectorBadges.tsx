import { ExtractedPromptData } from "@/src/features/extractor/utils/parsers/types";

export function InspectorBadges({ data }: { data: ExtractedPromptData }) {
  const items = [
    { label: "Engine", value: data.software, color: "bg-purple-500" },
    { label: "Size", value: data.resolution, color: "bg-purple-500" },
    { label: "Model", value: data.model },
    { label: "Sampler", value: data.sampler },
    { label: "Steps", value: data.steps },
    { label: "CFG", value: data.cfgScale },
    { label: "Seed", value: data.seed },
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item, i) => item.value && (
        <div key={i} className="neo-border bg-background flex items-center overflow-hidden">
          <span className={`${item.color || 'bg-(--accent-color)'} text-white font-mono text-[10px] font-bold px-2 py-1 border-r-2 border-(--border-color) uppercase`}>
            {item.label}
          </span>
          <span className="px-3 py-1 font-mono text-xs font-bold text-foreground">
            {item.value}
          </span>
        </div>
      ))}
    </div>
  );
}
