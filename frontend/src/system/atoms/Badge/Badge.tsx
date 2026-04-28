"use client";

type UserRole = "voyager" | "artist" | "admin" | string;

interface UserBadgeProps {
  role?: UserRole;
  id?: string;
  username?: string;
  avatarUrl?: string;
}

export function UserBadge({ role = "voyager" }: UserBadgeProps) {
  const badgeConfig: Record<string, { label: string; classes: string }> = {
    voyager: {
      label: "Voyager",
      classes: "bg-gray-500",
    },
    artist: {
      label: "Artist",
      classes: "bg-artist border-secondary shadow-[0_0_10px_rgba(var(--primary-rgb),0.1)]",
    },
    admin: {
      label: "Admin",
      classes: "text-amber-500! bg-amber-500/30! font-medium border border-amber-500",
    },
  };

  const currentRole = role.toLowerCase();
  const config = badgeConfig[currentRole] || badgeConfig.voyager;

  return (
    <span
      className={`
        px-2.5 py-1 text-xs font-mono text-white font-bold w-fit lowercase tracking-widest 
        rounded-md transition-all duration-300
        ${config.classes}
      `}
    >
      {config.label}
    </span>
  );
}
