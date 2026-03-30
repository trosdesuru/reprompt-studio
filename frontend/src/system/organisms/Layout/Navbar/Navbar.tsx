// frontend/src/system/organisms/Layout/Navbar/Navbar.tsx
"use client";

import { NavbarSearch } from "./NavbarSearch";
import { UserDropdown } from "./UserDropdown";
import { useTheme } from "@/src/utils/hooks/useTheme";
import { IconSun, IconMoon } from "@tabler/icons-react";

export function Navbar() {
  const { isDark, toggleTheme } = useTheme();

  return (
    <nav className="sticky top-0 z-50 w-full bg-background/80 backdrop-blur-md border-b border-border shadow-sm">
      <div className="max-w-1600px mx-auto px-4 md:px-6 py-2 flex items-start gap-4">
        {/* Logo - Alineado arriba */}
        <div className="pt-2 shrink-0">
          <img src="/logo-brand.svg" className="w-32" alt="Logo" />
        </div>

        {/* Buscador y Filtros - Contenedor Central Dinámico */}
        <div className="flex-1 flex flex-col gap-2">
          <NavbarSearch />
          {/* El NavbarSearch ahora contiene el Combobox debajo del input */}
        </div>

        {/* Acciones Derecha */}
        <div className="flex items-center gap-3 pt-1">
          <button onClick={toggleTheme} className="p-2 hover:bg-muted rounded-full">
            {isDark ? <IconSun size={20} /> : <IconMoon size={20} />}
          </button>
          <UserDropdown />
        </div>
      </div>
    </nav>
  );
}
