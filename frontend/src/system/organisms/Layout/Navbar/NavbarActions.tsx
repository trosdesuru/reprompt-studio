"use client";

import Link from 'next/link';
import { useAuthStore } from '@/src/store/authStore';
import { useTheme } from '@/src/utils/hooks/useTheme';
import { UserDropdown } from './UserDropdown';
import { NotificationDropdown } from './NotificationDropdown';
import { IconSun, IconMoon, IconWand, IconArchive } from '@tabler/icons-react';

export function NavbarActions() {
  const { user } = useAuthStore();
  const { isDark, toggleTheme } = useTheme();

  return (
    <div className="hidden md:flex items-center gap-2 lg:gap-4 shrink-0">
      {user ? (
        <>
          <div className="flex items-center gap-2">
            <Link href="/reprompt" className="flex items-center gap-2 px-4 py-2 bg-foreground text-background rounded-lg text-sm font-bold hover:opacity-90 transition-opacity">
              <IconWand size={18} /> Reprompt Studio
            </Link>
            <Link href="/studio" className="p-2 text-muted-foreground hover:text-foreground transition-colors" title="Mi Estudio">
              <IconArchive size={22} />
            </Link>
          </div>
          <NotificationDropdown />
          <UserDropdown />
        </>
      ) : (
        <Link href="/login" className="text-sm font-bold px-4 py-2 bg-foreground text-background rounded-lg hover:opacity-90">
          Entrar
        </Link>
      )}
      <button 
        onClick={toggleTheme} 
        className="p-2 ml-2 hover:bg-muted rounded-full text-muted-foreground hover:text-foreground transition-colors"
      >
        {isDark ? <IconSun size={20} /> : <IconMoon size={20} />}
      </button>
    </div>
  );
}
