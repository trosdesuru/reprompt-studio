"use client";

import { UserAvatar } from "@/src/system/atoms/Avatar/Avatar";
import { usePublicProfile } from "../../public/hooks/usePublicProfile";
import { Button } from "@/src/system/atoms/Button/Button";
import Link from "next/link";
import { Tooltip } from "@/src/system/atoms/Tooltip/Tooltip";
import { UserBadge } from "@/src/system/atoms/Badge/Badge";
import { UserCover } from "@/src/system/atoms/Cover/UserCover";

interface Author {
  username: string;
  avatar_url?: string;
  role?: string;
}

export function PromptProfileHeader({ author, lang }: { author: Author; lang: string }) {
  const { data } = usePublicProfile(author.username);

  const userRole = data?.user?.role || author.role || "creator";

  return (
    <div className="relative overflow-hidden p-4 rounded-xl neo-border">
      <div className="absolute inset-0 z-0">
        <UserCover role={userRole} />
      </div>

      <div className="relative z-10 flex items-center justify-between w-full">
        <Tooltip variant="default" content={`Ver perfil de @${author.username}`}>
          <Link href={`/${lang}/${author.username}`} className="flex items-center gap-3 group">
            <UserAvatar
              username={author.username}
              avatarUrl={author.avatar_url}
              size="lg"
              className="ring-2 ring-background/20 shadow-md transition-transform group-hover:scale-105"
            />

            <div className="flex flex-col drop-shadow-md">
              <span className="text-md font-bold text-white group-hover:text-white/80 transition-colors">
                @{author.username}
              </span>

              <UserBadge role={userRole} />
            </div>
          </Link>
        </Tooltip>

        <Tooltip variant="default" content="Servicio en desarrollo">
          <Button
            variant="disabled"
            size="sm"
            className="text-xs font-bold tracking-tighter bg-background/20 text-white border-white/20 backdrop-blur-md"
          >
            SEGUIR
          </Button>
        </Tooltip>
      </div>
    </div>
  );
}
