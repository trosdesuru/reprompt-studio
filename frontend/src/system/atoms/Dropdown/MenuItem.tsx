import React from "react";

interface MenuItemProps {
  icon: React.ReactNode;
  label: React.ReactNode;
  onClick?: () => void;
  variant?: "default" | "danger";
  className?: string;
  disabled?: boolean;
}

export function MenuItem({
  icon,
  label,
  onClick,
  variant = "default",
  className = "",
  disabled = false,
}: MenuItemProps) {
  const baseClass =
    "flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors text-left w-full disabled:opacity-50 disabled:cursor-not-allowed";

  const variantClass =
    variant === "danger"
      ? "text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10"
      : "text-foreground hover:bg-muted";

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseClass} ${variantClass} ${className}`}
      role="menuitem"
    >
      <span className="shrink-0 opacity-70">{icon}</span>
      <span className="truncate">{label}</span>
    </button>
  );
}
