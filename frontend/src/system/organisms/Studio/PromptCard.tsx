"use client";

import Link from "next/link";
import { useState } from "react";

import { IconCopy, IconCheck, IconPhoto, IconEyeOff, IconWand } from "@tabler/icons-react";
import { usePromptCard } from "@/src/system/molecules/Cards/hooks/usePromptCard";
import { PromptCardActions } from "../../molecules/Cards/PromptCardActions";
import { LazyImage } from "../../molecules/Media/LazyImage";
import { cn } from "@/lib/utils";

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

  const [showNsfw, setShowNsfw] = useState(false);

  const aspectRatio = item.width && item.height ? item.width / item.height : 1;
  const getAspectClass = () => {
    if (aspectRatio > 1.2) return "aspect-video";
    if (aspectRatio < 0.8) return "aspect-[3/4]";
    return "aspect-square";
  };

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

      <Link
        href={href}
        className="flex flex-col h-full z-10"
        onClick={(e) => {
          if (item.is_nsfw && !showNsfw) {
            e.preventDefault();
          }
        }}
      >
        <div
          className={cn(
            "relative w-full overflow-hidden rounded-t-xl bg-muted/10",
            getAspectClass(),
          )}
        >
          {item.is_nsfw && !showNsfw && (
            <div
              className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-background/80 backdrop-blur-2xl cursor-pointer transition-all hover:bg-background/90"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setShowNsfw(true);
              }}
            >
              <IconEyeOff className="mb-2 h-8 w-8 text-foreground/70" stroke={1.5} />
              <span className="text-[10px] font-bold uppercase tracking-widest text-foreground/70">
                Contenido Sensible
              </span>
            </div>
          )}

          {item.image_url ? (
            <LazyImage
              src={item.image_url}
              alt={item.title}
              index={index}
              className={cn(
                "w-full h-full object-cover transition-transform duration-700 group-hover:scale-105",
                item.is_nsfw && !showNsfw ? "blur-2xl scale-110" : "",
              )}
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground/30">
              <IconPhoto size={40} stroke={1} />
            </div>
          )}

          <div className="absolute inset-x-0 bottom-0 z-10 bg-linear-to-t from-black/80 via-black/40 to-transparent p-3 opacity-0 transition-opacity duration-300 group-hover:opacity-100 flex flex-wrap gap-1.5 items-end">
            {item.ai_processed ? (
              item.tags?.slice(0, 3).map((tag: string) => (
                <span
                  key={tag}
                  className="text-[9px] bg-white/20 backdrop-blur-md text-white px-2 py-0.5 rounded-full border border-white/10 font-medium capitalize"
                >
                  {tag}
                </span>
              ))
            ) : (
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/10 backdrop-blur-md border border-white/10">
                <IconWand size={10} className="text-white/70 animate-pulse" />
                <span className="text-[9px] text-white/70 font-medium animate-pulse">
                  Analizando...
                </span>
              </div>
            )}
          </div>
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
