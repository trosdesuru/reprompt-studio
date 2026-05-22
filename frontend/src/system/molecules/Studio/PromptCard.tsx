"use client";

import React, { memo } from "react";
import Link from "next/link";
import { IconPhoto, IconCheck } from "@tabler/icons-react";
import { usePromptCard } from "@/src/system/molecules/Cards/hooks/usePromptCard";
import { usePromptDnd } from "@/src/features/studio/hooks/usePromptDnd";
import { PromptCardActions } from "../Cards/PromptCardActions";
import { LazyImage } from "../Media/LazyImage";
import { PromptCardSnippet } from "../Cards/PromptCardSnippet";
import { SavedPrompt } from "@/src/types/models";
import { Tooltip } from "../../atoms/Tooltip/Tooltip";
import { RichPromptTooltipContent } from "./RichPromptTooltipContent";
import { usePromptQueue } from "@/src/store/usePromptQueue";
import { useAuthStore } from "@/src/store/authStore";
import { useStudioUI } from "@/src/store/useStudioUI";

interface Directory {
  id: string;
  name: string;
}

interface PromptCardProps {
  item: SavedPrompt;
  directories?: Directory[];
  onAssign?: (promptId: string, dirId: string) => void;
  onDelete?: (id: string) => void;
  lang: string;
  authorUsername: string;
  isStudio?: boolean;
  index: number;
  isPriority?: boolean;
  queueItems?: { id: string; username: string }[];
}

function CardContent({ item, index, isPriority, copied, handleCopy, isSelected }: any) {
  return (
    <>
      <div
        className={`relative aspect-4/5 w-full overflow-hidden bg-muted/20 border-b border-border/30 transition-all duration-300 ${isSelected ? "p-1 rounded-t-lg" : ""}`}
      >
        {item.image_url ? (
          <LazyImage
            src={item.image_url}
            alt={item.title || "Prompt image"}
            index={index}
            className={`w-full h-full object-cover transition-transform duration-300 ease-out ${isSelected ? "rounded-t-md" : "group-hover:scale-[1.02]"}`}
            priority={isPriority}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground/20">
            <IconPhoto size={32} stroke={1.5} />
          </div>
        )}
        <div className="absolute inset-x-0 bottom-0 p-3 pt-12 bg-linear-to-t from-background/95 via-background/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 ease-in-out flex flex-col gap-1.5 pointer-events-none group-hover:pointer-events-auto z-20">
          <p className="text-[9px] text-muted-foreground font-mono font-semibold uppercase tracking-wider drop-shadow-sm line-clamp-1">
            {item.model || "Base Model"}
          </p>
          <PromptCardSnippet promptText={item.prompt} copied={copied} onCopy={handleCopy} />
        </div>
      </div>
      <div
        className={`p-2.5 sm:p-3 flex-1 flex items-center transition-colors duration-300 ${isSelected ? "bg-destructive/5" : "bg-background"}`}
      >
        <h3
          className={`font-semibold text-xs sm:text-sm w-full truncate ${isSelected ? "text-destructive" : "text-foreground/90"}`}
        >
          {item.software || "Sin título"}
        </h3>
      </div>
    </>
  );
}

function PromptCardComponent({
  item,
  directories,
  onAssign,
  onDelete,
  lang,
  authorUsername,
  isStudio = false,
  index,
  isPriority = false,
  queueItems = [],
}: PromptCardProps) {
  const { setIsHovered, isMenuOpen, setIsMenuOpen, copied, handleCopy } = usePromptCard();
  const { attributes, listeners, setNodeRef, isDragging } = usePromptDnd(item);
  const href = `/${lang}/${authorUsername}/p/${item.id}${isStudio ? "?from=studio" : ""}`;
  const setQueue = usePromptQueue((state) => state.setQueue);

  const { user } = useAuthStore();
  const isOwner = user?.username === authorUsername;

  const isSelectionMode = useStudioUI((state) => state.isSelectionMode);
  const isSelected = useStudioUI((state) => state.selectedPromptIds.includes(String(item.id)));
  const isDeleting = useStudioUI((state) => state.deletingIds.includes(String(item.id)));
  const togglePromptSelection = useStudioUI((state) => state.togglePromptSelection);

  const handleCardClick = (e: React.MouseEvent) => {
    if (isSelectionMode) {
      e.preventDefault();
      togglePromptSelection(String(item.id));
    } else if (queueItems.length > 0) {
      setQueue(queueItems);
    }
  };

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      style={{
        opacity: isDragging ? 0.3 : 1,
        cursor: isSelectionMode ? "pointer" : isDragging ? "grabbing" : "grab",
      }}
      className={`group relative flex flex-col h-full rounded-xl transition-all duration-300 overflow-hidden ${
        isDeleting
          ? "opacity-0 scale-90 border-destructive ring-2 ring-destructive bg-destructive/30 grayscale blur-sm z-50 pointer-events-none"
          : isDragging
            ? "border-accent ring-2 ring-accent scale-95"
            : isSelected
              ? "border-destructive ring-2 ring-destructive bg-destructive/10 scale-[0.98] shadow-lg"
              : "border-border/50 shadow-xs hover:shadow-md hover:border-border bg-background"
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setIsMenuOpen(false);
      }}
    >
      {isSelected && (
        <div className="absolute top-2 left-2 z-40 bg-destructive text-white p-1 rounded-md shadow-md animate-in fade-in zoom-in">
          <IconCheck size={20} stroke={3} />
        </div>
      )}

      <div
        className={`absolute top-0 right-0 bottom-0 left-0 pointer-events-none z-30 transition-opacity duration-200 ${isMenuOpen ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}
      >
        <div className="pointer-events-auto">
          <PromptCardActions
            item={item}
            directories={directories}
            onAssign={onAssign}
            onDelete={onDelete}
            isOpen={isMenuOpen}
            setIsOpen={setIsMenuOpen}
            isOwner={isOwner}
          />
        </div>
      </div>

      <Tooltip
        content={isSelectionMode ? null : <RichPromptTooltipContent prompt={item} />}
        side="left"
        delayDuration={350}
        variant="rich"
      >
        <Link
          href={href}
          onClick={handleCardClick}
          className="relative flex flex-col h-full z-10 flex-1"
        >
          <CardContent
            item={item}
            index={index}
            isPriority={isPriority}
            copied={copied}
            handleCopy={handleCopy}
            isSelected={isSelected}
          />
        </Link>
      </Tooltip>
    </div>
  );
}

const PromptCard = memo(PromptCardComponent, (prevProps, nextProps) => {
  return prevProps.item.id === nextProps.item.id && prevProps.isStudio === nextProps.isStudio;
});

PromptCard.displayName = "PromptCard";

export { PromptCard };
