"use client";

import { useState } from "react";
import { useAuth } from "@/src/components/AuthProvider";
import { useRouter } from "next/navigation";
import { handleError } from "@/src/utils/errors/ErrorHandler";
import { useNotificationStore } from "@/src/store/notificationStore";
// 🟢 Importamos el Sistema de Diseño
import { FormField } from "@/src/system/molecules/FormField";
import { Button } from "@/src/system/atoms/Button";

export function LoginForm() {
  const auth = useAuth();
  const router = useRouter();
  const notify = useNotificationStore((state) => state.notify);

  const [isLoading, setIsLoading] = useState(false);
  // 🟢 Centralizamos el estado en un objeto para evitar los errores de "Cannot find name"
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await auth.login(formData.username, formData.password);
      notify("Sistemas en línea", `Bienvenido de nuevo, ${formData.username}`, "success");
      router.push("/");
    } catch (err: unknown) {
      const msg = handleError(err, "LoginForm");
      notify("Error de Acceso", msg, "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-8 bg-(--bg-secondary) neo-border neo-shadow">
      <div className="mb-8 text-center">
        <h2 className="text-2xl font-black uppercase font-mono tracking-tighter">
          Acceso al <span className="text-(--accent-color)">Búnker</span>
        </h2>
        <p className="text-xs font-mono text-(--text-secondary) mt-2 uppercase">
          Identifícate para gestionar tus prompts
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 🟢 Usamos la molécula FormField con el mapeo correcto del estado */}
        <FormField
          label="Usuario"
          name="username"
          type="text"
          value={formData.username}
          onChange={handleChange}
          placeholder="Tu alias..."
          required
        />

        <FormField
          label="Contraseña"
          name="password"
          type="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="••••••••"
          required
        />

        <Button
          type="submit"
          isLoading={isLoading}
          className="w-full justify-center h-12 text-sm font-black uppercase tracking-widest"
        >
          Iniciar Secuencia de Entrada
        </Button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-[10px] font-mono text-(--text-secondary) uppercase opacity-50">
          Terminal ID:{" "}
          {typeof window !== "undefined" ? window.crypto.randomUUID().split("-")[0] : "..."}
        </p>
      </div>
    </div>
  );
}
