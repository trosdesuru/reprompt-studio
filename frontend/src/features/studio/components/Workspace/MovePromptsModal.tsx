"use client";

import { useState, useEffect } from "react";
import { Modal } from "@/src/system/molecules/Modal/Modal";
import { NeoIconBadge } from "@/src/system/atoms/Badge/NeoIconBadge";
import { Button } from "@/src/system/atoms/Button/Button";
import { IconFolder, IconFolderSymlink } from "@tabler/icons-react";

interface Directory {
  id: string;
  name: string;
}

interface MovePromptsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (targetDirId: string | null) => void;
  count: number;
  directories: Directory[];
}

export function MovePromptsModal({
  isOpen,
  onClose,
  onConfirm,
  count,
  directories,
}: Readonly<MovePromptsModalProps>) {
  const [selectedDir, setSelectedDir] = useState<string>("root");
  const isSingle = count === 1;

  useEffect(() => {
    if (isOpen) setSelectedDir("root");
  }, [isOpen]);

  const handleConfirm = () => {
    const target = selectedDir === "root" ? null : selectedDir;
    onConfirm(target);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-md">
      <div className="p-8 space-y-8">
        <div className="flex flex-col items-center text-center space-y-4">
          <NeoIconBadge variant="info">
            <IconFolderSymlink size={32} />
          </NeoIconBadge>
          <h2 className="text-xl font-black font-mono uppercase tracking-widest text-foreground">
            Mover {isSingle ? "Prompt" : `${count} Prompts`}
          </h2>
          <p className="text-muted-foreground font-mono text-sm leading-relaxed max-w-sm">
            Selecciona la colección de destino para organizar tu biblioteca.
          </p>
        </div>

        <div className="space-y-3 bg-muted/30 p-5 rounded-xl border border-border/50">
          <label className="text-[10px] font-bold uppercase text-muted-foreground flex items-center gap-1.5">
            <IconFolder size={14} /> Destino
          </label>
          <select
            className="w-full bg-background text-sm font-mono p-3 rounded-lg border border-border outline-none focus:ring-2 focus:ring-accent transition-all cursor-pointer"
            value={selectedDir}
            onChange={(e) => setSelectedDir(e.target.value)}
          >
            <option value="root">📁 Suelto (Root)</option>
            {directories.map((d) => (
              <option key={d.id} value={d.id}>
                📁 {d.name.toUpperCase()}
              </option>
            ))}
          </select>
        </div>

        <div className="flex justify-end gap-3 pt-2 border-t border-border/30">
          <Button variant="tertiary" size="sm" onClick={onClose}>
            Cancelar
          </Button>
          <Button variant="secondary" size="sm" onClick={handleConfirm}>
            Mover a destino
          </Button>
        </div>
      </div>
    </Modal>
  );
}
