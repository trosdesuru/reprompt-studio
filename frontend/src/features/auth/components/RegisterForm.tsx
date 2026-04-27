"use client";

import { useState } from "react";
import { useRegister } from "@/src/features/auth/hooks/useRegister";
import { Button } from "@/src/system/atoms/Button/Button";

export function RegisterForm({ lang }: { lang: string }) {
  const { handleRegister, isLoading, error } = useRegister(lang);
  const [username, setUsername] = useState("");

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username) return;
    await handleRegister({ username, email: "", password: "" } as any);
  };

  return (
    <div className="w-full max-w-md space-y-6">
      <div className="flex flex-col space-y-2 text-center">
        <h1 className="text-2xl font-black tracking-tight font-mono uppercase">Crear Cuenta</h1>
        <p className="text-sm text-muted-foreground">
          Introduce tus datos para empezar en Reprompt
        </p>
      </div>
      <form onSubmit={onSubmit} className="space-y-4">
        <input
          className="w-full p-2 bg-muted border border-border rounded outline-none focus:ring-1 focus:ring-accent"
          placeholder="Usuario"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        {error && <p className="text-xs text-red-500 font-mono">{error}</p>}
        <Button className="w-full" disabled={isLoading}>
          {isLoading ? "Creando..." : "Registrarse"}
        </Button>
      </form>
    </div>
  );
}
