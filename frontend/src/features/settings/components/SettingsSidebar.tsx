"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { IconUserEdit, IconKey, IconPalette } from "@tabler/icons-react";

interface Props {
  username: string;
  lang: string;
}

export function SettingsSidebar({ username, lang }: Props) {
  const pathname = usePathname();
  const basePath = `/${lang}/${username}/settings`;

  const navItems = [
    { href: `${basePath}/profile`, label: "Perfil Público", icon: <IconUserEdit size={20} /> },
    { href: `${basePath}/security`, label: "Seguridad y Acceso", icon: <IconKey size={20} /> },
    { href: `${basePath}/appearance`, label: "Apariencia", icon: <IconPalette size={20} /> },
  ];

  return (
    <nav className="flex flex-col gap-2 w-full md:w-64 shrink-0">
      <h2 className="px-4 text-xs font-black font-mono text-muted-foreground uppercase tracking-widest mb-2">
        Ajustes de Cuenta
      </h2>

      {navItems.map((item) => {
        const isActive = pathname === item.href;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 px-4 py-3 text-sm font-bold neo-border transition-all ${
              isActive
                ? "bg-(--accent-color) text-white neo-shadow-accent border-transparent"
                : "bg-transparent text-foreground border-transparent hover:border-(--border-color) hover:bg-muted/10"
            }`}
          >
            {item.icon}
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
