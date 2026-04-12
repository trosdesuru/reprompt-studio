"use client";

import React from "react";
import { MediaCardData, MediaVariant } from "@/src/types/models";
import { MediaCover } from "@/src/system/atoms/MediaCover";
import { MediaOverlay } from "@/src/system/molecules/MediaOverlay";
import { cn } from "@/src/utils/lib/cn";

interface UniversalMediaCardProps {
  data: MediaCardData;
  variant?: MediaVariant;
  className?: string;
  onClick?: () => void;
  onDownload?: () => void;
}

export function UniversalMediaCard({
  data,
  variant = "gallery",
  className,
  onClick,
  onDownload,
}: UniversalMediaCardProps) {
  if (!data) return null;

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDownload?.();
  };

  return (
    <div
      className={cn(
        "group relative w-full overflow-hidden rounded-xl cursor-pointer border border-border/10 shadow-sm hover:shadow-md transition-all duration-300",
        variant === "viewer" ? "bg-black/20" : "bg-muted/20",
        className,
      )}
      onClick={onClick}
    >
      <MediaCover src={data.imageUrl} alt={data.title} />

      {data.imageUrl && (
        <MediaOverlay
          title={data.title}
          prompt={data.prompt}
          tags={data.tags}
          variant={variant}
          onDownload={onDownload ? handleDownload : undefined}
        />
      )}
    </div>
  );
}
