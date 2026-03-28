// frontend/src/components/layout/Navbar/Navbar.tsx
"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { api } from "@/src/services/api";
import { Button } from "@/src/components/ui/Button";
import { useAuthStore } from "@/src/store/authStore";
import Link from "next/link";

export function Navbar() {
  const pathname = usePathname();
  const [isDark, setIsDark] = useState(false);
  const [showPwdModal, setShowPwdModal] = useState(false);
  const [pwdData, setPwdData] = useState({ old_password: "", new_password: "" });

  // 🟢 Desestructuramos checkAuth para invocarlo directamente
  const { user, isLoadingAuth, checkAuth } = useAuthStore();

  useEffect(() => {
    // Forzamos la carga del usuario nada más entrar
    checkAuth();

    const theme = localStorage.getItem("theme");
    if (theme === "dark" || (!theme && window.matchMedia("(prefers-color-scheme: dark)").matches)) {
      setIsDark(true);
      document.documentElement.classList.add("dark");
    }
  }, [checkAuth]);

  const toggleTheme = () => {
    const nextDark = !isDark;
    setIsDark(nextDark);
    if (nextDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.cambiarPassword(pwdData);
      alert("✅ Contraseña actualizada");
      setShowPwdModal(false);
    } catch (err: any) {
      alert(`❌ Error: ${err.message}`);
    }
  };

  if (pathname === "/login" || pathname === "/join") return null;

  return (
    <>
      <nav className="bg-(--bg-secondary) border-b-4 border-(--border-color) px-6 py-4 flex justify-between items-center z-50 sticky top-0">
        <Link
          href="/"
          className="font-mono font-black text-xl text-foreground hover:opacity-80 transition-opacity"
        >
          EH<span className="text-(--accent-color)">_</span>Admin
        </Link>

        <div className="flex gap-4 items-center">
          {/* 🟢 Bloque de Usuario y Dashboard corregido */}
          {!isLoadingAuth && user ? (
            <>
              <div className="flex flex-col text-right mr-2 md:mr-4 border-r-2 border-(--border-color) pr-2 md:pr-4">
                <span className="text-sm font-bold text-foreground">@{user.username}</span>
                <span className="text-xs font-mono text-(--accent-color) uppercase tracking-widest">
                  {user.role}
                </span>
              </div>

              {/* Botón de Admin */}
              {user.role === "admin" && (
                <Button variant="ghost" size="sm" onClick={() => (window.location.href = "/admin")}>
                  🛡️ Panel
                </Button>
              )}
            </>
          ) : isLoadingAuth ? (
            <div className="h-8 w-24 bg-gray-200 animate-pulse neo-border"></div>
          ) : null}

          <button onClick={toggleTheme} className="text-2xl hover:scale-110 transition-transform">
            {isDark ? "☀️" : "🌙"}
          </button>

          <Button variant="secondary" size="sm" onClick={() => setShowPwdModal(true)}>
            🔑
          </Button>
          <Button variant="danger" size="sm" onClick={api.logout}>
            Salir
          </Button>
        </div>
      </nav>

      {/* Modal Cambio de Contraseña */}
      {showPwdModal && (
        <div className="fixed inset-0 bg-black/80 z-100 flex items-center justify-center p-4 backdrop-blur-sm">
          <form
            onSubmit={handlePasswordChange}
            className="bg-(--bg-secondary) p-8 neo-border neo-shadow flex flex-col gap-4 max-w-sm w-full"
          >
            <h3 className="text-xl font-bold font-mono text-foreground uppercase">Cambiar Clave</h3>
            <input
              type="password"
              placeholder="Clave Actual"
              required
              className="neo-border p-2 bg-background text-foreground font-mono focus:outline-none"
              value={pwdData.old_password}
              onChange={(e) => setPwdData({ ...pwdData, old_password: e.target.value })}
            />
            <input
              type="password"
              placeholder="Nueva Clave"
              required
              className="neo-border p-2 bg-background text-foreground font-mono focus:outline-none"
              value={pwdData.new_password}
              onChange={(e) => setPwdData({ ...pwdData, new_password: e.target.value })}
            />
            <div className="flex gap-2 mt-4">
              <Button
                type="button"
                variant="ghost"
                className="flex-1"
                onClick={() => setShowPwdModal(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" variant="primary" className="flex-1">
                Guardar
              </Button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
