"use client";

import { useState, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/src/store/authStore";
import { useClickOutside } from "@/src/utils/hooks/useClickOutside";
import { MenuItem } from "@/src/system/atoms/Dropdown/MenuItem";
import { IconMenu2, IconX, IconSettings, IconDashboard, IconLogout } from "@tabler/icons-react";

export function UserDropdown() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useClickOutside(menuRef, () => setIsOpen(false));

  if (!user) return null;

  const lang = pathname?.split("/")[1] || "es";
  const navigate = (path: string) => {
    router.push(path);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`p-2 neo-border transition-all ${isOpen ? "bg-(--accent-color) text-white" : "bg-background"}`}
      >
        {isOpen ? <IconX size={24} /> : <IconMenu2 size={24} />}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-3 w-64 bg-(--bg-secondary) neo-border neo-shadow z-50 animate-fade-in">
          <div className="p-4 border-b-2 border-(--border-color) bg-background">
            <p className="text-sm font-bold">@{user.username}</p>
            <p className="text-[10px] font-mono text-(--accent-color) uppercase">{user.role}</p>
          </div>

          <div className="p-2 flex flex-col gap-1">
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
            <MenuItem
              icon={<IconLogout size={18} />}
              label="Cerrar Sesión"
              onClick={logout}
              variant="danger"
            />
          </div>
        </div>
      )}
    </div>
  );
}
