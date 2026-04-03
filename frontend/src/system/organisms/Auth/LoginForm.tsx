"use client";

import { useLoginForm } from "@/src/features/auth/hooks/useLoginForm";

import { FormField } from "@/src/system/molecules/FormField";
import { Button } from "@/src/system/atoms/Button";
import { GoogleAuthButton } from "@/src/features/auth/GoogleAuthButton";
import { FormDivider } from "../../atoms/Login/FormDivider";
import { FormHeader } from "../../atoms/Login/FormHeader";

export function LoginForm() {
  const { formData, isLoading, handleChange, handleSubmit } = useLoginForm();

  return (
    <div className="w-full max-w-md mx-auto p-8 bg-(--bg-secondary) neo-border neo-shadow">
      <FormHeader />

      <div className="mt-6">
        <GoogleAuthButton />
      </div>

      <FormDivider />

      <form onSubmit={handleSubmit} className="space-y-6">
        <FormField
          label="Usuario"
          name="username"
          type="text"
          value={formData.username}
          onChange={handleChange}
          placeholder="Tu alias..."
          autoComplete="username"
          required
        />

        <FormField
          label="Contraseña"
          name="password"
          type="password"
          value={formData.password}
          onChange={handleChange}
          autoComplete="current-password"
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
    </div>
  );
}
