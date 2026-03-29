import { IconCopy, IconCheck, IconTrash } from "@tabler/icons-react";
import { useState } from "react";
import { SavedPrompt } from "@/src/features/studio/hooks/useStudio";
import { Badge } from "../../atoms/Badge";

interface Props {
  item: SavedPrompt;
  onDelete: (id: number) => void;
}

export function PromptCard({ item, onDelete }: Props) {
  const [copied, setCopied] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const copyPrompt = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(item.prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDelete = () => {
    if (window.confirm("¿Seguro que quieres borrar este prompt de tu búnker?")) {
      setIsDeleting(true); // 🟢 Usamos setIsDeleting
      onDelete(item.id); // 🟢 Usamos onDelete
    }
  };

  const date = new Date(item.created_at).toLocaleDateString(); // 🟢 Variable date preparada

  return (
    <div
      className={`neo-border bg-(--bg-secondary) flex flex-col h-full hover:neo-shadow-accent transition-all group ${isDeleting ? "opacity-50 scale-95" : ""}`}
    >
      {item.image_url && (
        <div className="h-48 border-b-2 border-(--border-color) bg-black overflow-hidden relative">
          <img
            src={item.image_url}
            alt={item.title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>
      )}

      {/* Cabecera */}
      <div className="bg-background border-b-2 border-(--border-color) p-3 flex justify-between items-center">
        <span className="font-mono text-xs font-black uppercase truncate pr-2">{item.title}</span>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono text-(--text-secondary)">{date}</span>{" "}
          {/* 🟢 Mostramos date */}
          <button
            onClick={handleDelete}
            className="text-red-500 hover:text-red-700 transition-colors"
          >
            <IconTrash size={16} /> {/* 🟢 Usamos IconTrash */}
          </button>
        </div>
      </div>

      <div className="p-4 grow relative overflow-hidden bg-background">
        <p className="font-mono text-sm leading-relaxed line-clamp-4 text-foreground">
          {item.prompt}
        </p>
        <button
          onClick={copyPrompt}
          className="absolute top-2 right-2 p-1.5 bg-(--accent-color) text-white neo-border opacity-0 group-hover:opacity-100 transition-opacity"
        >
          {copied ? <IconCheck size={16} /> : <IconCopy size={16} />}
        </button>
      </div>

      <div className="p-3 border-t-2 border-(--border-color) bg-(--bg-secondary) flex flex-wrap gap-2">
        <Badge color="bg-purple-500" text={item.software || "IA"} />
        {item.model && <Badge color="bg-blue-500" text={item.model} />}
      </div>
    </div>
  );
}
