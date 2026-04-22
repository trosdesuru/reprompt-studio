"use client";

import { useState } from "react";
import { MenuItem } from "@/src/system/atoms/Menu/MenuItem";
import { ChangePasswordModal } from "@/src/system/organisms/Auth/ChangePasswordModal";
import { IconKey } from "@tabler/icons-react";

interface Props {
  onActionComplete: () => void;
}

export function PasswordChangeMenuItem({ onActionComplete }: Props) {
  const [showModal, setShowModal] = useState(false);

  const handleClick = () => {
    setShowModal(true);
    onActionComplete();
  };

  return (
    <>
      <MenuItem icon={<IconKey size={18} />} label="Cambiar Contraseña" onClick={handleClick} />
      {showModal && <ChangePasswordModal onClose={() => setShowModal(false)} />}
    </>
  );
}
