"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { IconUserEdit, IconLock, IconPalette } from "@tabler/icons-react";

export function SettingsSidebar({ username, lang }: { username: string; lang: string }) {
  const pathname = usePathname();
  const basePath = `/${lang}/${username}/settings`;

  const links = [
    { href: `${basePath}/profile`, label: "Perfil Público", icon: <IconUserEdit size={20} /> },
    { href: `${basePath}/security`, label: "Seguridad", icon: <IconLock size={20} /> },
    { href: `${basePath}/appearance`, label: "Apariencia", icon: <IconPalette size={20} /> },
  ];

  return (
    <nav className="flex flex-col gap-2">
      <p className="text-[10px] font-black font-mono text-muted-foreground uppercase tracking-widest px-4 mb-2">
        Ajustes de Usuario
      </p>
      {links.map((link) => {
        const isActive = pathname === link.href;
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`flex items-center gap-3 px-4 py-3 font-bold transition-all neo-border ${
              isActive
                ? "bg-(--accent-color) text-white border-transparent neo-shadow-accent"
                : "hover:bg-muted/10 border-transparent hover:border-(--border-color)"
            }`}
          >
            {link.icon} {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
