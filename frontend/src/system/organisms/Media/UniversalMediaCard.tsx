"use client";

import React from "react";
import { MediaCardData, MediaVariant } from "@/src/types/gallery";
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
  onDownload 
}: UniversalMediaCardProps) {
  
  // Detenemos la propagación para que el click en "descargar" no abra el visor
  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDownload?.();
  };

  return (
    <div 
      className={cn(
        "group relative w-full overflow-hidden rounded-xl cursor-pointer border border-border/10 shadow-sm hover:shadow-md transition-all duration-300",
        variant === "viewer" ? "bg-black/50" : "bg-muted/20",
        className
      )}
      onClick={onClick}
    >
      <MediaCover 
        src={data.imageUrl} 
        alt={data.title} 
        aspectRatio={data.aspectRatio} 
      />
      
      <MediaOverlay 
        title={data.title}
        prompt={data.prompt}
        tags={data.tags}
        variant={variant}
        onDownload={onDownload ? handleDownload : undefined}
      />
    </div>
  );
}
