import Link from "next/link";
import { NavLink } from "../hooks/useSettingsNavigation";

export function SidebarNavLink({ href, label, icon, isActive }: NavLink) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-3 px-4 py-3 font-bold transition-all neo-border ${
        isActive
          ? "bg-(--accent-color) text-white border-transparent neo-shadow-accent"
          : "hover:bg-muted/10 border-transparent hover:border-(--border-color)"
      }`}
    >
      {icon} {label}
    </Link>
  );
}
