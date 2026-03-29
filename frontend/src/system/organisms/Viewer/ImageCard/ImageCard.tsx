"use client";

import { StandardImageCard } from "@/src/components/StandardImageCard";
import { useImageCard } from "./useImageCard";
import { ImageCardProps } from "./ImageCard.types";

export function ImageCard({ item, index, galleryTitle, onOpenImage }: ImageCardProps) {
  const { downloadStatus, handleDownload } = useImageCard(item.page_url, index, galleryTitle);

  const isValidImage = item && typeof item.thumb_url === "string" && item.thumb_url.length > 5;
  const isSprite = Boolean(item.offset && item.offset.trim() !== "");

  return (
    <StandardImageCard
      imageUrl={isValidImage ? item.thumb_url : ""}
      index={index}
      isSprite={isSprite}
      spriteOffset={item.offset}
      spriteWidth={item.width}
      spriteHeight={item.height}
      onImageClick={onOpenImage}
      onDownloadClick={handleDownload}
      downloadStatus={downloadStatus}
    />
  );
}
