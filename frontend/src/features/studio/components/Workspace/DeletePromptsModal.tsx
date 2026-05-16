"use client";

import { Modal } from "@/src/system/molecules/Modal/Modal";
import { NeoIconBadge } from "@/src/system/atoms/Badge/NeoIconBadge";
import { Button } from "@/src/system/atoms/Button/Button";
import { IconTrash, IconAlertTriangle } from "@tabler/icons-react";

interface DeletePromptsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  count: number;
}

export function DeletePromptsModal({
  isOpen,
  onClose,
  onConfirm,
  count,
}: Readonly<DeletePromptsModalProps>) {
  const isSingle = count === 1;

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-md">
      <div className="p-8 space-y-8">
        <div className="flex flex-col items-center text-center space-y-4">
          <NeoIconBadge variant="danger">
            <IconTrash size={32} />
          </NeoIconBadge>
          <h2 className="text-xl font-black font-mono uppercase tracking-widest text-foreground">
            ¿Eliminar {isSingle ? "este prompt" : `${count} prompts`}?
          </h2>
          <p className="text-muted-foreground font-mono text-sm leading-relaxed max-w-sm">
            Estás a punto de eliminar {isSingle ? "este elemento" : "estos elementos"}{" "}
            permanentemente.
          </p>
        </div>

        <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-lg flex gap-3 items-start">
          <IconAlertTriangle size={20} className="text-red-500 shrink-0 mt-0.5" />
          <p className="text-xs font-mono text-red-600 dark:text-red-400 leading-tight">
            Esta acción eliminará la imagen asociada de nuestros servidores y no se puede deshacer.
          </p>
        </div>

        <div className="flex justify-end gap-3 pt-2 border-t border-border/30">
          <Button variant="secondary" size="sm" onClick={onClose}>
            Cancelar
          </Button>

          <Button
            variant="tertiary"
            size="sm"
            onClick={onConfirm}
          >
            Sí, eliminar
          </Button>
        </div>
      </div>
    </Modal>
  );
}
