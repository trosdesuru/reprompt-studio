"use client";

import { useState } from "react";
import { User } from "@/src/store/authStore";
import { Button } from "@/src/system/atoms/Button/Button";
import { IconId } from "@tabler/icons-react";
import { ChangePersonalDataModal } from "./ChangePersonalDataModal";

export function PersonalDataSettingsSection({ user }: Readonly<{ user: User }>) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="flex flex-col md:flex-row gap-6 md:items-center justify-between border-b border-border/30 pb-8">
      <div className="flex-1">
        <h3 className="text-lg font-bold">Datos Personales</h3>
        <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
          Nombre:{" "}
          <span className="text-destructive font-bold">{user.fullName || "Sin definir"}</span> •
          Profesión:{" "}
          <span className="text-destructive font-bold">{user.profession || "Sin definir"}</span>
        </p>
      </div>

      <Button
        variant="secondary"
        className="shrink-0 gap-2 font-mono text-xs tracking-widest uppercase"
        onClick={() => setIsModalOpen(true)}
      >
        <IconId size={16} />
        Modificar Datos
      </Button>

      <ChangePersonalDataModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}
