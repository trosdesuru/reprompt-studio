"use client";

import { useState } from "react";
import { api } from "@/src/services/api";
import { Button } from "@/src/components/ui/Button";
import { IconKey, IconX } from "@tabler/icons-react";

interface ChangePasswordModalProps {
  onClose: () => void;
}

export function ChangePasswordModal({ onClose }: ChangePasswordModalProps) {
  const [pwdData, setPwdData] = useState({ old_password: "", new_password: "" });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await api.cambiarPassword(pwdData);
      alert("✅ Contraseña actualizada con éxito");
      onClose();
    } catch (err: any) {
      alert(`❌ Error: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
      <form
        onSubmit={handleSubmit}
        className="bg-(--bg-secondary) p-8 neo-border neo-shadow flex flex-col gap-5 max-w-sm w-full animate-fade-in relative"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-(--text-secondary) hover:text-red-500 transition-colors"
        >
          <IconX size={24} />
        </button>

        <h3 className="text-xl font-bold font-mono text-foreground uppercase flex items-center gap-2 border-b-2 border-(--border-color) pb-3">
          <IconKey size={24} className="text-(--accent-color)" />
          Cambiar Clave
        </h3>

        <input
          type="password"
          placeholder="Clave Actual"
          required
          className="neo-border p-3 bg-background text-foreground font-mono focus:outline-none focus:neo-shadow-accent transition-all"
          value={pwdData.old_password}
          onChange={(e) => setPwdData({ ...pwdData, old_password: e.target.value })}
        />
        <input
          type="password"
          placeholder="Nueva Clave"
          required
          className="neo-border p-3 bg-background text-foreground font-mono focus:outline-none focus:neo-shadow-accent transition-all"
          value={pwdData.new_password}
          onChange={(e) => setPwdData({ ...pwdData, new_password: e.target.value })}
        />

        <Button type="submit" variant="primary" isLoading={isLoading} className="mt-2 w-full">
          Guardar Cambios
        </Button>
      </form>
    </div>
  );
}
