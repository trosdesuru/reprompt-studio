"use client";

import { useState, useEffect } from "react";
import { IconInfoCircle, IconX, IconArrowRight } from "@tabler/icons-react";
import { Button } from "@/src/system/atoms/Button/Button";
import { UpdatePersonalDataForm } from "./UpdatePersonalDataForm";

interface ChangePersonalDataModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ChangePersonalDataModal({ isOpen, onClose }: ChangePersonalDataModalProps) {
  const [step, setStep] = useState<1 | 2>(1);

  useEffect(() => {
    if (!isOpen) setTimeout(() => setStep(1), 200);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-background border border-border/50 shadow-2xl rounded-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 relative flex flex-col">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 text-muted-foreground hover:text-foreground transition-colors z-10"
        >
          <IconX size={20} />
        </button>

        {step === 1 ? (
          <div className="p-8 flex flex-col">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-6 border border-primary/20">
              <IconInfoCircle size={24} className="text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-2">Tu Perfil Público</h3>
            <p className="text-sm text-muted-foreground mb-6">
              Añadir tu nombre y profesión ayuda a otros creadores a conocerte mejor.
            </p>
            <ul className="space-y-3 text-xs text-muted-foreground mb-8">
              <li className="flex gap-2">✅ Estos datos serán visibles en tu perfil.</li>
              <li className="flex gap-2">✅ Ayuda a mejorar tus recomendaciones.</li>
              <li className="flex gap-2">✅ Puedes borrarlos cuando quieras.</li>
            </ul>
            <div className="flex justify-end gap-3 pt-4 border-t border-border/30">
              <Button variant="tertiary" size="sm" onClick={onClose}>
                Cancelar
              </Button>
              <Button variant="secondary" size="sm" onClick={() => setStep(2)}>
                Continuar <IconArrowRight size={16} className="ml-2" />
              </Button>
            </div>
          </div>
        ) : (
          <UpdatePersonalDataForm onSuccess={onClose} />
        )}
      </div>
    </div>
  );
}
