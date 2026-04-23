"use client";

import { useState, useEffect } from "react";
import { IconAlertTriangle, IconArrowRight } from "@tabler/icons-react";
import { Button } from "@/src/system/atoms/Button/Button";
import { UpdateUsernameForm } from "./UpdateUsernameForm";
import { Modal } from "@/src/system/molecules/Modal/Modal";

interface ChangeUsernameModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: string;
}

export function ChangeUsernameModal({ isOpen, onClose, lang }: ChangeUsernameModalProps) {
  const [step, setStep] = useState<1 | 2>(1);

  useEffect(() => {
    if (isOpen) setStep(1);
  }, [isOpen]);

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      {step === 1 && (
        <div className="p-6 md:p-8 flex flex-col">
          <div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center mb-6 border border-red-500/20">
            <IconAlertTriangle size={24} className="text-red-500" />
          </div>

          <h3 className="text-xl font-bold tracking-tight mb-2">Antes de cambiar tu nombre...</h3>
          <p className="text-sm text-muted-foreground mb-6">
            Esta es una acción crítica. Por favor, lee las consecuencias de cambiar tu identidad en
            Reprompt:
          </p>

          <ul className="space-y-4 text-sm mb-8">
            <li className="flex gap-3">
              <span className="text-red-500 font-bold">•</span>
              <span>
                Tu antigua URL (
                <span className="font-mono text-xs">/reprompt.studio/{lang}/antiguo</span>){" "}
                <strong>dejará de funcionar inmediatamente</strong>. Se generarán errores 404 para
                cualquiera que intente acceder.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="text-primary font-bold">•</span>
              <span>
                Los cambios en todas las bases de datos pueden tardar{" "}
                <strong>varios minutos</strong> en propagarse por completo.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="text-primary font-bold">•</span>
              <span>
                Por motivos de seguridad, <strong>tu sesión se cerrará automáticamente</strong> y
                deberás volver a iniciar sesión con tu nuevo nombre.
              </span>
            </li>
          </ul>

          <div className="flex items-center justify-end gap-3 mt-auto pt-4 border-t border-border/30">
            <Button variant="secondary" onClick={onClose} className="text-muted-foreground">
              Cancelar
            </Button>
            <Button onClick={() => setStep(2)} variant="primary" className="gap-2">
              Continuar <IconArrowRight size={16} />
            </Button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="p-2">
          <UpdateUsernameForm lang={lang} />
        </div>
      )}
    </Modal>
  );
}
