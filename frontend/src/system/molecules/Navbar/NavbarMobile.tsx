"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/src/store/authStore';
import { useTheme } from '@/src/utils/hooks/useTheme';
import { NavbarSearch } from './NavbarSearch';
import { IconMenu2, IconX, IconWand, IconArchive, IconSun, IconMoon } from '@tabler/icons-react';

export function NavbarMobile() {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuthStore();
  const { isDark, toggleTheme } = useTheme();

  return (
    <div className="md:hidden flex items-center gap-2">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-foreground hover:bg-muted rounded-md transition-colors"
      >
        {isOpen ? <IconX size={24} /> : <IconMenu2 size={24} />}
      </button>

      {isOpen && (
        <div className="absolute top-16 left-0 w-full bg-background border-b border-border shadow-2xl p-4 flex flex-col gap-4 animate-in slide-in-from-top-2 z-50">
          <NavbarSearch />
          
          <div className="flex flex-col gap-2 pt-2 border-t border-border/50">
            {user ? (
              <>
                <Link href="/reprompt" onClick={() => setIsOpen(false)} className="flex items-center gap-3 p-3 rounded-md hover:bg-muted font-bold text-sm text-foreground transition-colors">
                  <IconWand size={20} /> Reprompt Studio
                </Link>
                <Link href="/studio" onClick={() => setIsOpen(false)} className="flex items-center gap-3 p-3 rounded-md hover:bg-muted font-bold text-sm text-foreground transition-colors">
                  <IconArchive size={20} /> Mi Estudio
                </Link>
              </>
            ) : (
              <Link href="/login" onClick={() => setIsOpen(false)} className="p-3 text-center bg-foreground text-background rounded-lg font-bold text-sm">
                Iniciar Sesión
              </Link>
            )}
            
            <button onClick={toggleTheme} className="flex items-center gap-3 p-3 rounded-md hover:bg-muted font-bold text-sm text-foreground transition-colors text-left">
              {isDark ? <IconSun size={20} /> : <IconMoon size={20} />}
              {isDark ? 'Modo Claro' : 'Modo Oscuro'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
