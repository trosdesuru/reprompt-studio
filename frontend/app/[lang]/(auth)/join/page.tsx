"use client";

import { use } from "react"; // 🟢 Importamos el nuevo hook de React
import Link from "next/link";
import { RegisterForm } from "@/src/system/organisms/Auth/RegisterForm";
import { useRedirectIfAuthenticated } from "@/src/features/auth/hooks/useRedirectIfAuthenticated";

// 🟢 Cambiamos el tipo para decirle a TypeScript que params es una Promesa
export default function JoinPage(props: { params: Promise<{ lang: string }> }) {
  // 🟢 Desempaquetamos la promesa con React.use()
  const params = use(props.params);
  const lang = params.lang;

  // Ahora 'lang' ya es un string seguro (ej: "es" o "en")
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
