import { IconCopy, IconCheck } from "@tabler/icons-react";

interface PromptCardSnippetProps {
  promptText: string;
  copied: boolean;
  onCopy: (text: string) => void;
}

export function PromptCardSnippet({ promptText, copied, onCopy }: PromptCardSnippetProps) {
  if (!promptText) return null;

  return (
    <div className="relative group/prompt bg-muted/30 rounded-lg p-2 border border-border/50 mt-2 w-full">
      <p className="text-[11px] font-mono text-foreground/70 line-clamp-2">{promptText}</p>

      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onCopy(promptText);
        }}
        className="absolute top-1 right-1 p-1 bg-background border rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
        aria-label="Copiar prompt"
      >
        {copied ? (
          <IconCheck size={12} className="text-green-500" />
        ) : (
          <IconCopy size={12} className="text-muted-foreground" />
        )}
      </button>
    </div>
  );
}
