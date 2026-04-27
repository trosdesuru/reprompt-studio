"use client";

import Link from "next/link";
import { IconPhoto, IconTrash } from "@tabler/icons-react";
import { usePromptCard } from "@/src/system/molecules/Cards/hooks/usePromptCard";
import { PromptCardActions } from "../Cards/PromptCardActions";
import { LazyImage } from "../Media/LazyImage";
import { PromptCardSnippet } from "../Cards/PromptCardSnippet";
import { SavedPrompt } from "@/src/types/models";
import { Tooltip } from "../../atoms/Tooltip/Tooltip";
import { RichPromptTooltipContent } from "./RichPromptTooltipContent";

interface PromptCardProps {
  item: SavedPrompt;
  directories?: any[];
  onAssign?: (promptId: string, dirId: string) => void;
  onDelete?: (id: string) => void;
  lang: string;
  authorUsername: string;
  isStudio?: boolean;
  index: number;
  isPriority?: boolean;
}

export function PromptCard({
  item,
  directories,
  onAssign,
  onDelete,
  lang,
  authorUsername,
  isStudio = false,
  index,
  isPriority = false,
}: PromptCardProps) {
  const { setIsHovered, isMenuOpen, setIsMenuOpen, copied, handleCopy } = usePromptCard();
  const href = `/${lang}/${authorUsername}/p/${item.id}${isStudio ? "?from=studio" : ""}`;

  return (
    <div
      className="group relative flex flex-col h-full bg-background rounded-xl border border-border/50 shadow-xs hover:shadow-md hover:border-border transition-all duration-200 overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setIsMenuOpen(false);
      }}
    >
      <div className="absolute top-2 right-2 z-30 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        {onDelete && (
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onDelete(String(item.id));
            }}
            className="p-1.5 bg-background/90 backdrop-blur-sm border border-border/50 text-red-500 hover:bg-red-500/10 hover:text-red-600 rounded-md transition-colors shadow-sm"
            aria-label="Eliminar prompt"
          >
            <IconTrash size={16} />
          </button>
        )}
        <PromptCardActions
          item={item}
          directories={directories}
          onAssign={onAssign}
          isOpen={isMenuOpen}
          setIsOpen={setIsMenuOpen}
        />
      </div>

      <Tooltip
        content={<RichPromptTooltipContent prompt={item} />}
        side="left"
        delayDuration={350}
        variant="rich"
      >
        <Link href={href} className="relative flex flex-col h-full z-10 flex-1">
          <div className="relative aspect-4/5 w-full overflow-hidden bg-muted/20 border-b border-border/30">
            {item.image_url ? (
              <LazyImage
                src={item.image_url}
                alt={item.title || "Prompt image"}
                index={index}
                className="w-full h-full object-cover transition-transform duration-300 ease-out group-hover:scale-[1.02]"
                priority={isPriority}
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground/20">
                <IconPhoto size={32} stroke={1.5} />
              </div>
            )}

            <div className="absolute inset-x-0 bottom-0 p-3 pt-12 bg-linear-to-t from-background/95 via-background/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 ease-in-out flex flex-col gap-1.5 pointer-events-none group-hover:pointer-events-auto">
              <p className="text-[9px] text-muted-foreground font-mono font-semibold uppercase tracking-wider drop-shadow-sm line-clamp-1">
                {item.model || "Base Model"}
              </p>

              <PromptCardSnippet promptText={item.prompt} copied={copied} onCopy={handleCopy} />
            </div>
          </div>

          <div className="p-2.5 sm:p-3 bg-background flex-1 flex items-center">
            <h3 className="font-semibold text-xs sm:text-sm text-foreground/90 w-full truncate">
              {item.software || "Sin título"}
            </h3>
          </div>
        </Link>
      </Tooltip>
    </div>
  );
}
