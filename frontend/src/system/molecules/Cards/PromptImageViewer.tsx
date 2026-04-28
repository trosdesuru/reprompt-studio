"use client";

import { IconPhotoOff } from "@tabler/icons-react";
import { LazyImage } from "@/src/system/molecules/Media/LazyImage";
import { FadeIn } from "@/src/system/atoms/Animations/FadeIn";

interface PromptImageViewerProps {
  imageUrl: string | null;
  altText: string;
  width?: number | null;
  height?: number | null;
}

export function PromptImageViewer({ imageUrl, altText }: PromptImageViewerProps) {
  return (
    <FadeIn delay={0.1} className="w-full h-full">
      <div className="relative w-full h-full flex items-center justify-center">
        {imageUrl ? (
          <LazyImage
            src={imageUrl}
            alt={altText}
            priority={true}
            className="w-full h-full object-contain transition-transform duration-700 ease-out"
            sizes="(max-width: 1200px) 100vw, 60vw"
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-muted-foreground/40 w-full h-full min-h-75">
            <IconPhotoOff size={64} stroke={1} className="mb-4" />
            <span className="font-mono text-xs uppercase tracking-widest text-center px-4">
              Metadata sin imagen
            </span>
          </div>
        )}
      </div>
    </FadeIn>
  );
}
