import { IconCopy, IconCheck } from "@tabler/icons-react";
import { useState } from "react";
import { SavedPrompt } from "../hooks/useStudio";

export function PromptCard({ item }: { item: SavedPrompt }) {
  const [copied, setCopied] = useState(false);

  const copyPrompt = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(item.prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const date = new Date(item.created_at).toLocaleDateString();

  return (
    <div className="neo-border bg-(--bg-secondary) flex flex-col h-full hover:neo-shadow-accent transition-all group">
      <div className="bg-background border-b-2 border-(--border-color) p-3 flex justify-between items-center">
        <span className="font-mono text-xs font-black uppercase truncate pr-2">{item.title}</span>
        <span className="text-[10px] font-mono text-(--text-secondary)">{date}</span>
      </div>

      <div className="p-4 grow relative overflow-hidden bg-background">
        <p className="font-mono text-sm leading-relaxed line-clamp-4 text-foreground">
          {item.prompt}
        </p>

        {/* Botón flotante de copiar que aparece al pasar el ratón */}
        <button
          onClick={copyPrompt}
          className="absolute top-2 right-2 p-1.5 bg-(--accent-color) text-white neo-border opacity-0 group-hover:opacity-100 transition-opacity"
          title="Copiar Prompt"
        >
          {copied ? <IconCheck size={16} /> : <IconCopy size={16} />}
        </button>
      </div>

      <div className="p-3 border-t-2 border-(--border-color) bg-(--bg-secondary) flex flex-wrap gap-2">
        <Badge color="bg-purple-500" text={item.software || "IA"} />
        {item.model && <Badge color="bg-blue-500" text={item.model} />}
        {item.sampler && <Badge color="bg-gray-700" text={item.sampler} />}
      </div>
    </div>
  );
}

function Badge({ color, text }: { color: string; text: string }) {
  return (
    <span
      className={`${color} text-white font-mono text-[9px] font-bold px-1.5 py-0.5 border border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] truncate max-w-120px`}
    >
      {text}
    </span>
  );
}
