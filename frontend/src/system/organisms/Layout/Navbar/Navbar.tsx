// frontend/src/system/organisms/Layout/Navbar/Navbar.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import { NavbarSearch } from "./NavbarSearch";
import { NotificationDropdown } from "./NotificationDropdown";
import { UserDropdown } from "./UserDropdown";
import { useAuthStore } from "@/src/store/authStore";
import { IconWand, IconArchive } from "@tabler/icons-react";

export function Navbar() {
  const { user } = useAuthStore();

  return (
    <nav className="sticky top-0 z-50 w-full bg-background/80 backdrop-blur-md border-b border-border h-16">
      <div className="flex items-center justify-between h-full px-4 md:px-8 gap-4 max-w-1600px mx-auto">
        {/* Logo */}
        <Link href="/" className="shrink-0">
          <Image src="/logo-brand.svg" alt="Logo" width={140} height={35} priority />
        </Link>

        {/* Buscador Central */}
        <div className="hidden md:flex flex-1 max-w-2xl">
          <NavbarSearch />
        </div>

        {/* Acciones Derecha */}
        <div className="flex items-center gap-2 md:gap-4">
          {user && (
            <>
              <Link
                href="/reprompt"
                className="hidden lg:flex items-center gap-2 px-4 py-2 bg-foreground text-background rounded-lg text-sm font-bold hover:opacity-90 transition-opacity"
              >
                <IconWand size={18} /> Reprompt Studio
              </Link>
              <Link
                href="/studio"
                className="p-2 text-muted-foreground hover:text-foreground transition-colors"
                title="Mi Estudio"
              >
                <IconArchive size={22} />
              </Link>
              <NotificationDropdown />
              <UserDropdown />
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
