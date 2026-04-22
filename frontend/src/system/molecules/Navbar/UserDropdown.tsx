"use client";

import { useState, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/src/store/authStore";
import { useClickOutside } from "@/src/utils/hooks/useClickOutside";

import { MenuItem } from "../../atoms/Menu/MenuItem";
import { LogoutMenuItem } from "@/src/features/auth/components/LogoutMenuItem";

import { IconMenu2, IconX, IconSettings, IconDashboard } from "@tabler/icons-react";

export function UserDropdown() {
  const router = useRouter();
  const pathname = usePathname();
  const user = useAuthStore((state) => state.user);

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useClickOutside(menuRef, () => setIsMenuOpen(false));

  if (!user) return null;

  const lang = pathname?.split("/")[1] || "es";

  const navigate = (path: string) => {
    router.push(path);
    setIsMenuOpen(false);
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        className={`p-2 neo-border transition-all flex items-center gap-2 ${
          isMenuOpen
            ? "bg-(--accent-color) text-white neo-shadow-accent -translate-y-1"
            : "bg-background text-foreground hover:neo-shadow hover:-translate-y-0.5"
        }`}
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
            <MenuItem
              icon={<IconSettings size={18} />}
              label="Configuración"
              onClick={() => navigate(`/${lang}/${user.username}/settings/profile`)}
            />

            {user.role === "admin" && (
              <MenuItem
                icon={<IconDashboard size={18} />}
                label="Panel Admin"
                onClick={() => navigate(`/${lang}/admin`)}
              />
            )}
          </div>

          <div className="p-2 bg-background border-t-2 border-(--border-color)">
            <LogoutMenuItem />
          </div>
        </div>
      )}
    </div>
  );
}
