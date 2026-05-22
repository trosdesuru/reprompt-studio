"use client";

import React, { memo } from "react";
import Link from "next/link";

import { IconPhoto, IconCheck } from "@tabler/icons-react";
import { usePromptCard } from "@/src/system/molecules/Cards/hooks/usePromptCard";
import { usePromptDnd } from "@/src/features/studio/hooks/usePromptDnd";
import { SavedPrompt } from "@/src/types/models";
import { usePromptQueue } from "@/src/store/usePromptQueue";
import { useAuthStore } from "@/src/store/authStore";
import { useStudioUI } from "@/src/store/useStudioUI";
import { LazyImage } from "@/src/system/molecules/Media/LazyImage";
import { PromptCardActions } from "@/src/system/molecules/Cards/PromptCardActions";

interface Directory {
  id: string;
  name: string;
}

interface PromptListCardProps {
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

const getCardStyles = (isDeleting: boolean, isDragging: boolean, isSelected: boolean) => {
  if (isDeleting)
    return "opacity-0 scale-95 border-destructive bg-destructive/10 grayscale blur-sm pointer-events-none";
  if (isDragging) return "border-accent ring-1 ring-accent bg-accent/5 scale-[0.99]";
  if (isSelected) return "border-destructive ring-1 ring-destructive bg-destructive/5 shadow-sm";
  return "border-border/40 shadow-xs hover:shadow-sm hover:border-border/80 bg-background";
};

const getCursorStyle = (isSelectionMode: boolean, isDragging: boolean) => {
  if (isSelectionMode) return "pointer";
  return isDragging ? "grabbing" : "grab";
};

const renderSelectionIndicator = (isSelected: boolean, isSelectionMode: boolean) => {
  if (isSelected) {
    return (
      <div className="shrink-0 bg-destructive text-white p-1 rounded-md shadow-xs animate-in fade-in zoom-in-75">
        <IconCheck size={16} stroke={3} />
      </div>
    );
  }
  if (isSelectionMode) {
    return (
      <div className="shrink-0 w-6 h-6 border-2 border-border/60 rounded-md group-hover:border-muted-foreground/60 transition-colors" />
    );
  }
  return null;
};

function PromptListCardComponent({
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
}: Readonly<PromptListCardProps>) {
  const { setIsHovered, isMenuOpen, setIsMenuOpen } = usePromptCard();
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

  const cardClasses = `group relative flex items-center w-full gap-4 p-2 pl-3 rounded-xl border transition-all duration-200 min-h-18 overflow-hidden ${getCardStyles(isDeleting, isDragging, isSelected)}`;

  return (
    <article
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      style={{
        opacity: isDragging ? 0.3 : 1,
        cursor: getCursorStyle(isSelectionMode, isDragging),
      }}
      className={cardClasses}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setIsMenuOpen(false);
      }}
    >
      {renderSelectionIndicator(isSelected, isSelectionMode)}

      <Link
        href={href}
        onClick={handleCardClick}
        className="flex flex-1 items-center gap-4 min-w-0"
      >
        <div className="relative w-12 h-14 shrink-0 overflow-hidden bg-muted/10 rounded-lg border border-border/20">
          {item.image_url ? (
            <LazyImage
              src={item.image_url}
              alt={item.title || "Prompt list item"}
              index={index}
              className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
              priority={isPriority}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground/20">
              <IconPhoto size={20} stroke={1.5} />
            </div>
          )}
        </div>

        <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-6 min-w-0 items-center">
          <div className="min-w-0">
            <h4
              className={`font-bold font-mono text-xs truncate tracking-wide ${isSelected ? "text-destructive" : "text-foreground/90"}`}
            >
              {(item.software || "Sin título").toUpperCase()}
            </h4>
            <span className="text-[10px] text-muted-foreground/60 font-mono font-medium tracking-tight md:hidden">
              {item.model || "Base Model"}
            </span>
          </div>

          <div className="md:col-span-2 min-w-0 pr-4">
            <p className="text-xs text-muted-foreground font-mono truncate max-w-full leading-relaxed group-hover:text-foreground/70 transition-colors">
              {item.prompt}
            </p>
          </div>
        </div>

        <div className="hidden md:block shrink-0 w-32 min-w-0 text-left font-mono">
          <span className="text-[10px] bg-muted/40 text-muted-foreground/80 px-2 py-0.5 rounded border border-border/30 font-semibold uppercase tracking-wider block truncate text-center">
            {item.model || "Base Model"}
          </span>
        </div>
      </Link>

      <div className="shrink-0 w-10 h-10 flex items-center justify-center relative z-30">
        <div
          className={`transition-opacity duration-150 ${isMenuOpen ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}
        >
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
    </article>
  );
}

const PromptListCard = memo(PromptListCardComponent, (prevProps, nextProps) => {
  return prevProps.item.id === nextProps.item.id && prevProps.isStudio === nextProps.isStudio;
});

PromptListCard.displayName = "PromptListCard";

export { PromptListCard };
