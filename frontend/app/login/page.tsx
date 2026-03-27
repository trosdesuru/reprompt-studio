// frontend/app/login/page.tsx
import LoginForm from "@/features/auth/components/LoginForm";
import Link from "next/link";

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      {/* Botón para volver al inicio */}
      <Link
        href="/"
        className="fixed top-8 left-8 text-sm font-bold font-mono text-(--text-secondary)r:text-[var(--accent-color)] transition-colors uppercase"
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
