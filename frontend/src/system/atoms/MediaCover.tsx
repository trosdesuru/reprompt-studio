"use client";

import Image from "next/image";
import { cn } from "@/src/utils/lib/cn";
import { AspectRatio } from "@/src/types/gallery";

interface MediaCoverProps {
  src: string | null | undefined;
  alt: string;
  aspectRatio?: AspectRatio;
}

export function MediaCover({ src, alt, aspectRatio = "portrait" }: MediaCoverProps) {
  // 🛡️ FIX: Si no hay src, renderizamos un placeholder elegante en lugar de romper Next.js
  if (!src || src === "" || typeof src !== "string") {
    return (
      <div className={cn(
        "relative w-full flex items-center justify-center bg-muted/20 animate-pulse",
        aspectRatio === "portrait" ? "aspect-2/3" : 
        aspectRatio === "landscape" ? "aspect-3/2" : 
        aspectRatio === "square" ? "aspect-square" : "h-96"
      )}>
        <div className="flex flex-col items-center gap-2">
          <div className="w-8 h-8 rounded-full border-2 border-muted border-t-var(--accent-color) animate-spin" />
          <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/50">Cargando Media...</span>
        </div>
      </div>
    );
  }

  const ratioClasses = {
    portrait: "aspect-[2/3]",
    landscape: "aspect-[3/2]",
    square: "aspect-square",
    auto: "aspect-auto w-full min-h-[300px]",
  };

  return (
    <div className={cn("relative w-full overflow-hidden bg-muted/20", ratioClasses[aspectRatio])}>
      <Image
        src={src}
        alt={alt || "Media content"}
        fill
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 70vw, 50vw"
        unoptimized
        className="object-contain md:object-cover transition-transform duration-700 ease-out group-hover:scale-105"
      />
    </div>
  );
}
