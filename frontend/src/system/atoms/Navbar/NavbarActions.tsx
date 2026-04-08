"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useAuthStore } from "@/src/store/authStore";
import { useTheme } from "@/src/utils/hooks/useTheme";
import { UserDropdown } from "../../molecules/Navbar/UserDropdown";
import { NotificationDropdown } from "../../molecules/Navbar/NotificationDropdown";
import { IconAlbum, IconSun, IconMoon, IconScanTraces } from "@tabler/icons-react";

export function NavbarActions() {
  const { user, isLoadingAuth } = useAuthStore();
  const { isDark, toggleTheme } = useTheme();

  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return <div className="hidden md:block w-24 h-10" />;
  }

  return (
    <div className="hidden md:flex items-center gap-1.5 lg:gap-1.5 shrink-0">
      {isLoadingAuth ? (
        <div className="w-24 h-10 rounded-lg bg-muted/50 animate-pulse"></div>
      ) : user ? (
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
