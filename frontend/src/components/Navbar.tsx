// frontend/src/components/Navbar.tsx
"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { api } from "@/src/services/api";
import { Button } from "@/src/components/ui/Button";

export default function Navbar() {
  const pathname = usePathname();
  const [isDark, setIsDark] = useState(false);
  const [showPwdModal, setShowPwdModal] = useState(false);
  const [pwdData, setPwdData] = useState({ old_password: "", new_password: "" });

  // Ocultar Navbar en Login/Join
  if (pathname === "/login" || pathname === "/join") return null;

  // Lógica del Tema
  useEffect(() => {
    const theme = localStorage.getItem("theme");
    if (theme === "dark" || (!theme && window.matchMedia("(prefers-color-scheme: dark)").matches)) {
      setIsDark(true);
      document.documentElement.classList.add("dark");
    }
  }, []);

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

  return (
    <>
      <nav className="bg-(--bg-secondary) border-b-4 border-(--border-color) px-6 py-4 flex justify-between items-center z-50 sticky top-0">
        <div className="font-mono font-black text-xl text-foreground">
          EH<span className="text-(--accent-color)">_</span>Admin
        </div>
        
        <div className="flex gap-4 items-center">
          <button onClick={toggleTheme} className="text-2xl hover:scale-110 transition-transform">
            {isDark ? "☀️" : "🌙"}
          </button>
          
          <Button variant="secondary" size="sm" onClick={() => setShowPwdModal(true)}>
            🔑 Clave
          </Button>
          
          <Button variant="danger" size="sm" onClick={api.logout}>
            Salir
          </Button>
        </div>
      </nav>

      {/* Modal de Contraseña Simple */}
      {showPwdModal && (
        <div className="fixed inset-0 bg-black/80 z-100 flex items-center justify-center p-4">
          <form onSubmit={handlePasswordChange} className="bg-(--bg-secondary) p-8 neo-border neo-shadow flex flex-col gap-4 max-w-sm w-full">
            <h3 className="text-xl font-bold font-mono text-foreground uppercase">Cambiar Clave</h3>
            <input type="password" placeholder="Clave Actual" required className="neo-border p-2 bg-background text-foreground font-mono" value={pwdData.old_password} onChange={e => setPwdData({...pwdData, old_password: e.target.value})} />
            <input type="password" placeholder="Nueva Clave" required className="neo-border p-2 bg-background text-foreground font-mono" value={pwdData.new_password} onChange={e => setPwdData({...pwdData, new_password: e.target.value})} />
            <div className="flex gap-2 mt-4">
              <Button type="button" variant="ghost" className="flex-1" onClick={() => setShowPwdModal(false)}>Cancelar</Button>
              <Button type="submit" variant="primary" className="flex-1">Guardar</Button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}