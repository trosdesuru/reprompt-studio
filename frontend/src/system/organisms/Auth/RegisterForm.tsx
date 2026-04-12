"use client";

import { useState } from "react";
import { useRegister } from "@/src/features/auth/hooks/useRegister";

import { FormField } from "@/src/system/molecules/FormField";
import { Button } from "@/src/system/atoms/Button";
import { FormHeader } from "../../atoms/Login/FormHeader";

interface RegisterFormProps {
  lang: string;
}

export function RegisterForm({ lang }: RegisterFormProps) {
  // 🟢 Lógica inyectada sin alterar
  const { handleRegister, isLoading, error } = useRegister(lang);

  const [formData, setFormData] = useState({
    username: "",
    password: "",
    invite_code: "",
  });

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleRegister(formData);
  };

  return (
    <div className="w-full max-w-md mx-auto p-8 bg-(--bg-secondary) neo-border neo-shadow">
      <div className="animate-in fade-in zoom-in-95 duration-300">
        
        {/* Cabecera idéntica al Login */}
        <FormHeader />

        {error && (
          <div className="bg-red-500 text-white p-3 mb-6 font-bold neo-border text-xs font-mono uppercase text-center animate-in slide-in-from-top-2">
            {error}
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-6">
          
          <FormField
            label="email"
            name="username"
            type="text"
            value={formData.username}
            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            placeholder="reprompt@mail.com"
            autoComplete="username"
            required
          />

          <FormField
            label="Password"
            name="password"
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            autoComplete="new-password"
            placeholder="••••••••"
            required
          />

          <FormField
            label="Código de invitación"
            name="invite_code"
            type="text"
            value={formData.invite_code}
            onChange={(e) => setFormData({ ...formData, invite_code: e.target.value.toUpperCase() })}
            placeholder="ej. TROYA-A1234B56"
            className="uppercase"
            required
          />

          <Button
            type="submit"
            isLoading={isLoading}
            className="w-full justify-center h-12 text-sm font-black uppercase tracking-widest"
          >
            {isLoading ? "Verificando..." : "Confirmar Acceso"}
          </Button>
        </form>
      </div>
    </div>
  );
}