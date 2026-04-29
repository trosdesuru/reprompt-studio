"use client";

import { useState } from "react";
import { useAuthStore } from "@/src/store/authStore";
import { Button } from "@/src/system/atoms/Button/Button";
import { DeleteAccountModal } from "./DeleteAccountModal";

export function DangerZoneSettingsSection() {
  const { user } = useAuthStore();
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (!user) return null;

  return (
    <section className="flex flex-col gap-4 mt-12">
      <div className="flex flex-col gap-1">
        <h3 className="text-lg font-bold text-destructive">Danger Zone</h3>
        <p className="text-sm text-muted-foreground">
          Acciones destructivas e irreversibles para tu cuenta.
        </p>
      </div>

      <div className="border-2 border-destructive/20 bg-destructive/5 rounded-xl p-4 md:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex flex-col gap-1 max-w-md">
          <h4 className="font-bold text-foreground">Eliminar cuenta</h4>
          <p className="text-sm text-muted-foreground">
            Borrará permanentemente tu perfil, imágenes y configuraciones. Esta acción no se puede
            deshacer.
          </p>
        </div>

        <Button
          variant="outline"
          className="border-destructive/50 text-destructive hover:bg-destructive hover:text-white shrink-0"
          onClick={() => setIsModalOpen(true)}
        >
          Eliminar cuenta
        </Button>
      </div>

      <DeleteAccountModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        currentUsername={user.username}
      />
    </section>
  );
}
