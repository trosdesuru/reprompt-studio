import React from "react";

interface MenuItemProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  variant?: "default" | "danger";
}

export function MenuItem({ icon, label, onClick, variant = "default" }: MenuItemProps) {
  const baseClass =
    "flex items-center gap-3 p-3 text-sm font-bold neo-border border-transparent transition-all text-left uppercase tracking-wide w-full";
  const variantClass =
    variant === "danger"
      ? "text-red-500 hover:bg-red-500/10 hover:border-red-500/50"
      : "text-foreground hover:bg-muted/30 hover:border-(--border-color)";

  return (
    <button onClick={onClick} className={`${baseClass} ${variantClass}`}>
      {icon} {label}
    </button>
  );
}
