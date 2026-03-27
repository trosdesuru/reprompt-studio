"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/src/store/authStore";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();

  // Ocultamos la navegación si estamos en la pantalla de Login
  if (pathname === "/login") {
    return <>{children}</>;
  }

  // Enlaces de navegación dinámicos según el rol
  const navLinks = [
    { name: "Explorar", path: "/", icon: "🔍" },
    { name: "Descargas", path: "/downloads", icon: "📥" }, // Futura ruta
    ...(user?.role === "admin" ? [{ name: "Terminal", path: "/admin", icon: "⚙️" }] : []),
  ];

  return (
    <div className="min-h-screen flex flex-col bg-var(--bg-primary)">
      {/* 🖥️ NAVBAR DESKTOP (Oculto en móviles) */}
      <header className="hidden md:flex sticky top-0 z-40 bg-var(--bg-secondary) border-b-[3px] border-var(--border-color) px-8 py-4 items-center justify-between">
        <div className="flex items-center gap-8">
          <Link
            href="/"
            className="text-2xl font-black font-mono tracking-tighter uppercase flex items-center gap-2 group"
          >
            <span className="bg-var(--foreground) text-var(--bg-secondary) px-2 py-1 transform group-hover:-rotate-3 transition-transform">
              EH
            </span>
            Explorer
          </Link>

          <nav className="flex gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                href={link.path}
                className={`px-4 py-2 font-bold font-mono text-sm uppercase transition-colors ${
                  pathname === link.path
                    ? "bg-var(--accent-color) text-white neo-border"
                    : "hover:bg-gray-100 text-var(--text-secondary)"
                }`}
              >
                {link.icon} {link.name}
              </Link>
            ))}
          </nav>
        </div>

        {user && (
          <div className="flex items-center gap-4">
            <span className="font-mono text-sm font-bold opacity-70">@{user.username}</span>
            <button
              onClick={logout}
              className="px-4 py-2 bg-black text-white font-bold font-mono text-xs neo-border neo-shadow uppercase"
            >
              Salir ✖
            </button>
          </div>
        )}
      </header>

      {/* 📦 CONTENIDO PRINCIPAL (Con padding inferior en móviles para que no lo tape el menú) */}
      <main className="flex-1 pb-20 md:pb-8 w-full">{children}</main>

      {/* 📱 BOTTOM NAVIGATION BAR (Oculto en escritorio) */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full z-40 bg-var(--bg-secondary) border-t-[3px] border-var(--border-color) flex justify-around items-center h-16 safe-area-pb">
        {navLinks.map((link) => {
          const isActive = pathname === link.path;
          return (
            <Link
              key={link.path}
              href={link.path}
              className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${
                isActive ? "text-var(--accent-color)" : "text-var(--text-secondary)"
              }`}
            >
              <span
                className={`text-xl transition-transform ${isActive ? "scale-125 origin-bottom" : ""}`}
              >
                {link.icon}
              </span>
              <span
                className={`text-[10px] font-black uppercase tracking-wider ${isActive ? "opacity-100" : "opacity-0 h-0 overflow-hidden"}`}
              >
                {link.name}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
