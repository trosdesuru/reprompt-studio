"use client";

import Link from "next/link";
import { NavbarSearch } from "./NavbarSearch";
import { NavbarActions } from "./NavbarActions";
import { NavbarMobile } from "./NavbarMobile";
import Image from "next/image";

export function Navbar() {
  return (
    <nav className="sticky top-0 z-50 w-full bg-background/80 backdrop-blur-md border-b border-border shadow-sm">
      <div className="max-w-1600px mx-auto px-4 md:px-8 h-16 flex items-center justify-between gap-4 lg:gap-8">

        <Link href="/" className="shrink-0 flex items-center" aria-label="Ir al inicio">
          <Image
            src="/logo-brand-black.svg"
            alt="Reprompt Logo"
            width={140}
            height={40}
            priority={true}
            className="block dark:hidden w-32 md:w-36 h-auto object-contain"
          />

          <Image
            src="/logo-brand-white.svg"
            alt="Reprompt Logo"
            width={140}
            height={40}
            priority={true}
            className="hidden dark:block w-32 md:w-36 h-auto object-contain"
          />
        </Link>

        {/* Buscador (Centro) */}
        <div className="hidden md:flex flex-1 justify-center">
          <NavbarSearch />
        </div>

        {/* Acciones de Usuario y Tema (Derecha) */}
        <NavbarActions />

        {/* Menú Móvil */}
        <NavbarMobile />
      </div>
    </nav>
  );
}
