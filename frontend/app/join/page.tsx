// frontend/app/join/page.tsx
"use client";

import RegisterForm from "@/features/auth/components/RegisterForm";
import Link from "next/link";

export default function JoinPage() {
  return (
    <main className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-4">
      <Link
        href="/"
        className="absolute top-8 left-8 text-sm font-bold font-mono hover:text-(--accent-color) transition-colors uppercase"
      >
        ← Volver al Buscador
      </Link>

      <RegisterForm />
    </main>
  );
}
