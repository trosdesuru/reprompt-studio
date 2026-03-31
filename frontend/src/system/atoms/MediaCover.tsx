"use client";

import Image from "next/image";
import { cn } from "@/src/utils/lib/cn";
import { AspectRatio } from "@/src/types/gallery";

interface MediaCoverProps {
  src: string;
  alt: string;
  aspectRatio?: AspectRatio;
}

export function MediaCover({ src, alt, aspectRatio = "portrait" }: MediaCoverProps) {
  // Traducimos el aspect ratio semántico a clases de Tailwind
  const ratioClasses = {
    portrait: "aspect-[2/3]",
    landscape: "aspect-[3/2]",
    square: "aspect-square",
    auto: "aspect-auto h-full",
  };

  return (
    <div className={cn("relative w-full overflow-hidden bg-muted/20", ratioClasses[aspectRatio])}>
      <Image
        src={src}
        alt={alt}
        fill
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        unoptimized // Evita errores de Next.js Image con dominios externos no configurados
        className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
      />
    </div>
  );
}
