"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/src/store/authStore";
import { useTheme } from "@/src/utils/hooks/useTheme";
import { useClickOutside } from "@/src/utils/hooks/useClickOutside";
import { ChangePasswordModal } from "@/src/system/organisms/Auth/ChangePasswordModal";

import {
  IconMenu2,
  IconX,
  IconSun,
  IconMoon,
  IconLogout,
  IconDashboard,
  IconKey,
  IconUserPlus,
} from "@tabler/icons-react";

export function UserDropdown() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const { isDark, toggleTheme } = useTheme();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showPwdModal, setShowPwdModal] = useState(false);

  const menuRef = useRef<HTMLDivElement>(null);

  useClickOutside(menuRef, () => setIsMenuOpen(false));

  if (!user) return null;

  const menuItems = [];

  if (user.role === "admin") {
    menuItems.push(
      {
        label: "Panel de Control",
        icon: <IconDashboard size={18} />,
        action: () => {
          router.push("/admin");
          setIsMenuOpen(false);
        },
      },
      {
        label: "Gestionar Accesos",
        icon: <IconUserPlus size={18} />,
        action: () => {
          router.push("/admin");
          setIsMenuOpen(false);
        },
      },
    );
  }

  menuItems.push({
    label: "Cambiar Clave",
    icon: <IconKey size={18} />,
    action: () => {
      setShowPwdModal(true);
      setIsMenuOpen(false);
    },
  });

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        className={`p-2 neo-border transition-all flex items-center gap-2 ${
          isMenuOpen
            ? "bg-(--accent-color) text-white neo-shadow-accent -translate-y-1"
            : "bg-background text-foreground hover:neo-shadow hover:-translate-y-0.5"
        }`}
        aria-label="Menú de usuario"
      >
        {isMenuOpen ? <IconX size={24} /> : <IconMenu2 size={24} />}
      </button>

      {isMenuOpen && (
        <div className="absolute right-0 mt-3 w-64 bg-(--bg-secondary) neo-border neo-shadow flex flex-col z-50 animate-fade-in origin-top-right">
          <div className="p-4 border-b-2 border-(--border-color) bg-background">
            <p className="text-sm font-bold text-foreground truncate">@{user.username}</p>
            <p className="text-xs font-mono text-(--accent-color) uppercase tracking-widest mt-1">
              {user.role}
            </p>
          </div>

          <div className="flex flex-col p-2 gap-1">
            {menuItems.map((item, index) => (
              <button
                key={index}
                onClick={item.action}
                className="flex items-center gap-3 p-3 text-sm font-bold text-foreground hover:bg-background neo-border border-transparent hover:border-(--border-color) transition-all text-left uppercase tracking-wide"
              >
                {item.icon}
                {item.label}
              </button>
            ))}
          </div>

          <div className="border-t-2 border-(--border-color) p-2 flex flex-col gap-1 bg-background">
            <button
              onClick={toggleTheme}
              className="flex items-center gap-3 p-3 text-sm font-bold text-foreground hover:bg-(--bg-secondary) neo-border border-transparent hover:border-(--border-color) transition-all text-left uppercase tracking-wide"
            >
              {isDark ? (
                <IconSun size={18} className="text-yellow-500" />
              ) : (
                <IconMoon size={18} className="text-blue-500" />
              )}
              {isDark ? "Modo Claro" : "Modo Oscuro"}
            </button>

            <button
              onClick={logout}
              className="flex items-center gap-3 p-3 text-sm font-black text-red-500 hover:bg-red-500/10 neo-border border-transparent hover:border-red-500/50 transition-all text-left uppercase tracking-wide"
            >
              <IconLogout size={18} />
              Cerrar Sesión
            </button>
          </div>
        </div>
      )}

      {showPwdModal && <ChangePasswordModal onClose={() => setShowPwdModal(false)} />}
    </div>
  );
}
