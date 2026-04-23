"use client";

import Link from "next/link";
import { useSettingsNavigation } from "../hooks/useSettingsNavigation";
import {
  SidebarHeading,
  SidebarDivider,
  getSidebarItemClasses,
} from "@/src/system/organisms/Sidebar";

export function SettingsSidebar() {
  const links = useSettingsNavigation();

  return (
    <nav className="flex flex-col gap-1 pt-6">
      <SidebarHeading>Ajustes Generales</SidebarHeading>

      <div className="px-3 flex flex-col gap-1">
        {links.map((link) => (
          <Link key={link.href} href={link.href} className={getSidebarItemClasses(link.isActive)}>
            <span className={link.isActive ? "text-primary" : "text-muted-foreground"}>
              {link.icon}
            </span>
            <span className="font-mono font-medium text-xs tracking-widest flex-1 text-left">{link.label}</span>
          </Link>
        ))}
      </div>

      <SidebarDivider className="my-4" />
    </nav>
  );
}
