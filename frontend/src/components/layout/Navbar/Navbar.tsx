"use client";

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

      {/* 2. Área de Controles de Usuario */}
      <div className="flex gap-3 items-center">
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
