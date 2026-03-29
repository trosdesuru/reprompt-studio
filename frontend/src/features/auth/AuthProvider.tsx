// frontend/src/components/AuthProvider.tsx
"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/src/store/authStore";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Sacamos la función que verifica la sesión al entrar a la web
  const { checkAuth } = useAuthStore();

  useEffect(() => {
    // Cuando el usuario abre la web, verificamos sus tokens en silencio
    if (checkAuth) {
      checkAuth();
    }
  }, [checkAuth]);

  return <>{children}</>;
}
