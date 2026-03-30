"use client";

import { useTheme } from "@/src/utils/hooks/useTheme";
import Link from "next/link";
import { NavbarSearch } from "./NavbarSearch";
import { UserDropdown } from "./UserDropdown";
import { IconMoon, IconSun } from "@tabler/icons-react";

export function Navbar() {
  const { isDark, toggleTheme } = useTheme();

  return (
    <nav className="sticky top-0 z-50 w-full bg-background/80 backdrop-blur-md border-b border-border shadow-sm">
      <div className="max-w-1600px mx-auto px-4 md:px-8 h-16 flex items-center gap-4 lg:gap-8">
        <Link href="/" className="shrink-0">
          <img src="/logo-brand.svg" className="w-32 md:w-36" alt="Reprompt" />
        </Link>

        <div className="flex-1 flex justify-center">
          <NavbarSearch />
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={toggleTheme}
            className="p-2 hover:bg-muted rounded-full text-muted-foreground hover:text-foreground transition-colors"
          >
            {isDark ? <IconSun size={20} /> : <IconMoon size={20} />}
          </button>
          <UserDropdown />
        </div>
      </div>
    </nav>
  );
}
