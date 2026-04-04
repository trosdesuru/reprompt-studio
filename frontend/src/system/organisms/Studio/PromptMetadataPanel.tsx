import { useState } from "react";
import { IconCopy, IconCheck } from "@tabler/icons-react";
import { SavedPrompt } from "@/src/features/studio/hooks/useStudio";

export function PromptMetadataPanel({ prompt }: { prompt: SavedPrompt }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(prompt.prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="bg-muted/10 p-6 rounded-xl neo-border relative group">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-sm font-mono font-bold uppercase tracking-widest text-(--accent-color)">
            Prompt Principal
          </h3>
          <button
            onClick={handleCopy}
            className="p-2 bg-background neo-border rounded-md hover:bg-muted transition-colors"
            title="Copiar prompt"
          >
            {copied ? <IconCheck size={18} className="text-green-500" /> : <IconCopy size={18} />}
          </button>
        </div>
        <p className="font-mono text-sm leading-relaxed text-foreground">{prompt.prompt}</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {prompt.model && (
          <div className="p-4 bg-background neo-border rounded-lg">
            <span className="block text-[10px] font-mono uppercase text-muted-foreground mb-1">
              Modelo
            </span>
            <span className="font-bold text-sm truncate">{prompt.model}</span>
          </div>
        )}
      </div>
    </div>
  );
}
