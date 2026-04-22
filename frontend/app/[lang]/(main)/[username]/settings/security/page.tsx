"use client";

import { useState, useRef } from "react";
import { useAuthStore } from "@/src/store/authStore";
import { api } from "@/src/services/api"; // Asegúrate de que esta ruta coincida con tu API
import { toast } from "react-hot-toast";
import { Button } from "@/src/system/atoms/Button";
import { IconShieldLock, IconAlertTriangle } from "@tabler/icons-react";

export default function SecuritySettingsPage() {
  const user = useAuthStore((state) => state.user);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  // 🚀 HIGH PERFORMANCE SUBMIT: Usamos FormData en lugar de controlar cada input
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const currentPassword = formData.get("currentPassword") as string;
    const newPassword = formData.get("newPassword") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    // Validación de Frontera (Confianza Cero)
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
      // Sustituye esto por tu llamada real a la API
      await api.cambiarPassword({
        current_password: currentPassword,
        new_password: newPassword,
      });

      toast.success("Contraseña actualizada con éxito");
      formRef.current?.reset(); // Limpiamos el formulario nativamente
    } catch (err: any) {
      setError(err.message || "Fallo al actualizar la contraseña");
      toast.error("No se pudo cambiar la contraseña");
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-2xl animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-black font-mono uppercase flex items-center gap-3">
          <IconShieldLock className="text-(--accent-color)" size={28} />
          Seguridad y Acceso
        </h1>
        <p className="text-sm text-muted-foreground mt-2">
          Gestiona tu contraseña y protege tu cuenta de Reprompt.
        </p>
      </div>

      <div className="bg-background neo-border p-6 relative overflow-hidden">
        {/* Decoración sutil */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-(--accent-color) opacity-5 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2"></div>

        <h2 className="text-lg font-bold border-b-2 border-(--border-color) pb-3 mb-6">
          Cambiar Contraseña
        </h2>

        {error && (
          <div className="mb-6 p-3 bg-red-500/10 border border-red-500 text-red-500 text-sm font-bold flex items-center gap-2">
            <IconAlertTriangle size={18} /> {error}
          </div>
        )}

        <form ref={formRef} onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="text-xs font-black font-mono uppercase tracking-widest text-muted-foreground">
              Contraseña Actual
            </label>
            <input
              type="password"
              name="currentPassword"
              required
              className="w-full p-3 bg-(--bg-secondary) neo-border focus:outline-none focus:ring-2 focus:ring-(--accent-color) transition-all"
              placeholder="••••••••"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black font-mono uppercase tracking-widest text-muted-foreground">
              Nueva Contraseña
            </label>
            <input
              type="password"
              name="newPassword"
              required
              minLength={8}
              className="w-full p-3 bg-(--bg-secondary) neo-border focus:outline-none focus:ring-2 focus:ring-(--accent-color) transition-all"
              placeholder="••••••••"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black font-mono uppercase tracking-widest text-muted-foreground">
              Confirmar Nueva Contraseña
            </label>
            <input
              type="password"
              name="confirmPassword"
              required
              minLength={8}
              className="w-full p-3 bg-(--bg-secondary) neo-border focus:outline-none focus:ring-2 focus:ring-(--accent-color) transition-all"
              placeholder="••••••••"
            />
          </div>

          <div className="pt-4 border-t-2 border-(--border-color) flex items-center justify-between">
            <p className="text-xs text-muted-foreground font-mono">
              La sesión actual se mantendrá activa.
            </p>
            <Button type="submit" isLoading={isLoading} className="min-w-37.5">
              {isLoading ? "Guardando..." : "Actualizar Clave"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
