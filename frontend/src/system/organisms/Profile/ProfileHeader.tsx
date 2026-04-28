"use client";

import { UserAvatar } from "@/src/system/atoms/Avatar/Avatar";
import { UserBadge } from "@/src/system/atoms/Badge/Badge";
import { UserCover } from "@/src/system/atoms/Cover/UserCover";

interface ProfileHeaderProps {
  username: string;
  avatarUrl?: string;
  coverUrl?: string;
  role?: string;
  bio?: string;
  promptCount: number;
}

export function ProfileHeader({
  username,
  avatarUrl,
  coverUrl,
  role = "creator",
  promptCount,
}: ProfileHeaderProps) {
  return (
    <header className="relative flex items-center justify-between gap-4 p-6 rounded-2xl overflow-hidden neo-border">
      <div className="absolute inset-0 z-0">
        <UserCover role={role} coverUrl={coverUrl} />
      </div>

      <div className="relative z-10 flex flex-row items-center gap-4 md:gap-6 w-full">
        <UserAvatar
          username={username}
          avatarUrl={avatarUrl}
          size="xl"
        />

        <div className="flex flex-col justify-center gap-2">
          <div className="flex flex-col items-start drop-shadow-md">
            <h1 className="text-xl sm:text-3xl md:text-4xl font-prompt font-bold lowercase tracking-tighter text-white leading-none">
              @{username}
            </h1>
            <UserBadge role={role} />
          </div>

          <div className="hidden sm:flex items-center gap-1.5 mt-1 drop-shadow-sm">
            <span className="text-sm text-white font-bold">{promptCount}</span>
            <span className="text-white/80 text-xs uppercase tracking-widest font-mono">
              Prompts
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
