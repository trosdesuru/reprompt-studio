import Link from "next/link";
import { NavLink } from "../hooks/useSettingsNavigation";
import {
  getSidebarItemClasses,
  SidebarActiveIndicator,
  SidebarItemIcon,
} from "@/src/system/organisms/Sidebar";

export function SidebarNavLink({ href, label, icon, isActive }: NavLink) {
  return (
    <Link href={href} className={getSidebarItemClasses(isActive)}>
      {isActive && <SidebarActiveIndicator />}

      <SidebarItemIcon isActive={isActive}>{icon}</SidebarItemIcon>

      <span className="flex-1 text-left">{label}</span>
    </Link>
  );
}
