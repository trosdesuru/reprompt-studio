// 🟢 CORRECCIÓN: Importamos IconTrash que faltaba
import { IconCopy, IconCheck, IconTrash } from "@tabler/icons-react";
import { useState } from "react";
import { SavedPrompt } from "../hooks/useStudio";

interface Props {
  item: SavedPrompt;
  onDelete: (id: number) => void;
}

// 🟢 CORRECCIÓN: Usamos 'Props' en lugar de '{ item: SavedPrompt }' para recibir onDelete
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
      setIsDeleting(true);
      onDelete(item.id);
    }
  };

  const date = new Date(item.created_at).toLocaleDateString();

  console.log(`🎨 [DEBUG PROMPTCARD] Renderizando ID ${item.id}:`, {
    tiene_imagen: !!item.image_url,
    contenido_imagen: item.image_url ? item.image_url.substring(0, 50) + "..." : "NULO/VACÍO"
  });

  return (
    <div
      className={`neo-border bg-(--bg-secondary) flex flex-col h-full hover:neo-shadow-accent transition-all group ${
        isDeleting ? "opacity-50 scale-95" : ""
      }`}
    >
      {/* Imagen de Portada */}
      {item.image_url && (
        <div className="h-48 border-b-2 border-(--border-color) bg-black overflow-hidden relative">
          <img
            src={item.image_url}
            alt={item.title}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
            loading="lazy"
          />
        </div>
      )}

      {/* Cabecera */}
      <div className="bg-background border-b-2 border-(--border-color) p-3 flex justify-between items-center">
        <span className="font-mono text-xs font-black uppercase truncate pr-2">{item.title}</span>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono text-(--text-secondary)">{date}</span>
          {/* Botón de Borrar */}
          <button
            onClick={handleDelete}
            className="text-red-500 hover:text-red-700 transition-colors"
            title="Eliminar"
          >
            <IconTrash size={16} />
          </button>
        </div>
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
      className={`${color} text-white font-mono text-[9px] font-bold px-1.5 py-0.5 border border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] truncate max-w-30`}
    >
      {text}
    </span>
  );
}
