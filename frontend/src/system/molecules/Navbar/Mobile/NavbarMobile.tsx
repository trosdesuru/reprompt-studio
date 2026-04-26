"use client";

import { useState } from "react";
import { useAuthStore } from "@/src/store/authStore";
import { useTheme } from "@/src/utils/hooks/useTheme";
import { useScrollLock } from "@/src/utils/hooks/useScrollLock";
import { useAppLocale } from "@/src/utils/hooks/useAppRouter";
import { NavbarSearch } from "../NavbarSearch";
import { IconMenu2 } from "@tabler/icons-react";

// Importamos las piezas desde nuestros nuevos submódulos
import { MenuHeader } from "./MobileMenuPrimitives";
import { AuthenticatedView, GuestView, MenuFooterActions } from "./MobileMenuViews";

export function NavbarMobile() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuthStore();
  const { isDark, toggleTheme } = useTheme();
  const lang = useAppLocale();

  useScrollLock(isOpen);

  const closeMenu = () => setIsOpen(false);

  return (
    <div className="md:hidden flex items-center gap-2">
      <button
        onClick={() => setIsOpen(true)}
        className="p-2 text-foreground hover:bg-muted rounded-md transition-colors"
        aria-label="Abrir menú móvil"
      >
        <IconMenu2 size={24} />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-100 h-dvh bg-background/95 backdrop-blur-md flex flex-col animate-in slide-in-from-top-2 duration-200">
          <MenuHeader onClose={closeMenu} />

          <div className="flex-1 overflow-y-auto">
            <div className="flex flex-col min-h-full p-4 pb-8">
              <div className="flex flex-col gap-6">
                <div className="w-full">
                  <NavbarSearch />
                </div>

                {user ? (
                  <AuthenticatedView user={user} lang={lang} onClose={closeMenu} />
                ) : (
                  <GuestView lang={lang} onClose={closeMenu} />
                )}
              </div>

              <MenuFooterActions
                user={user}
                isDark={isDark}
                toggleTheme={toggleTheme}
                onLogout={logout}
                onClose={closeMenu}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
