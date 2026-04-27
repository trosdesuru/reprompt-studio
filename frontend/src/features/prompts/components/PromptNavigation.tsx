"use client";

import { usePromptQueue } from "@/src/store/usePromptQueue";
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
import Link from "next/link";

export function PromptNavigation({ currentId, lang }: { currentId: string; lang: string }) {
  const { getNextItem, getPrevItem } = usePromptQueue();

  const next = getNextItem(currentId);
  const prev = getPrevItem(currentId);
  const arrowClasses =
    "absolute top-1/2 -translate-y-1/2 z-40 p-3 bg-background/20 backdrop-blur-md border border-white/10 text-white hover:bg-background/40 transition-all rounded-full shadow-2xl opacity-0 group-hover:opacity-100 hover:scale-110";

  return (
    <>
      {prev && (
        <Link
          href={`/${lang}/${prev.username}/p/${prev.id}`}
          className={`${arrowClasses} left-4 md:left-6`}
        >
          <IconChevronLeft size={28} />
        </Link>
      )}

      {next && (
        <Link
          href={`/${lang}/${next.username}/p/${next.id}`}
          className={`${arrowClasses} right-4 md:right-6`}
        >
          <IconChevronRight size={28} />
        </Link>
      )}
    </>
  );
}
