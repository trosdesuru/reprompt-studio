"use client";

import { useState, useEffect } from "react";
import { Modal } from "@/src/system/molecules/Modal/Modal";
import { ChangeUsernameWarningStep } from "./ChangeUsernameWarningStep";
import { ChangeUsernameFormStep } from "./ChangeUsernameFormStep";

interface ChangeUsernameModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: string;
}

export function ChangeUsernameModal({ isOpen, onClose, lang }: ChangeUsernameModalProps) {
  const [step, setStep] = useState<1 | 2>(1);

  useEffect(() => {
    if (!isOpen) setTimeout(() => setStep(1), 200);
  }, [isOpen]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-sm">
      {step === 1 && <ChangeUsernameWarningStep onClose={onClose} onConfirm={() => setStep(2)} />}

      {step === 2 && <ChangeUsernameFormStep lang={lang} />}
    </Modal>
  );
}
