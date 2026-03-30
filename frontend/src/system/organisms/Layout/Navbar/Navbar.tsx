"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { NavbarSearch } from "./NavbarSearch";
import { useAuthStore } from "@/src/store/authStore";
import { useTheme } from "@/src/utils/hooks/useTheme";
import {
  IconLogout,
  IconMoon,
  IconSun,
  IconMenu2,
  IconX,
  IconTerminal2,
  IconFolder,
  IconBell,
  IconUser,
} from "@tabler/icons-react";

export function Navbar() {
  const { user, logout } = useAuthStore();
  const { isDark, toggleTheme } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 w-full bg-background/80 backdrop-blur-md border-b border-border transition-colors duration-300">
      <div className="flex items-center justify-between h-16 px-4 md:px-8 lg:px-12 max-w-1600px mx-auto gap-4 md:gap-8">
        {/* =========================================
            1. ZONA IZQUIERDA: Logo
            ========================================= */}
        <div className="shrink-0">
          <Link
            href="/"
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            aria-label="Ir al inicio"
          >
            <Image
              src="/logo-brand.svg"
              alt="Reprompt Logo"
              width={150}
              height={40}
              priority
              className="w-120px md:w-150px h-auto object-contain"
            />
          </Link>
        </div>

        {/* =========================================
            2. ZONA CENTRO: Buscador
            Solo visible en Desktop (md y superior)
            ========================================= */}
        <div className="hidden md:flex flex-1 max-w-2xl px-4 lg:px-8">
          <NavbarSearch />
        </div>

        {/* =========================================
            3. ZONA DERECHA: Botones Desktop
            ========================================= */}
        <div className="hidden md:flex items-center gap-2 shrink-0">
          {user ? (
            <>
              {/* Lector Reprompt */}
              <Link
                href="/extractor"
                className="p-2 text-foreground/70 hover:text-foreground hover:bg-muted rounded-md transition-colors"
                title="Lector Reprompt"
                aria-label="Lector Reprompt"
              >
                <IconTerminal2 size={20} stroke={1.5} />
              </Link>
              {/* Colecciones */}
              <Link
                href="/studio"
                className="p-2 text-foreground/70 hover:text-foreground hover:bg-muted rounded-md transition-colors"
                title="Mis Colecciones"
                aria-label="Mis Colecciones"
              >
                <IconFolder size={20} stroke={1.5} />
              </Link>
              {/* Notificaciones */}
              <button
                className="p-2 text-foreground/70 hover:text-foreground hover:bg-muted rounded-md transition-colors relative"
                title="Notificaciones"
                aria-label="Notificaciones"
              >
                <IconBell size={20} stroke={1.5} />
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              <div className="w-px h-6 bg-border mx-2"></div> {/* Separador sutil */}
              {/* Menú de Usuario (Botón simple por ahora, luego será Dropdown) */}
              <button className="flex items-center gap-2 p-1.5 pl-3 hover:bg-muted rounded-full transition-colors border border-border">
                <span className="text-sm font-medium hidden lg:block">{user.username}</span>
                <div className="w-7 h-7 bg-foreground text-background rounded-full flex items-center justify-center">
                  <IconUser size={16} />
                </div>
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="text-sm font-medium px-4 py-2 bg-foreground text-background rounded-lg hover:opacity-90 transition-opacity"
            >
              Iniciar Sesión
            </Link>
          )}

          {/* Toggle Tema Desktop */}
          <button
            onClick={toggleTheme}
            className="p-2 ml-2 text-foreground/70 hover:text-foreground hover:bg-muted rounded-md transition-colors"
            aria-label="Cambiar tema"
          >
            {isDark ? <IconSun size={20} stroke={1.5} /> : <IconMoon size={20} stroke={1.5} />}
          </button>
        </div>

        {/* =========================================
            4. MENÚ HAMBURGUESA (Móvil)
            ========================================= */}
        <div className="flex md:hidden items-center gap-2">
          {!user && (
            <Link
              href="/login"
              className="text-sm font-medium px-3 py-1.5 bg-foreground text-background rounded-md"
            >
              Entrar
            </Link>
          )}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 text-foreground hover:bg-muted rounded-md transition-colors"
            aria-label="Abrir menú"
          >
            {isMobileMenuOpen ? <IconX size={24} /> : <IconMenu2 size={24} />}
          </button>
        </div>
      </div>

      {/* =========================================
          5. DESPLEGABLE MÓVIL (Burger Menu)
          ========================================= */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-16 left-0 w-full bg-background border-b border-border shadow-lg p-4 flex flex-col gap-4 animate-in slide-in-from-top-2">
          {/* Buscador móvil */}
          <div className="w-full mb-2">
            <NavbarSearch />
          </div>

          {user && (
            <div className="flex flex-col gap-2 border-t border-border pt-4 mt-2">
              <div className="flex items-center gap-3 px-2 pb-2">
                <div className="w-8 h-8 bg-foreground text-background rounded-full flex items-center justify-center">
                  <IconUser size={16} />
                </div>
                <span className="font-medium">{user.username}</span>
              </div>
              <Link
                href="/extractor"
                className="flex items-center gap-3 p-3 rounded-md hover:bg-muted text-sm"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <IconTerminal2 size={20} stroke={1.5} /> Lector Reprompt
              </Link>
              <Link
                href="/studio"
                className="flex items-center gap-3 p-3 rounded-md hover:bg-muted text-sm"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <IconFolder size={20} stroke={1.5} /> Mis Colecciones
              </Link>
              <button className="flex items-center gap-3 p-3 rounded-md hover:bg-muted text-sm text-left w-full">
                <IconBell size={20} stroke={1.5} /> Notificaciones
              </button>

              <div className="h-px bg-border my-2"></div>

              <button
                onClick={toggleTheme}
                className="flex items-center gap-3 p-3 rounded-md hover:bg-muted text-sm w-full text-left"
              >
                {isDark ? <IconSun size={20} stroke={1.5} /> : <IconMoon size={20} stroke={1.5} />}
                {isDark ? "Modo Claro" : "Modo Oscuro"}
              </button>

              <button
                onClick={() => {
                  logout();
                  setIsMobileMenuOpen(false);
                }}
                className="flex items-center gap-3 p-3 rounded-md hover:bg-destructive/10 text-destructive text-sm text-left w-full"
              >
                <IconLogout size={20} stroke={1.5} /> Cerrar Sesión
              </button>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
