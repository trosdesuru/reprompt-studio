"use client";

import { UserAvatar } from "@/src/system/atoms/Avatar/Avatar";
import { UserBadge } from "@/src/system/atoms/Badge/Badge";

interface ProfileHeaderProps {
  username: string;
  avatarUrl?: string;
  role?: string;
  bio?: string;
  promptCount: number;
}

export function ProfileHeader({
  username,
  avatarUrl,
  role = "creator",
  promptCount,
}: ProfileHeaderProps) {
  return (
    <header className="flex items-center justify-between gap-4 p-6 rounded-lg bg-red-500">
      <div className="flex flex-row items-center gap-4 md:gap-6 w-full">
        <UserAvatar
          username={username}
          avatarUrl={avatarUrl}
          size="xl"
        />

        <div className="flex flex-col justify-center gap-2">
          <div className="flex flex-col items-start">
            <h1 className="text-xl sm:text-3xl md:text-4xl font-prompt font-bold lowercase tracking-tighter text-foreground leading-none">
              @{username}
            </h1>
            <UserBadge role={role} />
          </div>

          <div className="hidden sm:flex items-center gap-1.5 mt-1">
            <span className="text-sm text-foreground font-bold">{promptCount}</span>
            <span className="text-muted-foreground text-xs uppercase tracking-widest font-mono opacity-70">
              Prompts
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
