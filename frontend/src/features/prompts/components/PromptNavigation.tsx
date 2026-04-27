"use client";

import { usePromptQueue } from "@/src/store/usePromptQueue";
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
import Link from "next/link";

export function PromptNavigation({
  currentId,
  username,
  lang,
}: {
  currentId: string;
  username: string;
  lang: string;
}) {
  const { getNextId, getPrevId } = usePromptQueue();
  const nextId = getNextId(currentId);
  const prevId = getPrevId(currentId);

  const arrowClasses =
    "absolute top-1/2 -translate-y-1/2 z-40 p-3 bg-background/20 backdrop-blur-md border border-white/10 text-white hover:bg-background/40 transition-all rounded-full shadow-2xl opacity-0 group-hover:opacity-100 hover:scale-110";

  return (
    <>
      {prevId && (
        <Link href={`/${lang}/${username}/p/${prevId}`} className={`${arrowClasses} left-6`}>
          <IconChevronLeft size={32} stroke={2} />
        </Link>
      )}
      {nextId && (
        <Link href={`/${lang}/${username}/p/${nextId}`} className={`${arrowClasses} right-6`}>
          <IconChevronRight size={32} stroke={2} />
        </Link>
      )}
    </>
  );
}
