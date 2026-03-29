"use client";

import Link from "next/link";
import RegisterForm from "@/src/system/organisms/Auth/RegisterForm";

export default function JoinPage() {
  return (
    <main className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-4">
      <Link
        href="/"
        className="absolute top-8 left-8 text-sm font-bold font-mono hover:text-(--accent-color) uppercase"
      >
        ← Volver
      </Link>
      <RegisterForm />
    </main>
  );
}
