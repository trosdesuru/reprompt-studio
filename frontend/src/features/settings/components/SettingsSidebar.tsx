"use client";

import { useSettingsNavigation } from "../hooks/useSettingsNavigation";
import { SidebarNavLink } from "./SidebarNavLink";

export function SettingsSidebar() {
  const links = useSettingsNavigation();

  return (
    <nav className="flex flex-col gap-2">
      <p className="text-[10px] font-black font-mono text-muted-foreground uppercase tracking-widest px-4 mb-2">
        Ajustes de Usuario
      </p>

      {links.map((link) => (
        <SidebarNavLink key={link.href} {...link} />
      ))}
    </nav>
  );
}
