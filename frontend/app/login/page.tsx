"use client";

import LoginForm from "@/features/auth/components/LoginForm";
import Link from "next/link";
import { useRedirectIfAuthenticated } from "@/features/auth/components/hooks/useRedirectIfAuthenticated";

export default function LoginPage() {
  const { isChecking, isAuthenticated } = useRedirectIfAuthenticated("/");

  if (isChecking || isAuthenticated) {
    return (
      <main className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <span className="animate-pulse text-(--accent-color) font-mono font-bold uppercase tracking-widest text-sm">
          Sincronizando acceso...
        </span>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <Link
        href="/"
        className="fixed top-8 left-8 text-sm font-bold font-mono text-(--text-secondary) hover:text-(--accent-color) transition-colors uppercase"
      >
        ← Volver
      </Link>

      <LoginForm />

      <p className="mt-8 text-center text-sm font-mono text-(--text-secondary)">
        ¿No tienes acceso?{" "}
        <Link
          href="/join"
          className="text-(--accent-color) font-black hover:underline underline-offset-4"
        >
          REGISTRARSE AQUÍ
        </Link>
      </p>
    </main>
  );
}
