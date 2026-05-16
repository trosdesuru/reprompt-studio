"use client";

import { useState } from "react";
import { User } from "@/src/store/authStore";
import { Button } from "@/src/system/atoms/Button/Button";
import { IconEdit } from "@tabler/icons-react";
import { ChangeUsernameModal } from "@/src/features/user/components/ChangeUsernameModal";

interface UsernameSettingsSectionProps {
  user: User;
  lang: string;
}

export function UsernameSettingsSection({ user, lang }: Readonly<UsernameSettingsSectionProps>) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="flex flex-col md:flex-row gap-6 md:items-center justify-between border-b border-border/30 pb-8">
      <div className="flex-1">
        <h3 className="text-lg font-bold">Nombre de Usuario</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Tu nombre actual es{" "}
          <strong className="font-black text-brand-strong">@{user.username}</strong>. Este nombre se
          usa para tu URL pública.
        </p>
      </div>

      <Button
        variant="secondary"
        className="shrink-0 gap-2 font-mono text-xs tracking-widest uppercase"
        onClick={() => setIsModalOpen(true)}
      >
        <IconEdit size={16} />
        Cambiar Username
      </Button>

      <ChangeUsernameModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} lang={lang} />
    </div>
  );
}
