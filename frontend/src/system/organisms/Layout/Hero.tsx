"use client";

import { Heading } from "@/src/system/atoms/Heading/Heading";

export function Hero() {
  return (
    <div className="w-full py-12 md:py-20 flex flex-col items-center justify-center text-center px-4 animate-in fade-in duration-700">
      <Heading level="h1" className="mb-4">
        Inspírate. Extrae. Crea.
      </Heading>
      <Heading level="h3" className="text-muted-foreground font-normal max-w-3xl text-balance">
        Explora miles de imágenes y descubre los prompts exactos que las generaron. Sin ruido,
        directo a la fuente.
      </Heading>
    </div>
  );
}
