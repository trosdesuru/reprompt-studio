"use client";

import Link from "next/link";
import { IconCopy, IconCheck, IconPhoto } from "@tabler/icons-react";
import { usePromptCard } from "@/src/system/molecules/Cards/hooks/usePromptCard";
import { PromptCardActions } from "../../molecules/Cards/PromptCardActions";
import { LazyImage } from "../../molecules/Media/LazyImage";

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
      className="group relative flex flex-col bg-background rounded-xl border border-border shadow-sm hover:shadow-lg transition-all"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setIsMenuOpen(false);
      }}
    >
      <PromptCardActions
        item={item}
        directories={directories}
        onAssign={onAssign}
        onDelete={onDelete}
        isOpen={isMenuOpen}
        setIsOpen={setIsMenuOpen}
      />

      <Link href={href} className="flex flex-col h-full z-10">
        <div className="relative aspect-square sm:aspect-4/5 overflow-hidden rounded-t-xl bg-muted/10">
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
        </div>

        <div className="p-4 flex flex-col gap-3">
          <h3 className="font-bold text-sm truncate">{item.title}</h3>
          <p className="text-[10px] text-muted-foreground uppercase font-mono">
            {item.model || "Base Model"}
          </p>
        </div>
      </Link>

      <div className="px-4 pb-4 mt-auto">
        <div className="relative group/prompt bg-muted/30 rounded-lg p-2 border border-border/50">
          <p className="text-[11px] font-mono text-foreground/70 line-clamp-2">{item.prompt}</p>
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleCopy(item.prompt);
            }}
            className="absolute top-1 right-1 p-1 bg-background border rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
          >
            {copied ? <IconCheck size={12} className="text-green-500" /> : <IconCopy size={12} />}
          </button>
        </div>
      </div>
    </div>
  );
}
