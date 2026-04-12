"use client";

import Image from "next/image";
import { cn } from "@/src/utils/lib/cn";

interface MediaCoverProps {
  src: string | null | undefined;
  alt: string;
}

export function MediaCover({ src, alt }: MediaCoverProps) {
  if (!src || src === "" || typeof src !== "string") {
    return (
      <div className="relative w-full h-[50vh] flex items-center justify-center bg-muted/20 animate-pulse rounded-2xl border border-border/50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full border-4 border-muted border-t-var(--accent-color) animate-spin" />
          <span className="text-xs font-black uppercase tracking-widest text-muted-foreground/50">
            Cargando Media...
          </span>
        </div>
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt || "Media content"}
      width={1600}
      height={1200}
      className={cn(
        "block mx-auto rounded-2xl",
        "w-full h-auto",
        "max-h-[70vh] md:max-h-[80vh]",
        "object-contain md:object-contain",
        "transition-transform duration-700 ease-out group-hover:scale-[1.02]",
      )}
      quality={90}
      decoding="async"
    />
  );
}
