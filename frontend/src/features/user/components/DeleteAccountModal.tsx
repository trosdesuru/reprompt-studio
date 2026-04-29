"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/src/services/api";
import { useAuthStore } from "@/src/store/authStore";
import { useNotificationStore } from "@/src/store/notificationStore";
import { Button } from "@/src/system/atoms/Button/Button";
import { Input } from "@/src/system/atoms/Input/Input";
import { IconAlertCircle, IconLoader } from "@tabler/icons-react";

interface DeleteAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUsername: string;
}

export function DeleteAccountModal({ isOpen, onClose, currentUsername }: DeleteAccountModalProps) {
  const [confirmText, setConfirmText] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();
  const { logout } = useAuthStore();
  const { notify } = useNotificationStore();

  if (!isOpen) return null;

  const isMatch = confirmText === currentUsername;

  const handleDelete = async () => {
    if (!isMatch) return;

    setIsLoading(true);
    try {
      await api.deleteAccount(confirmText);

      notify("Cuenta eliminada", "Tus datos han sido purgados del sistema.", "success");
      logout();
      router.push("/");
    } catch (error: any) {
      console.error("Error en el borrado nuclear:", error);
      notify("Error", error.message || "No se pudo eliminar la cuenta.", "error");
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-card w-full max-w-md rounded-xl border border-destructive/30 neo-shadow-destructive p-6 flex flex-col gap-6">
        {/* Cabecera del Modal */}
        <div className="flex flex-col gap-2 text-center items-center">
          <div className="h-12 w-12 rounded-full bg-destructive/10 text-destructive flex items-center justify-center mb-2">
            <IconAlertCircle size={24} />
          </div>
          <h2 className="text-xl font-bold tracking-tight text-foreground">
            Eliminar cuenta permanentemente
          </h2>
          <p className="text-sm text-muted-foreground">
            Esta acción es <strong className="text-destructive">irreversible</strong>. Se borrarán
            todos tus prompts, imágenes de nuestros servidores y colecciones.
          </p>
        </div>

        {/* Zona de Fricción (Input) */}
        <div className="flex flex-col gap-3 bg-destructive/5 p-4 rounded-lg border border-destructive/20">
          <label className="text-sm font-medium text-foreground">
            Para confirmar, escribe <strong>{currentUsername}</strong>
          </label>
          <Input
            type="text"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            className="border-destructive/30 focus-visible:ring-destructive bg-background"
            placeholder={currentUsername}
            disabled={isLoading}
          />
        </div>

        {/* Botones de Acción */}
        <div className="flex justify-end gap-3 w-full pt-2">
          <Button variant="ghost" onClick={onClose} disabled={isLoading} className="flex-1">
            Cancelar
          </Button>
          <Button
            variant="tertiary"
            onClick={handleDelete}
            disabled={!isMatch || isLoading}
            className={`flex-1 ${isMatch ? "bg-destructive hover:bg-destructive/90 text-white" : "opacity-50"}`}
          >
            {isLoading ? <IconLoader className="h-4 w-4 animate-spin" /> : "Destruir Cuenta"}
          </Button>
        </div>
      </div>
    </div>
  );
}
