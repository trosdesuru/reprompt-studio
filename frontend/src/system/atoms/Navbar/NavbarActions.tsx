"use client";

import Link from "next/link";
import { useAuthStore } from "@/src/store/authStore";
import { useTheme } from "@/src/utils/hooks/useTheme";
import { UserDropdown } from "../../molecules/Navbar/UserDropdown";
import { NotificationDropdown } from "../../molecules/Navbar/NotificationDropdown";
import { IconAlbum, IconSun, IconMoon, IconScanTraces } from "@tabler/icons-react";

export function NavbarActions() {
  const { user } = useAuthStore();
  const { isDark, toggleTheme } = useTheme();

  return (
    <div className="hidden md:flex items-center gap-1.5 lg:gap-1.5 shrink-0">
      {user ? (
        <>
          <div className="flex items-center gap-2">
            <Link
              href="/studio"
              className="flex items-center gap-2 px-4 py-2 bg-foreground text-background rounded-lg text-sm font-bold hover:opacity-90 transition-opacity"
            >
              <IconAlbum size={18} />
              Studio
            </Link>
            <Link
              href="/reprompt"
              className="p-2 rounded-md text-muted-foreground hover:text-foreground transition-colors hover:bg-(--bg-secondary) cursor-pointer"
              title="Mi Estudio"
            >
              <IconScanTraces size={22} />
            </Link>
          </div>
          <NotificationDropdown />
          <button
            onClick={toggleTheme}
            className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-(--bg-secondary) cursor-pointer transition-colors"
            title="Cambiar tema"
          >
            {isDark ? <IconSun size={24} /> : <IconMoon size={24} />}
          </button>
          <UserDropdown />
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
  );
}
