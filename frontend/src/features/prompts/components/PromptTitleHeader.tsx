"use client";

import { useDownloadImage } from "@/src/features/prompts/hooks/useDownloadImage";
import { IconDownload, IconTrash } from "@tabler/icons-react";
import { Tooltip } from "@/src/system/atoms/Tooltip/Tooltip";

interface PromptTitleHeaderProps {
  title?: string;
  createdAt: string | Date;
  imageUrl?: string | null;
  // 🟢 Nuevas props para el borrado
  isOwner?: boolean;
  promptId?: string;
  onDelete?: (id: string) => void;
}

export function PromptTitleHeader({
  title,
  createdAt,
  imageUrl,
  isOwner,
  promptId,
  onDelete,
}: PromptTitleHeaderProps) {
  const { downloadImage, isDownloading } = useDownloadImage();

  const handleDelete = () => {
    if (!onDelete || !promptId) return;

    // 🛡️ Programación defensiva: Confirmación antes de ejecutar
    if (
      window.confirm(
        "¿Estás seguro de que quieres eliminar este prompt? Esta acción es irreversible.",
      )
    ) {
      onDelete(promptId);
    }
  };

  return (
    <header className="shrink-0 mb-6 flex items-start justify-between gap-4">
      <div className="flex flex-col">
        <h1 className="text-2xl lg:text-3xl font-black uppercase tracking-tighter mb-2 leading-tight text-foreground">
          {title || "Prompt Sin Título"}
        </h1>
        <p className="text-xs font-mono text-muted-foreground/80 tracking-widest uppercase">
          Creado el {new Date(createdAt).toLocaleDateString()}
        </p>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {/* 🟢 BOTÓN DESCARGAR */}
        {imageUrl && (
          <Tooltip content="Descargar Imagen" side="bottom">
            <button
              onClick={() => downloadImage(imageUrl, title)}
              disabled={isDownloading}
              className={`p-2.5 rounded-lg border border-border/50 transition-all duration-200 ${
                isDownloading
                  ? "bg-muted text-muted-foreground opacity-50 cursor-not-allowed"
                  : "bg-muted/10 hover:bg-(--accent-color) hover:text-white hover:border-(--accent-color) text-muted-foreground"
              }`}
            >
              <IconDownload
                size={20}
                stroke={isDownloading ? 2 : 1.5}
                className={isDownloading ? "animate-pulse" : ""}
              />
            </button>
          </Tooltip>
        )}

        {/* 🟢 BOTÓN ELIMINAR (Solo para el dueño) */}
        {isOwner && onDelete && (
          <Tooltip content="Eliminar Prompt" side="bottom">
            <button
              onClick={handleDelete}
              className="p-2.5 rounded-lg border border-border/50 bg-red-500/5 text-red-500 hover:bg-red-500 hover:text-white hover:border-red-500 transition-all duration-200"
            >
              <IconTrash size={20} stroke={1.5} />
            </button>
          </Tooltip>
        )}
      </div>
    </header>
  );
}
