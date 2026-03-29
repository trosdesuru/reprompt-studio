"use client";

import { IconWand } from "@tabler/icons-react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Button } from "@/src/components/ui/Button";
import { useAuthStore } from "@/src/store/authStore";
import { UserDropdown } from "./UserDropdown";

export function Navbar() {
  const pathname = usePathname();
  const { user, isLoadingAuth } = useAuthStore();

  if (pathname === "/login" || pathname === "/join") return null;

  return (
    <nav className="bg-(--bg-secondary) border-b-4 border-(--border-color) px-4 sm:px-6 py-4 flex justify-between items-center z-40 sticky top-0 transition-colors">
      <Link
        href="/"
        className="font-mono font-black text-lg sm:text-xl text-foreground hover:text-(--accent-color) transition-colors tracking-tighter"
      >
        EH<span className="text-(--accent-color)">-</span>EXPLORER
      </Link>

      <div className="flex gap-3 sm:gap-4 items-center">
        {user && (
          <Link
            href="/reprompt"
            className="flex items-center gap-1.5 sm:gap-2 px-3 py-2 sm:px-4 sm:py-2 bg-background hover:bg-(--accent-color) hover:text-white text-foreground font-mono font-bold text-[10px] sm:text-sm uppercase tracking-wide neo-border transition-all hover:-translate-y-0.5 hover:neo-shadow-accent"
          >
            <IconWand size={16} className="sm:w-18px sm:h-18px" />
            <span className="hidden sm:inline">Reprompt Studio</span>
            <span className="inline sm:hidden">Reprompt</span>
          </Link>
        )}

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
