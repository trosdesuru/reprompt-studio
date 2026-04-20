"use client";

import Link from "next/link";
import { IconPhoto } from "@tabler/icons-react";
import { usePromptCard } from "@/src/system/molecules/Cards/hooks/usePromptCard";
import { PromptCardActions } from "../../molecules/Cards/PromptCardActions";
import { LazyImage } from "../../molecules/Media/LazyImage";
import { PromptCardSnippet } from "../../molecules/Cards/PromptCardSnippet";

export function PromptCard({
  item,
  directories,
  onAssign,
  onDelete,
  lang,
  authorUsername,
  isStudio,
  index,
}: any) {
  const { setIsHovered, isMenuOpen, setIsMenuOpen, copied, handleCopy } = usePromptCard();
  const href = `/${lang}/${authorUsername}/p/${item.id}${isStudio ? "?from=studio" : ""}`;

  return (
    <div
      className="group relative flex flex-col h-fit break-inside-avoid mb-6 bg-background rounded-xl border border-border shadow-sm hover:shadow-lg transition-all overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setIsMenuOpen(false);
      }}
    >
      <div className="absolute top-2 right-2 z-30 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <PromptCardActions
          item={item}
          directories={directories}
          onAssign={onAssign}
          onDelete={onDelete}
          isOpen={isMenuOpen}
          setIsOpen={setIsMenuOpen}
        />
      </div>

      <Link href={href} className="relative flex flex-col h-full z-10">
        <div className="relative aspect-4/5 w-full overflow-hidden bg-muted/10">
          {item.image_url ? (
            <LazyImage
              src={item.image_url}
              alt={item.title}
              index={index}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground/30">
              <IconPhoto size={40} stroke={1} />
            </div>
          )}

          <div className="absolute inset-x-0 bottom-0 p-3 pt-12 bg-linear-to-t from-background/95 via-background/80 to-transparent opacity-0 translate-y-4 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 ease-out flex flex-col gap-2 pointer-events-none group-hover:pointer-events-auto">
            <p className="text-[10px] text-muted-foreground font-mono font-semibold uppercase tracking-wider drop-shadow-sm">
              {item.model || "Base Model"}
            </p>

            <PromptCardSnippet promptText={item.prompt} copied={copied} onCopy={handleCopy} />
          </div>
        </div>

        <div className="p-3 bg-background border-t border-border/10">
          <h3 className="font-bold text-sm truncate">{item.title}</h3>
        </div>
      </Link>
    </div>
  );
}
