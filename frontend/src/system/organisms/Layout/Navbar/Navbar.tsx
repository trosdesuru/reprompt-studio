"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { NavbarSearch } from "./NavbarSearch";
import { NotificationDropdown } from "./NotificationDropdown";
import { UserDropdown } from "./UserDropdown";
import { useAuthStore } from "@/src/store/authStore";
import { IconWand, IconArchive, IconMenu2, IconX } from "@tabler/icons-react";

export function Navbar() {
  const { user } = useAuthStore();
  // 🟢 CORRECCIÓN: Restaurado el estado del menú móvil
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 w-full bg-background/80 backdrop-blur-md border-b border-border transition-colors">
      <div className="flex items-center justify-between h-16 px-4 md:px-8 gap-4 max-w-1600px mx-auto">
        {/* 1. LOGO */}
        <Link href="/" className="shrink-0">
          <Image src="/logo-brand.svg" alt="Logo" width={140} height={35} priority />
        </Link>

        {/* 2. BUSCADOR (Solo Desktop) */}
        <div className="hidden md:flex flex-1 max-w-2xl">
          <NavbarSearch />
        </div>

        {/* 3. ACCIONES DERECHA */}
        <div className="flex items-center gap-2 md:gap-4">
          {user ? (
            <>
              {/* Botones exclusivos de Desktop */}
              <div className="hidden md:flex items-center gap-2">
                <Link
                  href="/reprompt"
                  className="flex items-center gap-2 px-4 py-2 bg-foreground text-background rounded-lg text-sm font-bold hover:opacity-90 transition-opacity"
                >
                  <IconWand size={18} /> Reprompt Studio
                </Link>
                <Link
                  href="/studio"
                  className="p-2 text-muted-foreground hover:text-foreground transition-colors"
                  title="Mi Estudio"
                >
                  <IconArchive size={22} />
                </Link>
              </div>

              {/* Siempre visibles (Notificaciones y Menú Usuario) */}
              <NotificationDropdown />
              <UserDropdown />

              {/* Toggle Menú Móvil */}
              <button
                className="md:hidden p-2 text-foreground hover:bg-muted rounded-md transition-colors"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-label="Abrir menú"
              >
                {isMobileMenuOpen ? <IconX size={24} /> : <IconMenu2 size={24} />}
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="text-sm font-bold px-4 py-2 bg-foreground text-background rounded-lg hover:opacity-90"
            >
              Entrar
            </Link>
          )}
        </div>
      </div>

      {/* 4. MENÚ HAMBURGUESA (Móvil) */}
      {isMobileMenuOpen && user && (
        <div className="md:hidden absolute top-16 left-0 w-full bg-background border-b border-border shadow-2xl p-4 flex flex-col gap-4 animate-in slide-in-from-top-2 z-50">
          {/* El buscador inyectado en la vista móvil */}
          <NavbarSearch />

          <div className="flex flex-col gap-2 pt-2 border-t border-border/50">
            <Link
              href="/reprompt"
              className="flex items-center gap-3 p-3 rounded-md hover:bg-muted font-bold text-sm text-foreground transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <IconWand size={20} /> Reprompt Studio
            </Link>
            <Link
              href="/studio"
              className="flex items-center gap-3 p-3 rounded-md hover:bg-muted font-bold text-sm text-foreground transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <IconArchive size={20} /> Mi Estudio
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
