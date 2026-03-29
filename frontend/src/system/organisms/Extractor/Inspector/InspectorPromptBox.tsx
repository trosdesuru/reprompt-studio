import { IconCopy, IconCheck } from "@tabler/icons-react";
import { useState } from "react";

interface Props { title: string; content: string; color: string; }

export function InspectorPromptBox({ title, content, color }: Props) {
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="neo-border bg-(--bg-secondary) flex flex-col overflow-hidden">
      <div className="bg-background border-b-2 border-(--border-color) p-2 flex justify-between items-center">
        <span className={`font-mono font-bold text-[10px] uppercase ${color}`}>{title}</span>
        <button onClick={copy} className="hover:text-(--accent-color) transition-colors">
          {copied ? <IconCheck size={16} className="text-green-500" /> : <IconCopy size={16} />}
        </button>
      </div>
      <p className="p-4 font-mono text-sm leading-relaxed whitespace-pre-wrap">{content}</p>
    </div>
  );
}
