"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { NavbarSearch } from "@/src/features/layout/components/NavbarSearch";
import { NavbarActions } from "@/src/features/layout/components/NavbarActions";
import { NavbarMobile } from "../../molecules/Navbar/Mobile/NavbarMobile";
import { useScrollDirection } from "@/src/utils/hooks/useScrollDirection";

export function Navbar() {
  const pathname = usePathname();

  // 1. Identificamos en qué vistas NO queremos que se oculte el Navbar
  const isDetailView = pathname?.includes("/p/");

  // Asumiendo que tu home es "/" o "/es" / "/en" (ajusta según tus idiomas)
  const isHome = pathname === "/" || pathname === "/es" || pathname === "/en";

  // 2. Le pasamos la regla al Hook:
  // "Solo actívate si estamos en la Home Y NO estamos en una vista de detalle"
  const scrollDirection = useScrollDirection(isHome && !isDetailView);

  // 3. El CSS ahora es extremadamente simple. No hay ternarios anidados.
  const transformClass = scrollDirection === "down" ? "-translate-y-full" : "translate-y-0";

  return (
    <nav
      className={`sticky top-0 z-50 w-full bg-background/40 backdrop-blur-md border-b border-border shadow-sm transition-transform duration-600 ease-in-out ${transformClass}`}
    >
      <div className="max-w-360 mx-auto px-4 md:px-8 h-16 flex items-center justify-between gap-4 lg:gap-8">
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

        <div className="hidden md:flex flex-1 justify-center">
          <NavbarSearch />
        </div>

        <NavbarActions />

        <NavbarMobile />
      </div>
    </nav>
  );
}
