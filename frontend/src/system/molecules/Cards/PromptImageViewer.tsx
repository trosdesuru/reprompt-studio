"use client";

import { IconPhotoOff } from "@tabler/icons-react";
import { LazyImage } from "@/src/system/molecules/Media/LazyImage";
import { FadeIn } from "@/src/system/atoms/FadeIn";

interface PromptImageViewerProps {
  imageUrl: string | null;
  altText: string;
}

export function PromptImageViewer({ imageUrl, altText }: PromptImageViewerProps) {
  return (
    <FadeIn delay={0.1}>
      <div className="relative w-full aspect-square md:aspect-4/5 bg-muted/10 neo-border neo-shadow overflow-hidden group">
        {imageUrl ? (
          <LazyImage
            src={imageUrl}
            alt={altText}
            priority={true}
            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.02]"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground/40 bg-muted/5">
            <IconPhotoOff size={64} stroke={1} className="mb-4" />
            <span className="font-mono text-xs uppercase tracking-widest text-center px-4">
              Metadata sin imagen adjunta
            </span>
          </div>
        )}
      </div>
    </FadeIn>
  );
}
