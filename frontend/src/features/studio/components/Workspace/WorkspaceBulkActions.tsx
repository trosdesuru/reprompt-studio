"use client";

import { useState } from "react";
import { IconX, IconFolder, IconTrash } from "@tabler/icons-react";

import { DeletePromptsModal } from "./DeletePromptsModal";
import { MovePromptsModal } from "./MovePromptsModal";

interface WorkspaceBulkActionsProps {
  selectedCount: number;
  directories: { id: string; name: string }[];
  onClearSelection: () => void;
  onMoveBulk: (targetDir: string | null) => void;
  onDeleteBulk: () => void;
}

export function WorkspaceBulkActions({
  selectedCount,
  directories,
  onClearSelection,
  onMoveBulk,
  onDeleteBulk,
}: Readonly<WorkspaceBulkActionsProps>) {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isMoveModalOpen, setIsMoveModalOpen] = useState(false);

  const handleDeleteConfirm = () => {
    onDeleteBulk();
    setIsDeleteModalOpen(false);
  };

  const handleMoveConfirm = (targetDir: string | null) => {
    onMoveBulk(targetDir);
    setIsMoveModalOpen(false);
  };

  return (
    <div className="flex items-center justify-between w-full">
      <div className="flex items-center gap-3">
        <button
          onClick={onClearSelection}
          className="p-1.5 rounded-md hover:bg-muted text-muted-foreground transition-colors cursor-pointer"
          title="Cancelar selección"
        >
          <IconX size={20} stroke={2} />
        </button>
        <span className="font-bold text-sm text-foreground">{selectedCount} seleccionados</span>
      </div>

      <div className="flex items-center gap-4 bg-background">
        <button
          onClick={() => setIsMoveModalOpen(true)}
          className="flex items-center gap-2 px-3 py-2 bg-muted/50 hover:bg-muted text-foreground rounded-lg text-xs font-mono font-bold transition-all shadow-sm active:scale-95 border border-border/50"
        >
          <IconFolder size={14} />
          <span className="hidden sm:inline tracking-widest">Mover</span>
        </button>

        <div className="w-px h-5 bg-border/50 hidden sm:block"></div>

        <button
          onClick={() => setIsDeleteModalOpen(true)}
          className="flex items-center gap-2 px-3 py-2 text-red-500 hover:bg-red-500/10 rounded-lg text-xs font-mono font-bold transition-all shadow-sm active:scale-95"
        >
          <IconTrash size={14} />
          <span className="hidden sm:inline tracking-widest">Eliminar</span>
        </button>
      </div>

      <DeletePromptsModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        count={selectedCount}
      />

      <MovePromptsModal
        isOpen={isMoveModalOpen}
        onClose={() => setIsMoveModalOpen(false)}
        onConfirm={handleMoveConfirm}
        count={selectedCount}
        directories={directories}
      />
    </div>
  );
}
