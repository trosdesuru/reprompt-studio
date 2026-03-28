"use client";

import { IconWand } from "@tabler/icons-react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Button } from "@/src/components/ui/Button";
import { useAuthStore } from "@/src/store/authStore";
import { UserDropdown } from "./UserDropdown";

export function Navbar() {
  const pathname = usePathname();
  const { user, isLoadingAuth } = useAuthStore();

  // No mostramos Navbar en pantallas de acceso
  if (pathname === "/login" || pathname === "/join") return null;

  return (
    <nav className="bg-(--bg-secondary) border-b-4 border-(--border-color) px-6 py-4 flex justify-between items-center z-40 sticky top-0 transition-colors">
      {/* 1. Logo de la plataforma */}
      <Link
        href="/"
        className="font-mono font-black text-xl text-foreground hover:text-(--accent-color) transition-colors tracking-tighter"
      >
        EH<span className="text-(--accent-color)">-</span>EXPLORER
      </Link>

      {/* 2. Área Derecha: Herramientas y Usuario */}
      <div className="flex gap-4 items-center">
        {/* 🟢 NUEVO: Botón directo a Reprompt (Solo visible si estás logueado) */}
        {user && (
          <Link href="/reprompt" className="hidden sm:block">
            <button className="flex items-center gap-2 px-4 py-2 bg-background hover:bg-(--accent-color) hover:text-white text-foreground font-mono font-bold text-sm uppercase tracking-wide neo-border transition-all hover:-translate-y-0.5 hover:neo-shadow-accent">
              <IconWand size={18} />
              Reprompt Studio
            </button>
          </Link>
        )}

        {/* Menú de Usuario Original */}
        {isLoadingAuth ? (
          <div className="h-10 w-10 bg-gray-200 dark:bg-gray-800 animate-pulse rounded neo-border"></div>
        ) : user ? (
          <UserDropdown />
        ) : (
          <Button variant="primary" size="sm" onClick={() => (window.location.href = "/login")}>
            Entrar
          </Button>
        )}
      </div>
    </nav>
  );
}
