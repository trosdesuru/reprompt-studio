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
      classes: "bg-muted text-muted-foreground border-border/50",
    },
    artist: {
      label: "Artist",
      classes:
        "bg-primary/10 text-primary border-primary/30 shadow-[0_0_10px_rgba(var(--primary-rgb),0.1)]",
    },
    admin: {
      label: "Admin",
      classes: "text-amber-400 font-medium border-amber-500",
    },
  };

  const currentRole = role.toLowerCase();
  const config = badgeConfig[currentRole] || badgeConfig.voyager;

  return (
    <span
      className={`
        px-2.5 py-0.5 text-xs font-mono lowercase tracking-widest 
        rounded-md border transition-all duration-300
        ${config.classes}
      `}
    >
      {config.label}
    </span>
  );
}
