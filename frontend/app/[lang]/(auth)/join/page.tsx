"use client";

import { use } from "react";
import Link from "next/link";
import { RegisterForm } from "@/src/features/auth/components/RegisterForm";
import { useRedirectIfAuthenticated } from "@/src/features/auth/hooks/useRedirectIfAuthenticated";

export default function JoinPage(props: Readonly<{ params: Promise<{ lang: string }> }>) {
  const params = use(props.params);
  const lang = params.lang;

  const { isChecking, isAuthenticated } = useRedirectIfAuthenticated(`/${lang}`);

  if (isChecking || isAuthenticated) {
    return (
      <main className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <span className="animate-pulse text-(--accent-color) font-mono font-bold uppercase tracking-widest text-sm">
          Comprobando credenciales...
        </span>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <RegisterForm lang={lang} />

      <p className="mt-8 text-center text-sm font-mono text-(--text-secondary)">
        ¿Ya tienes cuenta?{" "}
        <Link
          href={`/${lang}/login`}
          className="text-(--accent-color) font-black hover:underline underline-offset-4"
        >
          Iniciar sesión
        </Link>
      </p>
    </main>
  );
}
