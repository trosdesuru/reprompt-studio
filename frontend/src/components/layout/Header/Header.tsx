// frontend/src/components/layout/Header/Header.tsx
"use client";

import Link from "next/link";
import { useAuthStore } from "@/src/store/authStore";
import { Button } from "@/src/components/ui/Button";

export function Header({ variant = "default", title, onCloseViewer }: any) {
  const { user, logout } = useAuthStore();

  // Si estamos en modo Visor, mostramos el Header minimalista
  if (variant === "viewer") {
    return (
      <header className="flex justify-between items-center p-4 bg-(--bg-secondary) border-b-2 border-(--border-color) z-50">
        <h2 className="text-xl font-black font-mono truncate uppercase tracking-tighter">
          <span className="text-(--accent-color)">👀</span> {title}
        </h2>
        <Button onClick={onCloseViewer} variant="danger" size="sm">
          Cerrar ✖
        </Button>
      </header>
    );
  }

  // Header Global de la Aplicación
  return (
    <header className="w-full bg-(--bg-secondary) border-b-4 border-(--border-color) px-6 py-4 flex items-center justify-between z-40">
      <div className="flex items-center gap-6">
        <Link href="/" className="text-2xl font-black font-mono tracking-tighter uppercase">
          EH<span className="text-(--accent-color)">-</span>EXPLORER
        </Link>

        {/* Navegación por Roles */}
        <nav className="hidden md:flex gap-4">
          <Link href="/" className="font-bold hover:text-(--accent-color)">
            Explorar
          </Link>
          {user?.role === "admin" && (
            <Link href="/admin" className="text-red-600 font-black underline">
              ADMIN
            </Link>
          )}
          {user?.role === "artist" && (
            <Link href="/studio" className="text-purple-600 font-bold">
              Studio
            </Link>
          )}
          {user?.role === "voyager" && (
            <Link href="/galaxy" className="text-blue-600 font-bold">
              Galaxy
            </Link>
          )}
        </nav>
      </div>

      <div className="flex items-center gap-4">
        <div className="text-right hidden sm:block">
          <p className="text-xs font-black uppercase leading-none">{user?.username}</p>
          <p className="text-[10px] font-mono opacity-50 uppercase tracking-widest">{user?.role}</p>
        </div>
        <Button onClick={logout} variant="secondary" size="sm">
          Salir
        </Button>
      </div>
    </header>
  );
}
