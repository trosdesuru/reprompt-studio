"use client";

import { IconWand, IconArchive } from "@tabler/icons-react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Button } from "@/src/system/atoms/Button";
import { useAuthStore } from "@/src/store/authStore";
import { UserDropdown } from "./UserDropdown";
import { NotificationDropdown } from "./NotificationDropdown";

export function Navbar() {
  const pathname = usePathname();
  const { user, isLoadingAuth } = useAuthStore();

  if (pathname === "/login" || pathname === "/join") return null;

  return (
    <nav className="bg-(--bg-secondary) border-b-4 border-(--border-color) px-4 sm:px-6 py-4 flex justify-between items-center z-40 sticky top-0 transition-colors">
      <div className="flex items-center gap-6">
        <Link
          href="/"
          className="font-mono font-black text-lg sm:text-xl text-foreground hover:text-(--accent-color) transition-colors tracking-tighter"
        >
          EH<span className="text-(--accent-color)">-</span>EXPLORER
        </Link>

        {user && (
          <div className="hidden md:flex items-center gap-4 border-l-2 border-(--border-color) pl-6">
            <Link
              href="/studio"
              className={`font-mono text-xs font-bold uppercase hover:text-(--accent-color) transition-colors ${pathname === "/studio" ? "text-(--accent-color)" : ""}`}
            >
              Mi Estudio
            </Link>
          </div>
        )}
      </div>

      <div className="flex gap-3 sm:gap-4 items-center">
        {user && (
          <>
            <Link href="/studio" className="flex md:hidden p-2 hover:text-(--accent-color)">
              <IconArchive size={20} />
            </Link>

            <Link
              href="/reprompt"
              className="flex items-center gap-1.5 sm:gap-2 px-3 py-2 sm:px-4 sm:py-2 bg-background hover:bg-(--accent-color) hover:text-white text-foreground font-mono font-bold text-[10px] sm:text-sm uppercase tracking-wide neo-border transition-all hover:-translate-y-0.5"
            >
              <IconWand size={16} />
              <span className="hidden sm:inline">Reprompt Studio</span>
              <span className="inline sm:hidden">Reprompt</span>
            </Link>
          </>
        )}

        {user && <NotificationDropdown />}

        {isLoadingAuth ? (
          <div className="h-9 w-9 sm:h-10 sm:w-10 bg-gray-200 dark:bg-gray-800 animate-pulse rounded neo-border"></div>
        ) : user ? (
          <UserDropdown />
        ) : (
          <Button variant="primary" size="sm" onClick={() => (window.location.href = "/login")}>
            Entrar
          </Button>
        )}
      </div>
    </nav>
  );
}
