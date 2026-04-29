"use client";

import { useState, useRef } from "react";
import { useAuthStore } from "@/src/store/authStore";
import { api } from "@/src/services/api";
import { toast } from "react-hot-toast";
import { Button } from "@/src/system/atoms/Button/Button";
import { Input } from "@/src/system/atoms/Input/Input";
import { IconShieldLock, IconAlertTriangle } from "@tabler/icons-react";
import { SettingsSectionHeader } from "@/src/features/settings/components/SettingsSectionHeader";
import { DangerZoneSettingsSection } from "@/src/features/user/components/DangerZoneSettingsSection";

export default function SecuritySettingsPage() {
  const user = useAuthStore((state) => state.user);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const currentPassword = formData.get("currentPassword") as string;
    const newPassword = formData.get("newPassword") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (newPassword !== confirmPassword) {
      setError("Las contraseñas nuevas no coinciden.");
      setIsLoading(false);
      return;
    }

    if (newPassword.length < 8) {
      setError("La nueva contraseña debe tener al menos 8 caracteres.");
      setIsLoading(false);
      return;
    }

    try {
      await api.cambiarPassword({
        current_password: currentPassword,
        new_password: newPassword,
      });

      toast.success("Contraseña actualizada con éxito");
      formRef.current?.reset();
    } catch (err: any) {
      setError(err.message || "Fallo al actualizar la contraseña");
      toast.error("No se pudo cambiar la contraseña");
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="animate-fade-in space-y-8 w-full">
      <SettingsSectionHeader
        title="Seguridad y Acceso"
        description="Gestiona tu contraseña y protege tu cuenta de Reprompt."
        icon={<IconShieldLock className="text-muted-foreground" size={24} />}
      />

      <div className="bg-background border border-border/50 rounded-xl p-6 md:p-8 relative overflow-hidden shadow-sm">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary opacity-5 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

        <h2 className="text-lg font-mono font-bold border-b border-border/50 pb-3 mb-6">
          Cambiar Contraseña
        </h2>

        {error && (
          <div className="mb-6 p-3 bg-red-400/10 border border-red-500/60 text-red-600 text-sm font-medium flex items-center gap-2 rounded-md">
            <IconAlertTriangle size={18} /> {error}
          </div>
        )}

        <form ref={formRef} onSubmit={handleSubmit} className="space-y-5 relative z-10">
          <Input
            label="Contraseña Actual"
            name="currentPassword"
            type="password"
            placeholder="••••••••"
            required
          />

          <Input
            label="Nueva Contraseña"
            name="newPassword"
            type="password"
            placeholder="••••••••"
            required
            minLength={8}
          />

          <Input
            label="Confirmar Nueva Contraseña"
            name="confirmPassword"
            type="password"
            placeholder="••••••••"
            required
            minLength={8}
          />

          <div className="pt-6 mt-6 border-t border-border/50 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-muted-foreground font-mono">
              La sesión actual se mantendrá activa tras guardar.
            </p>
            <Button
              variant="secondary"
              type="submit"
              isLoading={isLoading}
              className="w-full sm:w-auto min-w-37.5 font-mono text-xs"
            >
              {isLoading ? "Guardando..." : "Actualizar Clave"}
            </Button>
          </div>
        </form>
      </div>
      <DangerZoneSettingsSection />
    </div>
  );
}
