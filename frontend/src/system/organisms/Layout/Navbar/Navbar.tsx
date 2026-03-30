"use client";

import Link from 'next/link';
import { NavbarSearch } from './NavbarSearch';
import { NavbarActions } from './NavbarActions';
import { NavbarMobile } from './NavbarMobile';

export function Navbar() {
  return (
    <nav className="sticky top-0 z-50 w-full bg-background/80 backdrop-blur-md border-b border-border shadow-sm">
      <div className="max-w-1600px mx-auto px-4 md:px-8 h-16 flex items-center justify-between gap-4 lg:gap-8">
        
        {/* Logo */}
        <Link href="/" className="shrink-0">
           <img src="/logo-brand-white.svg" className="w-32 md:w-36" alt="Reprompt" />
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
