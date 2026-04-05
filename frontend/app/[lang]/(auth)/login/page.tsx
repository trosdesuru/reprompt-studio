"use client";

import Link from "next/link";
import { LoginForm } from "@/src/system/organisms/Auth/LoginForm";
import { useRedirectIfAuthenticated } from "@/src/features/auth/hooks/useRedirectIfAuthenticated";
import { PageLoader } from "@/src/system/atoms/PageLoader";

export default function LoginPage() {
  const { isChecking, isAuthenticated } = useRedirectIfAuthenticated("/");

  if (isChecking || isAuthenticated) {
    return (
      <main className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <PageLoader text = "Sincronizando acceso" />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <LoginForm />

      <p className="mt-8 text-center text-sm font-mono text-(--text-secondary)">
        ¿No tienes cuenta?{" "}
        <Link
          href="/join"
          className="text-(--accent-color) font-black hover:underline underline-offset-4"
        >
          Registrarte aquí
        </Link>
      </p>
    </main>
  );
}
