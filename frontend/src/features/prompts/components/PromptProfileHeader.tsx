"use client";

import { UserAvatar } from "@/src/system/atoms/Avatar/Avatar";
import { usePublicProfile } from "../../public/hooks/usePublicProfile";
import { Button } from "@/src/system/atoms/Button/Button";
import Link from "next/link";
import { Tooltip } from "@/src/system/atoms/Tooltip/Tooltip";
import { UserBadge } from "@/src/system/atoms/Badge/Badge";

interface Author {
  username: string;
  avatar_url?: string;
  role?: string;
}

export function PromptProfileHeader({ author, lang }: { author: Author; lang: string }) {
  const { data } = usePublicProfile(author.username);

  return (
    <div className="flex items-center justify-between p-4 border-b border-border/30 rounded-lg bg-red-500">
      <Tooltip variant="default" content={`${data?.user.username}`}>
        <Link href={`/${lang}/${author.username}`} className="flex items-center gap-3 group">
          <UserAvatar
            username={author.username}
            avatarUrl={author.avatar_url}
            size="lg"
            className="border border-border/50 transition-transform group-hover:scale-105"
          />

          <div className="flex flex-col">
            <span className="text-md font-bold text-foreground group-hover:text-accent transition-colors">
              @{author.username}
            </span>

            <UserBadge />
          </div>
        </Link>
      </Tooltip>

      <Tooltip variant="default" content="Servicio en desarrollo">
        <Button variant="disabled" size="sm" className="text-xs font-bold tracking-tighter">
          SEGUIR
        </Button>
      </Tooltip>
    </div>
  );
}
