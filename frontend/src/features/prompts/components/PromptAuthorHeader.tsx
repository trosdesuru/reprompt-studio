"use client";

import { UserAvatar } from "@/src/system/atoms/Avatar/Avatar";
import { usePublicProfile } from "../../public/hooks/usePublicProfile";
import { Button } from "@/src/system/atoms/Button/Button";
import Link from "next/link";

interface Author {
  username: string;
  avatar_url?: string;
  role?: string;
}

export function PromptAuthorHeader({ author, lang }: { author: Author; lang: string }) {
  // 🟢 1. Le pasamos el username del autor al hook para que sepa a quién buscar
  const { data } = usePublicProfile(author.username);
  const displayRole = author.role || data?.user?.role || "CREATOR";

  return (
    <div className="flex items-center justify-between p-4 border-b border-border/30 bg-muted/5">
      <Link href={`/${lang}/${author.username}`} className="flex items-center gap-3 group">
        <UserAvatar
          username={author.username}
          avatarUrl={author.avatar_url}
          size="md"
          className="border border-border/50 transition-transform group-hover:scale-105"
        />

        <div className="flex flex-col">
          <span className="text-sm font-bold text-foreground group-hover:text-accent transition-colors">
            @{author.username}
          </span>
          {/* 🟢 3. Imprimimos el rol calculado */}
          <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-mono">
            {displayRole}
          </span>
        </div>
      </Link>

      <Button variant="outline" size="sm" className="text-xs font-bold tracking-tighter">
        SEGUIR
      </Button>
    </div>
  );
}