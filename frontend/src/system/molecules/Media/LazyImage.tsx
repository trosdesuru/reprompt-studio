"use client";

import Image from "next/image";
import { useState } from "react";

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
  index?: number;
}

export function LazyImage({
  src,
  alt,
  className = "",
  priority = false,
  sizes = "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw",
}: LazyImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-muted/10 neo-border">
        <span className="text-[10px] font-mono text-muted-foreground uppercase">Error visual</span>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full overflow-hidden bg-muted/10">
      <div
        className={`absolute inset-0 flex items-center justify-center bg-muted/20 transition-opacity duration-500 z-0 ${
          isLoaded ? "opacity-0" : "opacity-100"
        }`}
      >
        <img
          src="/logo-white.png"
          alt="Cargando..."
          className="w-6 h-6 object-contain opacity-20 block dark:hidden"
        />
        <img
          src="/logo-black.png"
          alt="Cargando..."
          className="w-6 h-6 object-contain opacity-80 hidden dark:block"
        />
      </div>

      <Image
        src={src}
        alt={alt}
        sizes={sizes}
        fill
        priority={priority}
        quality={75}
        loading={priority ? undefined : "lazy"}
        onLoad={() => {
          setIsLoaded(true);
        }}
        onError={() => setHasError(true)}
        className={`
          absolute inset-0 w-full h-full object-cover z-10
          transition-all duration-700 ease-in-out
          ${isLoaded ? "opacity-100 blur-0 scale-100" : "opacity-0 blur-md scale-110"}
          ${className}
        `}
      />
    </div>
  );
}
