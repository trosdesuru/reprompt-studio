"use client";

import { useState } from "react";
import { api } from "@/src/services/api";
import { Button } from "@/src/components/ui/Button";
import { handleError } from "@/src/utils/errors/ErrorHandler";

export default function LoginForm() {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await api.login(formData);
      window.location.href = "/";
    } catch (err: unknown) {
      const msg = handleError(err, "LoginForm");
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-6 bg-(--bg-secondary) p-8 neo-border neo-shadow"
      >
        <div className="text-center mb-2">
          <h2 className="text-3xl font-black font-mono uppercase tracking-tighter text-foreground">
            Acceso<span className="text-(--accent-color)">_</span>Admin
          </h2>
          <p className="text-(--text-secondary) text-xs font-mono mt-1">
            Identifícate para explorar
          </p>
        </div>

        {error && (
          <div className="bg-red-500 text-white p-3 font-bold neo-border text-xs font-mono uppercase text-center animate-pulse">
            {error}
          </div>
        )}

        <div className="flex flex-col gap-2">
          <label className="font-bold text-sm uppercase tracking-wide text-foreground">
            Usuario
          </label>
          <input
            type="text"
            required
            autoComplete="username"
            className="bg-background text-foreground neo-border p-3 focus:outline-none focus:neo-shadow-accent transition-all font-mono"
            value={formData.username}
            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="font-bold text-sm uppercase tracking-wide text-foreground">
            Contraseña
          </label>
          <input
            type="password"
            required
            autoComplete="current-password"
            className="bg-background text-foreground neo-border p-3 focus:outline-none focus:neo-shadow-accent transition-all font-mono"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          />
        </div>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          isLoading={isLoading}
          className="mt-2 w-full"
        >
          {isLoading ? "Validando..." : "Entrar al Sistema"}
        </Button>
      </form>
    </div>
  );
}
