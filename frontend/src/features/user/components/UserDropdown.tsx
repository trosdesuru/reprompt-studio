"use client";

import { useState, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/src/store/authStore";
import { useClickOutside } from "@/src/utils/hooks/useClickOutside";
import { MenuItem } from "@/src/system/atoms/Dropdown/MenuItem";
import { LogoutMenuItem } from "@/src/features/auth/components/LogoutMenuItem";
import { ThemeMenuItem } from "@/src/features/theme/components/ThemeMenuItem";
import { UserAvatar } from "@/src/system/atoms/Avatar/Avatar";
import {
  IconDeviceDesktop,
  IconLockSquareRounded,
  IconShieldLock,
  IconUserSquareRounded,
} from "@tabler/icons-react";
import { Tooltip } from "@/src/system/atoms/Tooltip/Tooltip";

export function UserDropdown() {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAuthStore();
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
      <Tooltip content="Menu" side="bottom">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex rounded-full transition-opacity hover:opacity-85 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          aria-expanded={isOpen}
          aria-haspopup="true"
        >
          <UserAvatar username={user.username} avatarUrl={user.avatarUrl} size="sm" />
        </button>
      </Tooltip>

      {isOpen && (
        <div
          className="absolute right-0 mt-2 w-72 bg-background border border-border shadow-lg rounded-xl z-90! animate-in fade-in zoom-in-95 duration-100 origin-top-right flex flex-col overflow-hidden"
          role="menu"
        >
          <div className="flex items-center gap-3 p-4 border-b border-border bg-muted/10">
            <UserAvatar username={user.username} avatarUrl={user.avatarUrl} size="md" />
            <div className="flex flex-col overflow-hidden">
              <span className="text-sm font-bold text-foreground truncate">@{user.username}</span>
              <span className="text-xs font-medium text-muted-foreground capitalize mt-0.5">
                {user.role}
              </span>
            </div>
          </div>

          <div className="p-1.5 flex flex-col gap-0.5 border-b border-border">
            <MenuItem
              icon={<IconUserSquareRounded size={16} />}
              label="Perfil"
              onClick={() =>
                navigate(`/${lang}/${encodeURIComponent(user.username)}/settings/profile`)
              }
            />

            <MenuItem
              icon={<IconLockSquareRounded size={16} />}
              label="Seguridad y Privacidad"
              onClick={() =>
                navigate(`/${lang}/${encodeURIComponent(user.username)}/settings/security`)
              }
            />

            <MenuItem
              icon={<IconDeviceDesktop size={16} />}
              label="Apariencia"
              onClick={() =>
                navigate(`/${lang}/${encodeURIComponent(user.username)}/settings/appearance`)
              }
            />

            {user.role === "admin" && (
              <MenuItem
                icon={<IconShieldLock size={16} />}
                label="Panel Admin"
                onClick={() => navigate(`/${lang}/admin`)}
              />
            )}
          </div>

          <div className="p-1.5 flex flex-col gap-0.5 border-b border-border">
            <ThemeMenuItem />
          </div>

          <div className="p-1.5 bg-muted/5">
            <LogoutMenuItem />
          </div>
        </div>
      )}
    </div>
  );
}
