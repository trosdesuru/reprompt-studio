"use client";

import { useState, useEffect } from "react";
import { Modal } from "@/src/system/molecules/Modal/Modal";
import { ChangePersonalDataInfoStep } from "./ChangePersonalDataInfoStep";
import { UpdatePersonalDataForm } from "./UpdatePersonalDataForm";

interface ChangePersonalDataModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ChangePersonalDataModal({
  isOpen,
  onClose,
}: Readonly<ChangePersonalDataModalProps>) {
  const [step, setStep] = useState<1 | 2>(1);

  useEffect(() => {
    if (!isOpen) setTimeout(() => setStep(1), 200);
  }, [isOpen]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-md">
      {step === 1 && <ChangePersonalDataInfoStep onClose={onClose} onConfirm={() => setStep(2)} />}

      {step === 2 && <UpdatePersonalDataForm onSuccess={onClose} />}
    </Modal>
  );
}
