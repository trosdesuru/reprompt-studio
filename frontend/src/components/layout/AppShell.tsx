// frontend/src/components/layout/AppShell.tsx
"use client";

import { usePathname } from "next/navigation";
import { Navbar } from "./Navbar"; // 🟢 Usamos tu Navbar original

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Ocultamos la navegación en login/join como ya hace el Navbar
  const isAuthPage = pathname === "/login" || pathname === "/join";

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      {!isAuthPage && <Navbar />}

      <main className="flex-1 w-full">{children}</main>

      {/* El Navbar ya es responsivo y tiene toda tu lógica previa */}
    </div>
  );
}
