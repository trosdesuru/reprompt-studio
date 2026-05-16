"use client";

import { IconArrowRight } from "@tabler/icons-react";
import { Button } from "@/src/system/atoms/Button/Button";

interface ChangePersonalDataInfoStepProps {
  onClose: () => void;
  onConfirm: () => void;
}

export function ChangePersonalDataInfoStep({
  onClose,
  onConfirm,
}: Readonly<ChangePersonalDataInfoStepProps>) {
  return (
    <div className="p-8 flex flex-col">
      <h3 className="text-xl font-bold mb-2">Tus Datos Personales</h3>
      <p className="text-sm text-muted-foreground mb-6">
        Añadir tu nombre y profesión ayuda a otros creadores a conocerte mejor.
      </p>
      <ul className="space-y-3 text-xs text-muted-foreground mb-8">
        <li className="flex gap-2">• Estos datos serán visibles en tu perfil.</li>
        <li className="flex gap-2">• Ayuda a mejorar tus recomendaciones.</li>
        <li className="flex gap-2">• Puedes borrarlos cuando quieras.</li>
      </ul>
      <div className="flex justify-end gap-3 pt-4 border-t border-border/30">
        <Button variant="tertiary" size="sm" onClick={onClose}>
          Cancelar
        </Button>
        <Button variant="secondary" size="sm" onClick={onConfirm}>
          Continuar <IconArrowRight size={16} className="ml-2" />
        </Button>
      </div>
    </div>
  );
}
