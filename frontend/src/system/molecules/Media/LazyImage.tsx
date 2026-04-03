"use client";

import { useState } from "react";

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
}

export function LazyImage({ src, alt, className = "" }: LazyImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div className="relative w-full h-full overflow-hidden bg-muted/10">
      <div
        className={`absolute inset-0 bg-muted/20 animate-pulse transition-opacity duration-500 ${
          isLoaded ? "opacity-0" : "opacity-100"
        }`}
      />

      <img
        src={src}
        alt={alt}
        loading="lazy"
        onLoad={() => setIsLoaded(true)}
        className={`
          w-full h-full object-cover
          transition-all duration-700 ease-in-out
          ${isLoaded ? "opacity-100 blur-0" : "opacity-0 blur-md scale-106"}
          ${className}
        `}
      />
    </div>
  );
}
