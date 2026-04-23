import React from "react";

export function SidebarItemIcon({
  children,
  isActive,
}: {
  children: React.ReactNode;
  isActive: boolean;
}) {
  return (
    <span
      className={`transition-colors duration-200 ${isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"}`}
    >
      {children}
    </span>
  );
}
